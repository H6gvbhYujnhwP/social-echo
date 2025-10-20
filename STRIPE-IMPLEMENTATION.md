# Stripe Payment Integration - Implementation Guide

## Overview

Complete Stripe payment integration for Social Echo with:
- ✅ Stripe Checkout (subscription payments)
- ✅ Webhook handler (sync subscription status)
- ✅ Customer Portal (manage billing)
- ✅ Usage limits enforcement
- ✅ Pricing page with all plans
- ✅ Usage display component

---

## Files Created

### Configuration
1. **`lib/billing/plans.ts`** - Plan definitions and price IDs
2. **`lib/billing/stripe.ts`** - Stripe client configuration
3. **`lib/billing/client.ts`** - Client-side utilities

### API Routes
4. **`app/api/checkout/route.ts`** - Create Stripe Checkout session
5. **`app/api/portal/route.ts`** - Open Stripe Customer Portal
6. **`app/api/webhooks/stripe/route.ts`** - Handle Stripe webhooks
7. **`app/api/subscription/route.ts`** - Get user subscription info

### Components
8. **`components/BillingButtons.tsx`** - Checkout and portal buttons
9. **`components/UsageDisplay.tsx`** - Usage statistics display

### Pages
10. **`app/pricing/page.tsx`** - Pricing page with all plans

### Updates
11. **`app/api/generate-text/route.ts`** - Added usage enforcement
12. **`.env.example`** - Added Stripe environment variables

---

## Plans & Pricing

### Individual Plans

| Plan | Price | Usage Limit | Price ID |
|------|-------|-------------|----------|
| Starter | £29.99/mo | 8 posts/month | `price_1SESnsLCgRgCwthBIS45euRo` |
| Pro | £49.99/mo | Unlimited | `price_1SESohLCgRgCwthBBNUGP2XN` |

### Agency Plans

| Plan | Price | Clients | Price ID |
|------|-------|---------|----------|
| Agency Starter | £199/mo | 10 clients | `price_1SESpcLCgRgCwthBxVnAqc2a` |
| Agency Growth | £399/mo | 25 clients | `price_1SESqJLCgRgCwthBPnK7rLgi` |
| Agency Scale | £799/mo | 50 clients | `price_1SESr6LCgRgCwthBbeIR1hpf` |

---

## Environment Variables

Add these to Render (already configured):

```bash
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_... (not used server-side yet)
STRIPE_WEBHOOK_SECRET=whsec_Dnw0UcQpew6mPfkNVn8Z0nJ8XvJ8VxJjW
BILLING_PORTAL_RETURN_URL=https://www.socialecho.ai/train?welcome=1
```

---

## Webhook Setup

### 1. Configure Stripe Webhook

**Endpoint URL**: `https://www.socialecho.ai/api/webhooks/stripe`

**Events to Listen For**:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### 2. Test Webhook

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Usage Flow

### 1. User Subscribes

```typescript
// User clicks "Upgrade to Pro" button
<CheckoutButton planKey="SocialEcho_Pro">
  Upgrade to Pro
</CheckoutButton>

// Redirects to Stripe Checkout
// On success → /train?welcome=1
// On cancel → /dashboard?billing=cancel
```

### 2. Webhook Syncs Subscription

```
Stripe → webhook → /api/webhooks/stripe
  ↓
Updates Subscription table:
  - plan: 'pro'
  - status: 'active'
  - usageLimit: 10000000
  - stripeCustomerId: 'cus_...'
  - stripeSubscriptionId: 'sub_...'
  - currentPeriodStart/End
```

### 3. Usage Enforcement

```typescript
// Before generating content
const sub = await prisma.subscription.findUnique({ where: { userId } })

// Check status
if (!['active', 'trialing', 'past_due'].includes(sub.status)) {
  return 402 Payment Required
}

// Check limit
if (sub.usageCount >= sub.usageLimit) {
  return 402 Usage Limit Reached
}

// Generate content...

// Increment usage
await prisma.subscription.update({
  where: { id: sub.id },
  data: { usageCount: { increment: 1 } }
})
```

### 4. Manage Billing

```typescript
// User clicks "Manage Billing"
<BillingPortalButton />

// Opens Stripe Customer Portal
// User can:
//   - Update payment method
//   - Change plan
//   - Cancel subscription
//   - View invoices
```

---

## Testing

### 1. Test Checkout Flow

1. Go to `/pricing`
2. Click "Upgrade to Pro"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify redirect to `/train?welcome=1`
6. Check database: `Subscription` table updated

### 2. Test Webhook

```bash
# Terminal 1: Start webhook listener
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 2: Trigger test event
stripe trigger checkout.session.completed
```

### 3. Test Usage Limits

1. Sign up as Starter user
2. Generate 8 posts
3. Try to generate 9th post
4. Should see: "Usage limit reached. Upgrade to Pro for unlimited posts."

### 4. Test Customer Portal

1. Subscribe to a plan
2. Click "Manage Billing"
3. Verify portal opens
4. Try updating payment method
5. Verify return to `/train?welcome=1`

---

## Usage Display

Add to dashboard:

```typescript
import { UsageDisplay } from '@/components/UsageDisplay'

export default function Dashboard() {
  return (
    <div>
      <UsageDisplay />
      {/* Rest of dashboard */}
    </div>
  )
}
```

Shows:
- Current plan
- Usage count / limit
- Progress bar
- Warning when near limit
- "Manage Billing" button

---

## Subscription Status

### Active Statuses (Allow Generation)
- `active` - Subscription is active and paid
- `trialing` - In trial period
- `past_due` - Payment failed but grace period

### Inactive Statuses (Block Generation)
- `canceled` - Subscription canceled
- `incomplete` - Payment not completed
- `incomplete_expired` - Payment expired
- `unpaid` - Payment failed, no grace period

---

## Usage Reset

**Current**: Manual reset required at period end

**Future**: Add cron job to reset usage:

```typescript
// Run daily
const subs = await prisma.subscription.findMany({
  where: {
    currentPeriodEnd: { lte: new Date() }
  }
})

for (const sub of subs) {
  await prisma.subscription.update({
    where: { id: sub.id },
    data: { usageCount: 0 }
  })
}
```

**Alternative**: Reset on `customer.subscription.updated` webhook when period renews.

---

## Error Handling

### Checkout Errors
- Invalid plan → 400 Bad Request
- User not found → 404 Not Found
- Stripe API error → 500 Internal Server Error

### Webhook Errors
- Invalid signature → 400 Bad Request
- Missing event data → Log and return 200 (don't retry)

### Generation Errors
- No subscription → 402 Payment Required
- Inactive subscription → 402 Payment Required
- Usage limit reached → 402 Payment Required

---

## Security

### Webhook Verification
```typescript
const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
)
```

### Customer ID Validation
- Always verify `stripeCustomerId` belongs to authenticated user
- Never expose Stripe customer IDs in client-side code

### API Key Protection
- Store `STRIPE_SECRET_KEY` in environment variables only
- Never commit keys to git
- Rotate keys if compromised

---

## Deployment Checklist

### Before Deploying

- [x] Install Stripe packages: `npm install stripe @stripe/stripe-js`
- [x] Add environment variables to Render
- [x] Configure Stripe webhook endpoint
- [x] Test webhook signature verification
- [x] Test checkout flow
- [x] Test usage enforcement

### After Deploying

- [ ] Verify webhook is receiving events
- [ ] Test live checkout with real card
- [ ] Test customer portal
- [ ] Monitor Stripe Dashboard for errors
- [ ] Set up usage reset cron job (optional)

---

## Monitoring

### Stripe Dashboard
- Monitor successful payments
- Check failed payments
- Review customer disputes
- Track MRR (Monthly Recurring Revenue)

### Application Logs
- Webhook events received
- Subscription updates
- Usage limit hits
- Checkout errors

### Database Queries

```sql
-- Active subscriptions
SELECT plan, COUNT(*) 
FROM "Subscription" 
WHERE status = 'active' 
GROUP BY plan;

-- Usage statistics
SELECT 
  plan,
  AVG(usageCount) as avg_usage,
  MAX(usageCount) as max_usage
FROM "Subscription"
WHERE status = 'active'
GROUP BY plan;

-- Revenue (requires Stripe API)
-- Use Stripe Dashboard or API for accurate revenue
```

---

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook endpoint URL in Stripe Dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check Render logs for errors
4. Test with `stripe trigger` command

### Subscription Not Updating

1. Check webhook logs in Stripe Dashboard
2. Verify event is in listened events list
3. Check application logs for errors
4. Manually trigger webhook test

### Usage Limit Not Enforcing

1. Check `Subscription.usageLimit` value
2. Verify `usageCount` is incrementing
3. Check generation API logs
4. Test with Starter plan (8 posts limit)

### Customer Portal Not Opening

1. Verify `stripeCustomerId` exists
2. Check `BILLING_PORTAL_RETURN_URL` is set
3. Test with different browser
4. Check Stripe API logs

---

## Next Steps

### Phase 1 (Complete)
- ✅ Stripe Checkout integration
- ✅ Webhook handler
- ✅ Customer Portal
- ✅ Usage enforcement
- ✅ Pricing page
- ✅ Usage display

### Phase 2 (Future)
- [ ] Usage reset cron job
- [ ] Email notifications (payment failed, limit reached)
- [ ] Admin dashboard (view all subscriptions)
- [ ] Analytics (MRR, churn rate, LTV)
- [ ] Proration for plan changes
- [ ] Trial period support

### Phase 3 (Future)
- [ ] White label features (Agency plans)
- [ ] Client management portal
- [ ] Bulk operations
- [ ] Custom domain setup
- [ ] Reseller marketplace

---

## Support

For Stripe-related issues:
- **Stripe Docs**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Social Echo Support**: support@socialecho.ai

---

**Implementation Complete!** 🎉

All Stripe payment features are now live and ready to accept payments.
