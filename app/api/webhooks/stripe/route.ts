// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/billing/stripe';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/billing/plans';
import { 
  sendPaymentSuccessEmail, 
  sendPaymentFailedEmail, 
  sendSubscriptionCancelledEmail,
  sendSubscriptionUpgradedEmail 
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

      const subscription = await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subId,
          plan: (mapped?.planLabel || 'starter').toLowerCase(),
          status: 'active',
          usageLimit: mapped?.usageLimit ?? 8,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
        update: {
          stripeCustomerId: customerId ?? undefined,
          stripeSubscriptionId: subId ?? undefined,
        },
      });
      
      console.log('[webhook] Subscription created/updated:', subscription.id, subscription.plan);
      
      // Send payment success email
      const planName = subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1);
      const amount = s.amount_total ? `$${(s.amount_total / 100).toFixed(2)}` : 'N/A';
      console.log('[webhook] Sending payment success email to:', user.email);
      
      sendPaymentSuccessEmail(user.email, user.name, planName, amount).catch(err =>
        console.error('[webhook] Failed to send payment success email:', err)
      );
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as any; // Stripe.Subscription
      const customerId = String(sub.customer);
      const priceId = sub.items?.data?.[0]?.price?.id as string | undefined;
      const quantity = sub.items?.data?.[0]?.quantity || 1;
      
      console.log('[webhook] Subscription event:', event.type, 'Customer:', customerId, 'Quantity:', quantity);
      
      const mapped = mapPlanFromPriceId(priceId);

      const userSub = await prisma.subscription.findFirst({ 
        where: { stripeCustomerId: customerId },
        include: { user: true }
      });
      
      if (userSub) {
        const oldPlan = userSub.plan;
        const newPlan = (mapped?.planLabel || userSub.plan).toLowerCase();
        
        console.log('[webhook] Updating subscription:', userSub.id, 'from', oldPlan, 'to', newPlan);
        
        await prisma.subscription.update({
          where: { id: userSub.id },
          data: {
            plan: newPlan,
            status: sub.status,
            usageLimit: mapped?.usageLimit ?? userSub.usageLimit,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        
        // Send upgrade email if plan changed
        if (event.type === 'customer.subscription.updated' && oldPlan !== newPlan) {
          const oldPlanName = oldPlan.charAt(0).toUpperCase() + oldPlan.slice(1);
          const newPlanName = newPlan.charAt(0).toUpperCase() + newPlan.slice(1);
          console.log('[webhook] Sending upgrade email to:', userSub.user.email);
          
          sendSubscriptionUpgradedEmail(userSub.user.email, userSub.user.name, oldPlanName, newPlanName).catch(err =>
            console.error('[webhook] Failed to send upgrade email:', err)
          );
        }
      } else {
        console.warn('[webhook] No subscription found for customer:', customerId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as any;
      const customerId = String(sub.customer);
      
      console.log('[webhook] Subscription deleted for customer:', customerId);
      
      const userSub = await prisma.subscription.findFirst({ 
        where: { stripeCustomerId: customerId },
        include: { user: true }
      });
      
      if (userSub) {
        console.log('[webhook] Canceling subscription:', userSub.id);
        
        await prisma.subscription.update({
          where: { id: userSub.id },
          data: { status: 'canceled' },
        });
        
        // Send cancellation email
        const planName = userSub.plan.charAt(0).toUpperCase() + userSub.plan.slice(1);
        const endDate = new Date(sub.current_period_end * 1000).toLocaleDateString();
        console.log('[webhook] Sending cancellation email to:', userSub.user.email);
        
        sendSubscriptionCancelledEmail(userSub.user.email, userSub.user.name, planName, endDate).catch(err =>
          console.error('[webhook] Failed to send cancellation email:', err)
        );
      } else {
        console.warn('[webhook] No subscription found for deleted customer:', customerId);
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
        console.log('[webhook] Sending payment failed email to:', userSub.user.email);
        
        sendPaymentFailedEmail(userSub.user.email, userSub.user.name, planName).catch(err =>
          console.error('[webhook] Failed to send payment failed email:', err)
        );
      } else {
        console.warn('[webhook] No subscription found for failed payment customer:', customerId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
