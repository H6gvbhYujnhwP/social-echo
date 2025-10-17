# Stripe Agency Product Setup Guide

**Date:** October 6, 2025  
**Purpose:** Create the agency subscription product in Stripe for £39/client/month pricing

---

## 🎯 Overview

You need to create **ONE** agency product in Stripe with quantity-based billing. This allows agencies to pay £39 per active client per month, with the quantity automatically updating as they add or remove clients.

---

## 📋 Product Requirements

**Product Name:** Agency — Grow as You Go  
**Pricing:** £39.00 per unit per month  
**Billing Model:** Recurring subscription with quantity  
**Currency:** GBP (British Pounds)  
**Billing Period:** Monthly  

---

## 🔧 Step-by-Step Setup

### Step 1: Access Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Make sure you're in **Live Mode** (toggle in top-right corner)
3. Navigate to **Products** in the left sidebar

---

### Step 2: Create New Product

1. Click **"+ Add product"** button
2. Fill in the product details:

**Product Information:**
```
Name: Agency — Grow as You Go
Description: White-label social media content platform for agencies. Pay per active client.
```

**Statement Descriptor (optional):**
```
SOCIALECHO AGENCY
```
*(This appears on customer credit card statements)*

---

### Step 3: Add Pricing

In the **Pricing** section:

**Model:** Standard pricing

**Price:**
```
Amount: £39.00
Currency: GBP
```

**Billing Period:**
```
Recurring
Monthly
```

**Usage is metered:**
```
☐ Leave UNCHECKED
```
*(We're using quantity-based billing, not metered usage)*

**Pricing model:**
```
Per unit
```

---

### Step 4: Advanced Options (Important!)

Click **"Show more options"** and configure:

**Quantity:**
```
☑ Customers can adjust quantity
```
*(This allows the quantity to be updated via API when clients are added/removed)*

**Trial Period:**
```
☐ Leave UNCHECKED (or set to 0 days)
```

**Tax Behavior:**
```
Exclusive (default)
```

---

### Step 5: Save and Copy Price ID

1. Click **"Add pricing"**
2. Click **"Save product"**
3. You'll see the product page with a **Price ID** that looks like: `price_xxxxxxxxxxxxx`
4. **Copy this Price ID** - you'll need it in the next step

---

## 🔄 Update Application Code

### Option A: Use the New Price ID (Recommended)

If you created a new product, update the price IDs in your code:

**File:** `lib/billing/plans.ts`

Replace all three agency price IDs with your new one:

```typescript
export const PLANS: Record<PlanKey, { priceId: string; label: string; usageLimit: number }> = {
  SocialEcho_Starter:       { priceId: 'price_1SESnsLCgRgCwthBIS45euRo', label: 'Starter',              usageLimit: 8 },
  SocialEcho_Pro:           { priceId: 'price_1SESohLCgRgCwthBBNUGP2XN', label: 'Pro',                  usageLimit: 10_000_000 },
  SocialEcho_AgencyStarter: { priceId: 'YOUR_NEW_PRICE_ID_HERE',        label: 'Agency — Grow as You Go', usageLimit: 10_000_000 },
  SocialEcho_AgencyGrowth:  { priceId: 'YOUR_NEW_PRICE_ID_HERE',        label: 'Agency — Grow as You Go', usageLimit: 10_000_000 },
  SocialEcho_AgencyScale:   { priceId: 'YOUR_NEW_PRICE_ID_HERE',        label: 'Agency — Grow as You Go', usageLimit: 10_000_000 },
};
```

Then commit and deploy:
```bash
git add lib/billing/plans.ts
git commit -m "update: Use new Stripe agency price ID"
git push origin main
```

---

### Option B: Verify Existing Price IDs

If you want to check if the existing price IDs in the code already exist in your Stripe account:

1. Go to Stripe Dashboard → Products
2. Look for products with these price IDs:
   - `price_1SESpcLCgRgCwthBxVnAqc2a`
   - `price_1SESqJLCgRgCwthBPnK7rLgi`
   - `price_1SESr6LCgRgCwthBbeIR1hpf`
3. If they exist and are configured correctly (£39/unit/month), you're good to go!
4. If they don't exist, use Option A above

---

## 🧪 Test the Product

### Test Mode First (Recommended)

Before going live, test in Stripe Test Mode:

1. Switch to **Test Mode** in Stripe dashboard
2. Create the same product with test price ID
3. Update code with test price ID
4. Test checkout with test card: `4242 4242 4242 4242`
5. Verify subscription created correctly
6. Test quantity updates (add/remove clients)

### Test Card Numbers

**Successful Payment:**
```
4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Declined Payment:**
```
4000 0000 0000 0002
```

---

## 📊 Verify Product Configuration

After creating the product, verify these settings:

### In Stripe Dashboard:

**Product Page:**
- ✅ Name: "Agency — Grow as You Go"
- ✅ Price: £39.00 GBP
- ✅ Billing: Monthly
- ✅ Type: Recurring
- ✅ Quantity: Adjustable

**Pricing Details:**
- ✅ Per unit pricing enabled
- ✅ No metered usage
- ✅ No trial period (or 0 days)

---

## 🔗 Webhook Configuration

Ensure your webhook is configured to receive subscription events:

**Webhook URL:**
```
https://www.socialecho.ai/api/webhooks/stripe
```

**Required Events:**
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated` *(Critical for quantity changes)*
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**How to Configure:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Click "Add events"
4. Select all events listed above
5. Click "Add events"

---

## 💡 How Quantity Billing Works

### Initial Subscription

When an agency signs up:
1. Customer completes checkout
2. Subscription created with **quantity = 0** (no clients yet)
3. Initial charge: £0.00
4. Agency can now add clients

### Adding Clients

When agency adds a client:
1. Application calls Stripe API to update quantity
2. Quantity increases by 1
3. Stripe automatically prorates the charge
4. Next invoice shows: `£39 × quantity`

### Removing Clients

When agency removes a client:
1. Application calls Stripe API to update quantity
2. Quantity decreases by 1
3. Stripe automatically credits the difference
4. Next invoice reflects new quantity

### Example Billing Cycle

**Day 1:** Agency signs up → Quantity: 0 → Charge: £0  
**Day 3:** Add client 1 → Quantity: 1 → Prorated charge: ~£36.50  
**Day 10:** Add client 2 → Quantity: 2 → Prorated charge: ~£26  
**Day 15:** Remove client 1 → Quantity: 1 → Prorated credit: ~£19.50  
**Day 30:** Monthly renewal → Quantity: 1 → Full charge: £39  

---

## 🚨 Common Issues

### Issue 1: "Price not found" Error

**Cause:** Price ID in code doesn't match Stripe

**Solution:**
1. Copy the correct price ID from Stripe
2. Update `lib/billing/plans.ts`
3. Commit and deploy

---

### Issue 2: Quantity Can't Be Updated

**Cause:** Product not configured for quantity adjustments

**Solution:**
1. Go to product in Stripe
2. Edit pricing
3. Enable "Customers can adjust quantity"
4. Save changes

---

### Issue 3: Wrong Currency

**Cause:** Product created in USD instead of GBP

**Solution:**
1. Create new product with GBP currency
2. Update price ID in code
3. Archive old USD product

---

### Issue 4: Metered Usage Enabled

**Cause:** Wrong billing model selected

**Solution:**
1. Create new product
2. Use "Standard pricing" not "Metered pricing"
3. Enable quantity adjustments
4. Update price ID in code

---

## ✅ Verification Checklist

Before going live, verify:

### Stripe Dashboard:
- [ ] Product exists: "Agency — Grow as You Go"
- [ ] Price is £39.00 GBP per unit per month
- [ ] Billing period is Monthly
- [ ] Quantity adjustments enabled
- [ ] No metered usage
- [ ] Price ID copied

### Application Code:
- [ ] Price ID updated in `lib/billing/plans.ts`
- [ ] Changes committed to Git
- [ ] Deployed to production

### Webhook:
- [ ] Webhook URL configured
- [ ] All 6 required events enabled
- [ ] Webhook secret in environment variables

### Testing:
- [ ] Test checkout completes successfully
- [ ] Subscription created in Stripe
- [ ] Quantity updates when adding client
- [ ] Quantity updates when removing client
- [ ] Webhook events received and logged

---

## 📞 Support

If you encounter issues:

1. **Check Stripe Logs:**
   - Dashboard → Developers → Logs
   - Look for API errors

2. **Check Webhook Logs:**
   - Dashboard → Developers → Webhooks → [Your endpoint]
   - Check for failed deliveries

3. **Check Application Logs:**
   - Render dashboard → Logs
   - Look for Stripe API errors

4. **Test with Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

---

## 🎯 Summary

**What to Create:**
- 1 product: "Agency — Grow as You Go"
- Price: £39/unit/month
- Billing: Monthly, quantity-based

**What to Update:**
- `lib/billing/plans.ts` with new price ID
- Webhook events (if not already configured)

**What to Test:**
- Checkout flow
- Quantity updates
- Webhook events

---

**Document Created:** October 6, 2025  
**Status:** Ready for Implementation  
**Estimated Time:** 15-20 minutes
