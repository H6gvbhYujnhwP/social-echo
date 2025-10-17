# Email Flow Fix - v7.0 Blueprint Compliance

## Issue Summary
Emails were being sent at signup before payment confirmation, violating the v7.0 blueprint requirement that emails should only be sent after Stripe payment confirmation via webhooks.

## Changes Made

### 1. Removed Email Sending from Signup Route ✅
**File**: `app/api/auth/signup/route.ts`

**Before**: Sent welcome email immediately on signup (before payment)
**After**: No emails sent - user created with `pending_payment` status

**Changes**:
- Removed `sendWelcomeEmail()` call and retry logic
- Removed import of `sendWelcomeEmail`
- Added comment explaining emails are now webhook-driven

### 2. Removed Email Sending from checkout.session.completed ✅
**File**: `app/api/webhooks/stripe/route.ts`

**Before**: Sent welcome email, trial started email, or payment success email
**After**: No emails sent - only links session to customer/subscription

**Changes**:
- Removed all email sending logic from `checkout.session.completed` handler
- This event now only creates/updates subscription records
- Added comment explaining emails are sent by `customer.subscription.created`

### 3. Fixed customer.subscription.created Email Flow ✅
**File**: `app/api/webhooks/stripe/route.ts`

**Before**: Sent onboarding email and plan upgrade email separately
**After**: Sends welcome + onboarding emails together (single activation flow)

**Changes**:
- Sends **welcome email** (idempotent via EmailLog)
- Sends **onboarding email** (idempotent via EmailLog)
- Both use `sendSecureBillingEmailSafe()` helper
- Both resolve recipient by `stripeCustomerId`
- Removed plan-specific upgrade email (not needed on creation)

### 4. Verified Secure Email Helper ✅
**Files**: 
- `lib/billing/secure-email.ts`
- `lib/billing/recipient.ts`

**Already Correct** - No changes needed:
- ✅ Resolves recipient by `stripeCustomerId` (not by email)
- ✅ Uses `EmailLog` table for idempotency
- ✅ Validates recipient to prevent cross-tenant sends
- ✅ Logs only IDs (no PII)
- ✅ Structured audit logging

### 5. Verified Other Webhook Handlers ✅

**invoice.payment_succeeded**: ✅ Correct
- Only sends trial conversion email (when trial converts to paid)
- Does NOT send onboarding emails

**invoice.payment_failed**: ✅ Correct
- Only sends payment failed email
- Uses secure billing email helper

**customer.subscription.deleted**: ✅ Correct
- Only sends cancellation email
- Uses secure billing email helper

**customer.subscription.updated**: ✅ Correct
- Only sends upgrade email (when plan changes)
- Uses secure billing email helper

## Email Flow After Fix

### New User Signup Flow
1. User submits `/signup?plan=SocialEcho_Pro` → **No email sent**
2. User record created with `status: 'pending_payment'`
3. User redirected to Stripe Checkout
4. User completes payment
5. Stripe sends `checkout.session.completed` webhook → **No email sent**
6. Stripe sends `customer.subscription.created` webhook → **Emails sent here**:
   - Welcome email (via `sendSecureBillingEmailSafe`)
   - Onboarding email (via `sendSecureBillingEmailSafe`)
7. User can access platform

### Email Idempotency
All billing emails use `EmailLog` table with composite key:
```
key = `${eventId}:${emailType}:${stripeCustomerId}`
```

**Prevents duplicates when**:
- Webhook is replayed
- Multiple subscription events fire
- Admin syncs subscription manually

### Email Recipient Resolution
All billing emails resolve recipient via:
1. Look up `Subscription` by `stripeCustomerId`
2. Get `userId` from subscription
3. Get `email` from `User` table
4. Validate email format
5. Check against forbidden recipients (production only)

**Never** sends email by raw email address from webhook.

## Testing Checklist

### ✅ Signup Flow (No Email)
- [ ] Go to `/signup?plan=SocialEcho_Pro`
- [ ] Fill in form and submit
- [ ] **Expected**: No email received
- [ ] **Expected**: User created with `pending_payment` status

### ✅ Payment Flow (Emails Sent)
- [ ] Complete Stripe Checkout with test card `4242 4242 4242 4242`
- [ ] **Expected**: Redirected to `/train?welcome=1`
- [ ] **Expected**: Receive **2 emails**:
  1. Welcome email
  2. Onboarding email ("Get The Most Out of Your Echo")
- [ ] **Expected**: No duplicate emails

### ✅ Webhook Replay (No Duplicates)
- [ ] In Stripe Dashboard, replay `customer.subscription.created` event
- [ ] **Expected**: No duplicate emails sent
- [ ] **Expected**: Logs show `duplicate` status

### ✅ Admin Sync (No Emails)
- [ ] Admin clicks "Sync Limits" button
- [ ] **Expected**: No emails sent
- [ ] **Expected**: Subscription data synced correctly

### ✅ Trial Flow
- [ ] Sign up for Starter plan (has 1-day trial)
- [ ] **Expected**: No email at signup
- [ ] **Expected**: Welcome + onboarding emails after checkout
- [ ] **Expected**: Trial conversion email after first payment

## Logging

### Signup Route
```
[signup] User created with pending_payment status { userId, businessName }
```

### Webhook: checkout.session.completed
```
[webhook] Checkout session linked to subscription - emails will be sent by subscription.created event
```

### Webhook: customer.subscription.created
```
[webhook] Sending activation emails for new subscription: { customerId, plan, eventId }
[billing-email] { type: 'welcome', customerId, userId, status: 'sent' }
[billing-email] { type: 'onboarding', customerId, userId, status: 'sent' }
```

### Webhook: Duplicate Email Attempt
```
[billing-email] { type: 'welcome', customerId, userId, status: 'duplicate' }
```

## Files Changed

1. `app/api/auth/signup/route.ts` - Removed email sending
2. `app/api/webhooks/stripe/route.ts` - Fixed email flow in webhooks
3. `EMAIL-FLOW-FIX.md` - This documentation

## Files Verified (No Changes Needed)

1. `lib/billing/secure-email.ts` - Already correct
2. `lib/billing/recipient.ts` - Already correct
3. `lib/email/service.ts` - Already correct

## Compliance with v7.0 Blueprint

✅ **Activation happens on customer.subscription.created** (not on signup)
✅ **Emails sent only after payment confirmation** via webhooks
✅ **Billing emails resolve recipient by stripeCustomerId**
✅ **Idempotency enforced via EmailLog table**
✅ **checkout.session.completed does not send emails**
✅ **invoice.payment_succeeded does not send onboarding**
✅ **Admin sync does not send emails**
✅ **Logs contain only IDs** (no PII)
✅ **Pending-payment signup → webhook-driven activation flow preserved**

## Rollback Plan

If issues occur, revert these commits:
1. Signup route email removal
2. Webhook email flow changes

To restore old behavior (NOT RECOMMENDED):
- Uncomment email sending in signup route
- Restore email sending in checkout.session.completed

## Next Steps

1. Deploy to GitHub
2. Render auto-deploys from main branch
3. Test signup flow end-to-end
4. Monitor webhook logs for email sending
5. Verify no duplicate emails in production

## Support

If emails are not being sent:
1. Check Render logs for `[billing-email]` messages
2. Verify Stripe webhook is configured: `https://www.socialecho.ai/api/webhooks/stripe`
3. Check `EmailLog` table for duplicate entries
4. Verify `RESEND_API_KEY` is set in Render environment
5. Check Resend dashboard for delivery status

