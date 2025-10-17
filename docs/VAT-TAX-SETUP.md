# VAT/Tax Setup Guide

This guide explains how to configure VAT/tax display on all Stripe invoices for Social Echo.

---

## Overview

All Social Echo plans are VAT-inclusive:
- **Starter:** £29.99/month (includes VAT)
- **Pro:** £49.99/month (includes VAT)
- **Agency:** £39/client/month (includes VAT)

With proper tax configuration, invoices will display:
```
Subtotal: £24.99 (net)
VAT (20%): £5.00
Total: £29.99
```

---

## Option 1: Stripe Tax (Recommended)

Stripe Tax automatically calculates and applies the correct tax rate based on customer location.

### Setup Steps

1. **Enable Stripe Tax**
   - Go to Stripe Dashboard → Tax → Settings
   - Click "Enable Stripe Tax"
   - Follow the setup wizard

2. **Configure Business Details**
   - Enter your business address
   - Add VAT registration number (if applicable)
   - Set default tax behavior to "Inclusive"

3. **Verify Price Configuration**
   - Go to Products → Prices
   - For each price (Starter, Pro, Agency), ensure:
     - "Include tax in price" is set to **Yes**
     - Tax behavior: **Inclusive**

4. **Deploy Code**
   - All subscription creation endpoints already include `automatic_tax: { enabled: true }`
   - No additional configuration needed

5. **Run Backfill Script**
   - Update existing subscriptions to enable tax:
   ```bash
   npx ts-node scripts/backfill-legacy-tax.ts
   ```
   - Or via admin API:
   ```bash
   curl -X POST https://socialecho.ai/api/admin/backfill-tax \
     -H "Cookie: next-auth.session-token=..."
   ```

---

## Option 2: Manual Tax Rate (Fallback)

If Stripe Tax is not enabled, use a manual tax rate for UK VAT.

### Setup Steps

1. **Create Tax Rate**
   - Go to Stripe Dashboard → Products → Tax Rates
   - Click "Create tax rate"
   - Configuration:
     - Display name: `VAT`
     - Percentage: `20.00`
     - Inclusive: **Yes**
     - Region: United Kingdom
     - Description: `UK VAT (20%)`

2. **Copy Tax Rate ID**
   - After creation, copy the tax rate ID (starts with `txr_`)

3. **Add to Environment Variables**
   - Add to `.env`:
   ```
   STRIPE_TAXRATE_UK_VAT_20=txr_1234567890abcdef
   ```

4. **Deploy Code**
   - The backfill script will automatically use this tax rate if set
   - New subscriptions will use automatic tax (preferred)

5. **Run Backfill Script**
   - Same as Option 1

---

## Verification

### Check New Subscriptions

1. Create a test subscription (Starter or Pro)
2. Go to Stripe Dashboard → Customers → [Customer] → Subscriptions
3. Click on the subscription
4. Verify:
   - "Automatic tax" shows "Enabled" OR
   - "Tax rates" shows your manual tax rate

### Check Invoices

1. Go to Stripe Dashboard → Billing → Invoices
2. Open any invoice
3. Verify invoice shows:
   - Subtotal (net amount)
   - VAT (20%) line
   - Total (gross amount)

### Check Invoice PDFs

1. Download invoice PDF
2. Verify VAT breakdown appears
3. Verify totals are correct

### Check Hosted Invoice Page

1. Open hosted invoice URL
2. Verify VAT line displays
3. Verify customer sees tax breakdown

---

## Backfill Legacy Subscriptions

All existing active subscriptions need to be updated to enable tax on future invoices.

### Command Line

```bash
cd /home/ubuntu/social-echo
npx ts-node scripts/backfill-legacy-tax.ts
```

**Output:**
```
[backfill-tax] Starting legacy subscription tax backfill...
[backfill-tax] Fetching active subscriptions from Stripe...
[backfill-tax] Processing 100 subscriptions...
[backfill-tax] ✓ sub_abc123 - Tax already enabled
[backfill-tax] → sub_def456 - Enabling automatic tax...
[backfill-tax] ✓ sub_def456 - Successfully updated
...
[backfill-tax] ===== BACKFILL COMPLETE =====
[backfill-tax] Total subscriptions: 150
[backfill-tax] Already enabled: 50
[backfill-tax] Updated: 95
[backfill-tax] Failed: 5
```

### Admin API Endpoint

**Endpoint:** `POST /api/admin/backfill-tax`

**Authentication:** Requires MASTER_ADMIN role

**Request:**
```bash
curl -X POST https://socialecho.ai/api/admin/backfill-tax \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Legacy subscription tax backfill completed",
  "stats": {
    "total": 150,
    "alreadyEnabled": 50,
    "updated": 95,
    "failed": 5,
    "errors": [
      {
        "subscriptionId": "sub_xyz789",
        "error": "Subscription is cancelled"
      }
    ]
  }
}
```

---

## Invoice Template Configuration

Ensure Stripe invoice templates display tax correctly.

### Steps

1. Go to Stripe Dashboard → Settings → Billing → Invoices
2. Click "Customize invoice template"
3. Enable:
   - ✅ Show tax breakdown
   - ✅ Display tax amounts
   - ✅ Show business address
   - ✅ Show VAT number (if applicable)
4. Save changes

---

## Testing Checklist

### New Subscriptions

- [ ] New Starter signup → invoice shows VAT line, total £29.99
- [ ] New Pro signup → invoice shows VAT line, total £49.99
- [ ] Starter→Pro upgrade → invoice shows VAT line, total £49.99
- [ ] Agency subscription → invoice shows VAT line, total £39/client

### Legacy Subscriptions

- [ ] Run backfill script successfully
- [ ] Check updated subscription in Stripe Dashboard
- [ ] Verify next invoice shows VAT line
- [ ] No regressions to plan or usage tracking

### Invoice Display

- [ ] Invoice PDF shows VAT breakdown
- [ ] Hosted invoice page shows VAT line
- [ ] Email invoice shows VAT (if enabled)
- [ ] Totals are correct (net + VAT = gross)

### Edge Cases

- [ ] Trial subscriptions (VAT applies after trial)
- [ ] Cancelled subscriptions (not updated)
- [ ] Subscriptions with coupons (VAT applies to discounted amount)
- [ ] Agency subscriptions with multiple seats

---

## Troubleshooting

### Issue: Invoices still don't show VAT

**Check:**
1. Stripe Tax is enabled OR manual tax rate is set
2. Price configuration has "Include tax in price" = Yes
3. Subscription has `automatic_tax.enabled = true` OR `default_tax_rates` set
4. Invoice template has "Show tax breakdown" enabled
5. Business address and VAT number are configured

**Fix:**
- Re-run backfill script
- Manually update subscription in Stripe Dashboard
- Check Stripe Tax settings

---

### Issue: Backfill script fails

**Common Errors:**

**"Subscription is cancelled"**
- Expected behavior - script skips cancelled subscriptions
- No action needed

**"Invalid tax rate ID"**
- Check `STRIPE_TAXRATE_UK_VAT_20` environment variable
- Verify tax rate exists in Stripe Dashboard
- Ensure tax rate ID starts with `txr_`

**"Stripe Tax not enabled"**
- Enable Stripe Tax in Dashboard
- Or create manual tax rate and set environment variable

---

### Issue: Wrong tax amount

**Check:**
1. Price "Include tax in price" setting
2. Tax rate percentage (should be 20% for UK VAT)
3. Customer billing address (affects tax calculation)

**Fix:**
- Update price configuration
- Update tax rate percentage
- Update customer address

---

## Code Changes Summary

### Updated Files

1. **`/app/api/checkout/route.ts`**
   - Added `automatic_tax: { enabled: true }` to checkout sessions

2. **`/app/api/billing/checkout/route.ts`**
   - Added `automatic_tax: { enabled: true }` to agency checkout

3. **`/app/api/admin/users/[id]/plan/route.ts`**
   - Added `automatic_tax: { enabled: true }` to admin plan assignment

4. **`/app/api/account/upgrade-to-pro/route.ts`**
   - Added `automatic_tax: { enabled: true }` to custom upgrade

5. **`/scripts/backfill-legacy-tax.ts`** (NEW)
   - Standalone script to update legacy subscriptions

6. **`/app/api/admin/backfill-tax/route.ts`** (NEW)
   - Admin API endpoint to trigger backfill

7. **`.env.example`**
   - Added `STRIPE_TAXRATE_UK_VAT_20` for manual tax rate fallback

---

## Support

For issues or questions:
- Check Stripe Dashboard → Developers → Logs
- Review backfill script output
- Contact support@socialecho.ai
- Check Stripe Tax documentation: https://stripe.com/docs/tax

---

**Last Updated:** October 16, 2025  
**Version:** 1.0

