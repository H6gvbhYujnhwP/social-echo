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
  sendPaymentSuccessEmail, 
  sendPaymentFailedEmail, 
  sendSubscriptionCancelledEmail,
  sendSubscriptionUpgradedEmail,
  sendTrialStartedEmail,
  sendTrialConvertedEmail,
  sendTrialCancelledEmail,
  sendWelcomeEmail,
  sendOnboardingEmail,
  sendPlanUpgradeEmail
} from '@/lib/email/service';

export const runtime = 'nodejs'; // ensure Node (so we can read raw body)

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
      let trialEnd = null;
      
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

      const subscription = await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subId,
          plan: (mapped?.planLabel || 'starter').toLowerCase(),
          status: subscriptionStatus,
          usageLimit: mapped?.usageLimit ?? 8,
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd || new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
        update: {
          stripeCustomerId: customerId ?? undefined,
          stripeSubscriptionId: subId ?? undefined,
          status: subscriptionStatus,
        },
      });
      
      console.log('[webhook] Subscription created/updated:', subscription.id, subscription.plan, 'isAgency:', isAgencyPlan);
      
      // If this is an agency plan, upgrade user to AGENCY_ADMIN and create Agency record
      if (isAgencyPlan && user.role !== 'AGENCY_ADMIN') {
        console.log('[webhook] Upgrading user to AGENCY_ADMIN and creating Agency record');
        
        // Update user role
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'AGENCY_ADMIN' }
        });
        
        // Create Agency record if it doesn't exist
        const existingAgency = await prisma.agency.findUnique({
          where: { ownerId: user.id }
        });
        
        if (!existingAgency) {
          // Generate a slug from business name or email
          const slugBase = user.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
          let slug = slugBase;
          let counter = 1;
          
          // Ensure unique slug
          while (await prisma.agency.findUnique({ where: { slug } })) {
            slug = `${slugBase}-${counter}`;
            counter++;
          }
          
          await prisma.agency.create({
            data: {
              ownerId: user.id,
              name: user.name || 'My Agency',
              slug,
              plan: 'agency_universal',
              stripeCustomerId: customerId,
              stripeSubscriptionId: subId,
              activeClientCount: 0,
              status: 'active'
            }
          });
          
          console.log('[webhook] Created Agency record with slug:', slug);
        } else {
          // Update existing agency with Stripe IDs
          await prisma.agency.update({
            where: { id: existingAgency.id },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subId,
              status: 'active'
            }
          });
          
          console.log('[webhook] Updated existing Agency record:', existingAgency.id);
        }
        
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
      
      // Send welcome email if not already sent (idempotency guard)
      if (!user.welcomeSentAt) {
        console.log('[webhook] Sending welcome email to:', user.email);
        sendWelcomeEmail(user.email, user.name).then(success => {
          if (success) {
            prisma.user.update({
              where: { id: user.id },
              data: { welcomeSentAt: new Date() }
            }).catch(err => console.error('[webhook] Failed to update welcomeSentAt:', err));
          }
        }).catch(err => 
          console.error('[webhook] Failed to send welcome email:', err)
        );
      } else {
        console.log('[webhook] Welcome email already sent to:', user.email, 'at', user.welcomeSentAt);
      }
      
      // Send appropriate email based on subscription status
      const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
      
      if (subscriptionStatus === 'trialing' && trialEnd) {
        // Trial started - send trial email
        const trialEndFormatted = trialEnd.toLocaleString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        console.log('[webhook] Sending trial started email to:', user.email);
        
        sendTrialStartedEmail(user.email, user.name, trialEndFormatted).catch(err =>
          console.error('[webhook] Failed to send trial started email:', err)
        );
      } else {
        // Regular payment - send payment success email
        const amount = s.amount_total ? `£${(s.amount_total / 100).toFixed(2)}` : 'N/A';
        console.log('[webhook] Sending payment success email to:', user.email);
        
        sendPaymentSuccessEmail(user.email, user.name, planName, amount).catch(err =>
          console.error('[webhook] Failed to send payment success email:', err)
        );
      }
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
          // Send onboarding email for new Starter/Pro subscriptions
          if (newPlan === 'starter' || newPlan === 'pro') {
            sendSecureBillingEmailSafe({
              stripeCustomerId: customerId,
              eventId: event.id,
              type: 'onboarding',
              sendFn: sendOnboardingEmail,
            });
          }
          
          // Send Pro plan activation email
          if (newPlan === 'pro') {
            const amount = '£49.99';
            const renewalDate = syncedSub.currentPeriodEnd?.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) || 'N/A';
            
            sendSecureBillingEmailSafe({
              stripeCustomerId: customerId,
              eventId: event.id,
              type: 'upgrade',
              sendFn: sendPlanUpgradeEmail,
              sendArgs: [amount, renewalDate],
            });
          }
        }
        // Send upgrade email if plan changed
        else if (eventType === 'customer.subscription.updated') {
          const oldPlanName = (result.plan || 'starter').charAt(0).toUpperCase() + (result.plan || 'starter').slice(1);
          const newPlanName = newPlan.charAt(0).toUpperCase() + newPlan.slice(1);
          
          sendSecureBillingEmailSafe({
            stripeCustomerId: customerId,
            eventId: event.id,
            type: 'subscription_upgraded',
            sendFn: sendSubscriptionUpgradedEmail,
            sendArgs: [oldPlanName, newPlanName],
          });
        }
      } else {
        console.warn('[webhook] No subscription found for customer:', customerId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = String(sub.customer);
      const wasTrialing = sub.status === 'trialing';
      
      console.log('[webhook] Subscription deleted:', sub.id, 'Was trialing:', wasTrialing);
      
      // Use centralized cancellation function
      const { handleSubscriptionCancellation } = await import('@/lib/billing/sync-subscription');
      const result = await handleSubscriptionCancellation(sub);
      
      if (!result.success) {
        console.error('[webhook] Failed to handle cancellation:', result.error);
        break;
      }
      
      console.log('[webhook] Subscription canceled:', {
        userId: result.userId,
      });
      
      // Send cancellation email
      const userSub = await prisma.subscription.findFirst({ 
        where: { stripeCustomerId: customerId },
        include: { user: true }
      });
      
      if (userSub) {
        const planName = userSub.plan.charAt(0).toUpperCase() + userSub.plan.slice(1);
        const endDate = userSub.currentPeriodEnd?.toLocaleDateString() || 'N/A';
        
        if (wasTrialing) {
          sendSecureBillingEmailSafe({
            stripeCustomerId: customerId,
            eventId: event.id,
            type: 'trial_cancelled',
            sendFn: sendTrialCancelledEmail,
            sendArgs: [planName],
          });
        } else {
          sendSecureBillingEmailSafe({
            stripeCustomerId: customerId,
            eventId: event.id,
            type: 'cancellation',
            sendFn: sendSubscriptionCancelledEmail,
            sendArgs: [planName, endDate],
          });
        }
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const inv = event.data.object as any;
      const customerId = String(inv.customer);
      const subId = typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id;
      
      console.log('[webhook] Payment succeeded for customer:', customerId, 'Amount:', inv.amount_paid);
      
      const userSub = await prisma.subscription.findFirst({ 
        where: { stripeCustomerId: customerId },
        include: { user: true }
      });
      
      if (userSub && userSub.status === 'trialing') {
        // Trial converted to active subscription
        console.log('[webhook] Converting trial to active subscription:', userSub.id);
        
        // Validate subId before fetching
        if (!subId) {
          console.error('[webhook] Missing subscription ID in invoice, using stripeSubscriptionId from DB:', userSub.stripeSubscriptionId);
          // Try to use the subscription ID from our database
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
      break;
    }

    case 'invoice.payment_failed': {
      const inv = event.data.object as any;
      const customerId = String(inv.customer);
      
      console.log('[webhook] Payment failed for customer:', customerId, 'Amount:', inv.amount_due);
      
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
        
        // Send payment failed email
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
  }

  return NextResponse.json({ received: true });
}
