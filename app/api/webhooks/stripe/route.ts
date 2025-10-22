// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/billing/stripe';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/billing/plans';
import { getUsageLimit, type Plan } from '@/lib/usage/limits';
import { getBillingRecipientByStripeCustomer, validateBillingRecipient } from '@/lib/billing/recipient';
import { sendSecureBillingEmailSafe } from '@/lib/billing/secure-email';
import { 
  sendPaymentFailedEmail, 
  sendSubscriptionCancelledEmail,
  sendSubscriptionUpgradedEmail,
  sendTrialConvertedEmail,
  sendTrialCancelledEmail,
  sendWelcomeEmail,
  sendOnboardingEmail,
  sendPaymentActionRequiredEmail,
} from '@/lib/email/service';

export const runtime = 'nodejs'; // ensure Node (so we can read raw body)

// Social Echo Blueprint v8.6 — Stripe-event-driven notifications only

function mapPlanFromPriceId(priceId?: string) {
  if (!priceId) return undefined;
  const entry = Object.entries(PLANS).find(([, v]) => v.priceId === priceId);
  if (!entry) return undefined;
  const [, v] = entry;
  return { planLabel: v.label, usageLimit: v.usageLimit };
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log('[webhook] Received event:', event.type, 'ID:', event.id);

  // Store event type to avoid TypeScript narrowing issues in nested conditions
  const eventType = event.type;

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as any; // Stripe.Checkout.Session
      const email = s.customer_details?.email || s.customer_email;
      console.log('[webhook] Checkout completed for email:', email);
      
      if (!email) {
        console.error('[webhook] No email found in checkout session');
        break;
      }

      const user = await prisma.user.findUnique({ 
        where: { email }, 
        include: { subscription: true }
      });
      
      if (!user) {
        console.error('[webhook] User not found for email:', email);
        break;
      }
      
      console.log('[webhook] Processing subscription for user:', user.id, user.role);

      const subId = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id;
      const customerId = typeof s.customer === 'string' ? s.customer : s.customer?.id;

      // Try to map plan from the session's first item (optional)
      let priceId: string | undefined;
      // Some sessions embed line items via expand; if not present we'll set plan on subscription.updated
      if (s?.lines?.data?.[0]?.price?.id) priceId = s.lines.data[0].price.id;

      const mapped = mapPlanFromPriceId(priceId);
      
      // Detect if this is an agency plan
      const isAgencyPlan = priceId === 'price_1SFCsCLCgRgCwthBJ4l3xVFT' || 
                          mapped?.planLabel?.toLowerCase().includes('agency');

      // Fetch full subscription details to check trial status
      let stripeSubscription;
      let subscriptionStatus = 'active';
      let trialEnd: Date | null = null;
      
      if (subId) {
        try {
          stripeSubscription = await stripe.subscriptions.retrieve(subId);
          subscriptionStatus = stripeSubscription.status;
          if (stripeSubscription.trial_end) {
            trialEnd = new Date(stripeSubscription.trial_end * 1000);
          }
        } catch (err) {
          console.error('[webhook] Failed to retrieve subscription:', err);
        }
      }

      console.log('[webhook] Subscription status:', subscriptionStatus, 'Trial end:', trialEnd);

      if (isAgencyPlan) {
        // Agency plan: create agency and agency subscription
        console.log('[webhook] Agency plan detected, creating agency');
        
        // Create agency if it doesn't exist
        let agency = await prisma.agency.findFirst({ where: { ownerId: user.id } });
        
        if (!agency) {
          // Generate slug from name
          const baseSlug = (user.name || user.email || 'agency')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          const slug = `${baseSlug}-${Date.now()}`;
          
          agency = await prisma.agency.create({
            data: {
              name: `${user.name || user.email}'s Agency`,
              slug,
              ownerId: user.id,
              stripeCustomerId: customerId,
            }
          });
          
          console.log('[webhook] Created agency:', agency.id);
        } else {
          // Update agency with Stripe customer ID if not set
          if (!agency.stripeCustomerId) {
            await prisma.agency.update({
              where: { id: agency.id },
              data: { stripeCustomerId: customerId }
            });
          }
        }
        
        // Note: Agency subscriptions are handled separately
        // This is just for user role upgrade
        if (false) {
          // Placeholder for future agency subscription logic
          
          console.log('[webhook] Created agency subscription');
        }
        
        // Update user role to AGENCY_ADMIN
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'AGENCY_ADMIN' }
        });
        
        // Log the upgrade
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: 'AGENCY_UPGRADE',
            meta: {
              message: 'User upgraded to Agency plan',
              priceId,
              subscriptionId: subId
            }
          }
        }).catch(err => console.error('[webhook] Failed to create audit log:', err));
      }
      
      // NOTE: Email sending removed from checkout.session.completed per v7.0 blueprint
      // Emails are sent ONLY from customer.subscription.created after full activation
      // This event only links the session to customer/subscription - no emails
      console.log('[webhook] Checkout session linked to subscription - emails will be sent by subscription.created event');
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      
      console.log('[webhook] Subscription event:', event.type, 'ID:', sub.id);
      
      // Use centralized sync function (source of truth)
      const { syncSubscriptionFromStripe } = await import('@/lib/billing/sync-subscription');
      const result = await syncSubscriptionFromStripe(sub);
      
      if (!result.success) {
        console.error('[webhook] Failed to sync subscription:', result.error);
        break;
      }
      
      console.log('[webhook] Subscription synced:', {
        userId: result.userId,
        plan: result.plan,
        status: result.status,
      });
      
      // Fetch updated subscription from database (already synced above)
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id || '';
      const syncedSub = await prisma.subscription.findFirst({ 
        where: { stripeCustomerId: customerId },
        include: { user: true }
      });
      
      if (syncedSub) {
        // Note: oldPlan/oldStatus are from BEFORE the sync, newPlan is AFTER
        // For email logic, we need to track the change
        const newPlan = result.plan || syncedSub.plan;
        
        // Subscription already synced by syncSubscriptionFromStripe above
        // Just handle emails based on the changes
        
        // Use eventType instead of event.type to avoid TypeScript narrowing issues
        if (eventType === 'customer.subscription.created') {
          // Send welcome email ONLY on subscription creation (after payment confirmed)
          // This is the ONLY place where welcome email is sent
          console.log('[webhook] Sending activation emails for new subscription:', {
            customerId,
            plan: newPlan,
            eventId: event.id,
          });
          
          // Send welcome email (idempotent via EmailLog)
          sendSecureBillingEmailSafe({
            stripeCustomerId: customerId,
            eventId: event.id,
            type: 'welcome',
            sendFn: sendWelcomeEmail,
          });
          
          // Send onboarding email for all plans (idempotent via EmailLog)
          sendSecureBillingEmailSafe({
            stripeCustomerId: customerId,
            eventId: event.id,
            type: 'onboarding',
            sendFn: sendOnboardingEmail,
          });
        }
        // REMOVED: subscription_upgraded email from here
        // Upgrade emails are now sent ONLY from invoice.payment_succeeded
        // This prevents false "upgrade" emails when subscription is updated for other reasons
      } else {
        console.warn('[webhook] No subscription found for customer:', customerId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id || '';
      
      console.log('[webhook] Subscription deleted for customer:', customerId);
      
      const userSub = await prisma.subscription.findFirst({ 
        where: { stripeCustomerId: customerId },
        include: { user: true }
      });
      
      if (userSub) {
        console.log('[webhook] Cancelling subscription:', userSub.id);
        
        const wasTrial = userSub.status === 'trialing' || userSub.status === 'trial';
        
        await prisma.subscription.update({
          where: { id: userSub.id },
          data: { 
            status: 'canceled',
            cancelAtPeriodEnd: false,
          },
        });
        
        // Send appropriate cancellation email based on trial status
        if (wasTrial) {
          sendSecureBillingEmailSafe({
            stripeCustomerId: customerId,
            eventId: event.id,
            type: 'trial_cancelled',
            sendFn: sendTrialCancelledEmail,
          });
        } else {
          sendSecureBillingEmailSafe({
            stripeCustomerId: customerId,
            eventId: event.id,
            type: 'cancellation',
            sendFn: sendSubscriptionCancelledEmail,
          });
        }
      } else {
        console.warn('[webhook] No subscription found for deleted customer:', customerId);
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const inv = event.data.object as any;
      const customerId = String(inv.customer);
      const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
      const invoiceId = inv.id;
      const paymentIntentId = typeof inv.payment_intent === 'string' ? inv.payment_intent : inv.payment_intent?.id;
      
      console.log('[webhook] Payment succeeded:', {
        customer: customerId,
        invoice: invoiceId,
        paymentIntent: paymentIntentId,
        amount: inv.amount_paid,
      });
      
      const userSub = await prisma.subscription.findFirst({ 
        where: { stripeCustomerId: customerId },
        include: { user: true }
      });
      
      if (!userSub) {
        console.warn('[webhook] No subscription found for customer:', customerId);
        break;
      }

      // Check if this is a trial conversion (trial → active)
      if (userSub.status === 'trialing' || userSub.status === 'trial') {
        console.log('[webhook] Converting trial to active subscription:', userSub.id, 'from status:', userSub.status);
        
        // Validate subId before fetching
        if (!subId) {
          console.error('[webhook] Missing subscription ID in invoice, using stripeSubscriptionId from DB:', userSub.stripeSubscriptionId);
          if (!userSub.stripeSubscriptionId) {
            console.error('[webhook] No subscription ID available, skipping trial conversion');
            break;
          }
        }
        
        // Fetch subscription to get current period
        const subscriptionId = subId || userSub.stripeSubscriptionId;
        const stripeSubResponse = await stripe.subscriptions.retrieve(subscriptionId as string);
        
        // Extract period fields directly with type assertion
        const periodStart = (stripeSubResponse as any).current_period_start;
        const periodEnd = (stripeSubResponse as any).current_period_end;
        
        // Defensive check for period fields
        if (typeof periodStart === 'number' && typeof periodEnd === 'number') {
          await prisma.subscription.update({
            where: { id: userSub.id },
            data: { 
              status: 'active',
              currentPeriodStart: new Date(periodStart * 1000),
              currentPeriodEnd: new Date(periodEnd * 1000),
            },
          });
        } else {
          console.error('[webhook] Stripe subscription missing period fields', { 
            id: (stripeSubResponse as any).id 
          });
        }
        
        // Send trial conversion email
        const planName = userSub.plan.charAt(0).toUpperCase() + userSub.plan.slice(1);
        
        sendSecureBillingEmailSafe({
          stripeCustomerId: customerId,
          eventId: event.id,
          type: 'trial_converted',
          sendFn: sendTrialConvertedEmail,
          sendArgs: [planName],
        });
      }
      
      // Check if this is an upgrade payment (plan change)
      // We detect this by checking if the invoice has metadata or if the subscription was recently updated
      // A more reliable way is to check if the previous_attributes in subscription.updated had a different plan
      // For now, we'll check if the subscription was updated recently (within last 5 minutes)
      if (subId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subId, {
            expand: ['items.data.price']
          });
          
          const currentPriceId = subscription.items.data[0]?.price?.id;
          
          // Check if this price ID is different from what we have in DB
          // This indicates an upgrade/downgrade just happened
          const currentPlanFromPrice = mapPlanFromPriceId(currentPriceId);
          
          if (currentPlanFromPrice && currentPlanFromPrice.planLabel.toLowerCase() !== userSub.plan) {
            // Plan changed - this is an upgrade/downgrade
            const oldPlanName = userSub.plan.charAt(0).toUpperCase() + userSub.plan.slice(1);
            const newPlanName = currentPlanFromPrice.planLabel;
            
            console.log('[webhook] Plan change detected:', {
              oldPlan: oldPlanName,
              newPlan: newPlanName,
              invoice: invoiceId,
              paymentIntent: paymentIntentId,
            });
            
            // Send upgrade email (idempotent via event ID)
            sendSecureBillingEmailSafe({
              stripeCustomerId: customerId,
              eventId: event.id,
              type: 'subscription_upgraded',
              sendFn: sendSubscriptionUpgradedEmail,
              sendArgs: [oldPlanName, newPlanName],
            });
            
            // Update the plan in our database to match Stripe
            const newPlan = currentPlanFromPrice.planLabel.toLowerCase() as 'starter' | 'pro' | 'agency';
            
            // Clear pending downgrade state if switching to Starter (v8.6)
            const updateData: any = {
              plan: newPlan,
              usageLimit: currentPlanFromPrice.usageLimit,
            };
            
            if (newPlan === 'starter' && userSub.pendingPlan === 'starter') {
              console.log('[webhook] Clearing pending downgrade state - downgrade completed:', {
                userId: userSub.userId,
                scheduleId: userSub.scheduleId,
              });
              updateData.pendingPlan = null;
              updateData.pendingAt = null;
              updateData.scheduleId = null;
              updateData.cancelAtPeriodEnd = false;
            }
            
            await prisma.subscription.update({
              where: { id: userSub.id },
              data: updateData,
            });
          }
        } catch (err) {
          console.error('[webhook] Failed to check subscription for plan change:', err);
        }
      }
      
      break;
    }

    case 'invoice.payment_failed': {
      const inv = event.data.object as any;
      const customerId = String(inv.customer);
      const invoiceId = inv.id;
      const paymentIntentId = typeof inv.payment_intent === 'string' ? inv.payment_intent : inv.payment_intent?.id;
      
      console.log('[webhook] Payment failed:', {
        customer: customerId,
        invoice: invoiceId,
        paymentIntent: paymentIntentId,
        amount: inv.amount_due,
      });
      
      const userSub = await prisma.subscription.findFirst({ 
        where: { stripeCustomerId: customerId },
        include: { user: true }
      });
      
      if (userSub) {
        console.log('[webhook] Marking subscription as past_due:', userSub.id);
        
        await prisma.subscription.update({
          where: { id: userSub.id },
          data: { status: 'past_due' },
        });
        
        // Send payment failed email (idempotent via event ID)
        const planName = userSub.plan.charAt(0).toUpperCase() + userSub.plan.slice(1);
        
        sendSecureBillingEmailSafe({
          stripeCustomerId: customerId,
          eventId: event.id,
          type: 'payment_failed',
          sendFn: sendPaymentFailedEmail,
          sendArgs: [planName],
        });
      } else {
        console.warn('[webhook] No subscription found for failed payment customer:', customerId);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as any; // Use any to access invoice field
      const customerId = typeof pi.customer === 'string' ? pi.customer : pi.customer?.id || '';
      const invoiceId = typeof pi.invoice === 'string' ? pi.invoice : pi.invoice?.id;
      const paymentIntentId = pi.id;
      
      console.log('[webhook] Payment intent failed:', {
        customer: customerId,
        invoice: invoiceId,
        paymentIntent: paymentIntentId,
        amount: pi.amount,
        error: pi.last_payment_error?.message,
      });
      
      // Only send email if we haven't already sent one for the invoice
      // (invoice.payment_failed will also fire, so we use idempotency to prevent duplicates)
      if (customerId) {
        const userSub = await prisma.subscription.findFirst({ 
          where: { stripeCustomerId: customerId },
          include: { user: true }
        });
        
        if (userSub) {
          const planName = userSub.plan.charAt(0).toUpperCase() + userSub.plan.slice(1);
          
          // This will be deduplicated if invoice.payment_failed already sent an email
          sendSecureBillingEmailSafe({
            stripeCustomerId: customerId,
            eventId: event.id,
            type: 'payment_failed',
            sendFn: sendPaymentFailedEmail,
            sendArgs: [planName],
          });
        }
      }
      break;
    }

    case 'invoice.payment_action_required': {
      const inv = event.data.object as any;
      const customerId = String(inv.customer);
      const invoiceId = inv.id;
      const paymentIntentId = typeof inv.payment_intent === 'string' ? inv.payment_intent : inv.payment_intent?.id;
      
      console.log('[webhook] Payment action required (SCA):', {
        customer: customerId,
        invoice: invoiceId,
        paymentIntent: paymentIntentId,
        amount: inv.amount_due,
      });
      
      const userSub = await prisma.subscription.findFirst({ 
        where: { stripeCustomerId: customerId },
        include: { user: true }
      });
      
      if (userSub) {
        const planName = userSub.plan.charAt(0).toUpperCase() + userSub.plan.slice(1);
        
        // Send authentication required email (NOT a failure email)
        // This is idempotent, so if the user completes auth and we get payment_succeeded,
        // they won't get a duplicate email
        sendSecureBillingEmailSafe({
          stripeCustomerId: customerId,
          eventId: event.id,
          type: 'payment_action_required',
          sendFn: sendPaymentActionRequiredEmail,
          sendArgs: [planName, invoiceId],
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

