# Complete Deployment Checklist - Agency Platform

**Date:** October 6, 2025  
**Status:** Action Required  
**Priority:** 🔴 HIGH

---

## 📋 Overview

This checklist covers all remaining database migrations, environment variables, and Stripe configuration needed to fully deploy the Social Echo Agency Platform.

---

## ✅ Already Completed

- ✅ Added `agencyId` column to User table
- ✅ Created index on `agencyId`
- ✅ Code deployed to GitHub
- ✅ Frontend updated with unified pricing

---

## 🗄️ Database Migrations Still Needed

### 1. Create Agency Table

**Status:** ⚠️ **REQUIRED**

The Agency table doesn't exist yet in your production database. Run this SQL:

```sql
-- Create Agency table
CREATE TABLE IF NOT EXISTS "Agency" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logoUrl" TEXT,
  "primaryColor" TEXT DEFAULT '#3B82F6',
  "subdomain" TEXT,
  "customDomain" TEXT,
  "plan" TEXT NOT NULL DEFAULT 'agency_universal',
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "activeClientCount" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_ownerId_key" ON "Agency"("ownerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_slug_key" ON "Agency"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_subdomain_key" ON "Agency"("subdomain");
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_customDomain_key" ON "Agency"("customDomain");
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_stripeCustomerId_key" ON "Agency"("stripeCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_stripeSubscriptionId_key" ON "Agency"("stripeSubscriptionId");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Agency_slug_idx" ON "Agency"("slug");
CREATE INDEX IF NOT EXISTS "Agency_subdomain_idx" ON "Agency"("subdomain");

-- Add foreign key constraint from User to Agency
ALTER TABLE "User" 
ADD CONSTRAINT "User_agencyId_fkey" 
FOREIGN KEY ("agencyId") 
REFERENCES "Agency"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Add foreign key constraint from Agency to User (owner)
ALTER TABLE "Agency" 
ADD CONSTRAINT "Agency_ownerId_fkey" 
FOREIGN KEY ("ownerId") 
REFERENCES "User"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;
```

**How to Run:**
1. Connect to your database: `psql $DATABASE_URL`
2. Copy and paste the entire SQL block above
3. Verify: `\d Agency` should show the table structure

---

### 2. Verify All Tables Exist

After running the Agency table creation, verify all required tables exist:

```sql
-- Check for all required tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('User', 'Agency', 'Profile', 'Subscription', 'AuditLog')
ORDER BY table_name;
```

**Expected Output:**
```
 table_name
-------------
 Agency
 AuditLog
 Profile
 Subscription
 User
```

If any tables are missing, you need to run: `npx prisma migrate deploy`

---

## 🔧 Environment Variables

### Current Variables (Keep These)

✅ **Keep all existing variables:**
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `SUPPORT_EMAIL`
- `APP_NAME`
- `NODE_ENV`

---

### New Variables to Add

#### 1. Agency Billing Configuration

```bash
# Agency platform base URL (for branded login redirects)
NEXT_PUBLIC_APP_URL=https://www.socialecho.ai

# Agency admin email (for support notifications)
AGENCY_SUPPORT_EMAIL=agency-support@socialecho.ai
```

#### 2. Stripe Agency Price IDs

**⚠️ IMPORTANT:** You need to create these products in Stripe first (see Stripe section below).

```bash
# Agency plan price IDs (these are already in code, but verify they exist in Stripe)
STRIPE_AGENCY_STARTER_PRICE_ID=price_1SESpcLCgRgCwthBxVnAqc2a
STRIPE_AGENCY_GROWTH_PRICE_ID=price_1SESqJLCgRgCwthBPnK7rLgi
STRIPE_AGENCY_SCALE_PRICE_ID=price_1SESr6LCgRgCwthBbeIR1hpf
```

**Note:** These price IDs are already hardcoded in `lib/billing/plans.ts`, so you don't need to add them to `.env` unless you want to make them configurable.

---

### Variables to Remove

❌ **None** - Keep all existing variables. The agency platform is additive and doesn't replace anything.

---

## 💳 Stripe Configuration

### Step 1: Verify Existing Products

Log into your Stripe dashboard and verify these products exist:

1. **Starter Plan** - £29.99/month
   - Price ID: `price_1SESnsLCgRgCwthBIS45euRo`
   
2. **Pro Plan** - £49.99/month
   - Price ID: `price_1SESohLCgRgCwthBBNUGP2XN`

---

### Step 2: Create Agency Products

You need to create **ONE** agency product with **metered billing** (quantity-based).

#### Product: Agency — Grow as You Go

**Settings:**
- **Name:** Agency — Grow as You Go
- **Description:** White-label social media content platform. Pay per active client.
- **Pricing Model:** Per unit (metered)
- **Price:** £39.00 per unit per month
- **Currency:** GBP
- **Billing Period:** Monthly
- **Usage Type:** Licensed (quantity-based, not metered usage)

**Steps to Create:**

1. Go to Stripe Dashboard → Products → Create Product
2. Fill in:
   - Product name: `Agency — Grow as You Go`
   - Description: `White-label social media content platform for agencies`
3. Click "Add pricing"
4. Select:
   - Pricing model: `Standard pricing`
   - Price: `£39.00`
   - Billing period: `Monthly`
   - Usage type: `Licensed` (this allows quantity updates)
5. Click "Add pricing"
6. **Copy the Price ID** (starts with `price_`)

**Important:** You need to create this product **THREE TIMES** with the same settings but different internal names to match the three tier keys in the code:

1. **Agency Starter** → Price ID: `price_1SESpcLCgRgCwthBxVnAqc2a` *(verify this exists)*
2. **Agency Growth** → Price ID: `price_1SESqJLCgRgCwthBPnK7rLgi` *(verify this exists)*
3. **Agency Scale** → Price ID: `price_1SESr6LCgRgCwthBbeIR1hpf` *(verify this exists)*

**OR** - If these don't exist, create ONE new product and update the price IDs in the code.

---

### Step 3: Update Price IDs in Code (If Needed)

If you created new Stripe products with different price IDs, update them in:

**File:** `lib/billing/plans.ts`

```typescript
export const PLANS: Record<PlanKey, { priceId: string; label: string; usageLimit: number }> = {
  SocialEcho_Starter:       { priceId: 'price_1SESnsLCgRgCwthBIS45euRo', label: 'Starter',              usageLimit: 8 },
  SocialEcho_Pro:           { priceId: 'price_1SESohLCgRgCwthBBNUGP2XN', label: 'Pro',                  usageLimit: 10_000_000 },
  SocialEcho_AgencyStarter: { priceId: 'YOUR_NEW_PRICE_ID_HERE',        label: 'Agency — Grow as You Go', usageLimit: 10_000_000 },
  SocialEcho_AgencyGrowth:  { priceId: 'YOUR_NEW_PRICE_ID_HERE',        label: 'Agency — Grow as You Go', usageLimit: 10_000_000 },
  SocialEcho_AgencyScale:   { priceId: 'YOUR_NEW_PRICE_ID_HERE',        label: 'Agency — Grow as You Go', usageLimit: 10_000_000 },
};
```

---

### Step 4: Configure Webhook Events

Ensure your Stripe webhook is configured to send these events:

**Required Events:**
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**Webhook URL:**
```
https://www.socialecho.ai/api/webhooks/stripe
```

**Webhook Secret:**
- Copy the webhook signing secret from Stripe
- Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

---

### Step 5: Test Stripe Integration

After configuration, test:

1. **Agency Signup:**
   - Go to `/pricing`
   - Click "Get Started" on Agency plan
   - Complete checkout with test card: `4242 4242 4242 4242`
   - Verify subscription created in Stripe

2. **Quantity Updates:**
   - Login as agency admin
   - Add a test client
   - Check Stripe subscription → quantity should increase to 1
   - Delete the client
   - Check Stripe subscription → quantity should decrease to 0

3. **Webhook Logs:**
   - Check your application logs for webhook events
   - Verify events are being received and processed

---

## 🔄 Complete Migration Script

Run this complete script in your Render shell to apply all database changes:

```bash
# Connect to database
psql $DATABASE_URL

# Then paste this SQL:
```

```sql
-- 1. Verify agencyId column exists (should already be done)
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'User' AND column_name = 'agencyId';

-- 2. Create Agency table
CREATE TABLE IF NOT EXISTS "Agency" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logoUrl" TEXT,
  "primaryColor" TEXT DEFAULT '#3B82F6',
  "subdomain" TEXT,
  "customDomain" TEXT,
  "plan" TEXT NOT NULL DEFAULT 'agency_universal',
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "activeClientCount" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- 3. Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_ownerId_key" ON "Agency"("ownerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_slug_key" ON "Agency"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_subdomain_key" ON "Agency"("subdomain");
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_customDomain_key" ON "Agency"("customDomain");
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_stripeCustomerId_key" ON "Agency"("stripeCustomerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Agency_stripeSubscriptionId_key" ON "Agency"("stripeSubscriptionId");

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS "Agency_slug_idx" ON "Agency"("slug");
CREATE INDEX IF NOT EXISTS "Agency_subdomain_idx" ON "Agency"("subdomain");

-- 5. Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'User_agencyId_fkey'
    ) THEN
        ALTER TABLE "User" 
        ADD CONSTRAINT "User_agencyId_fkey" 
        FOREIGN KEY ("agencyId") 
        REFERENCES "Agency"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Agency_ownerId_fkey'
    ) THEN
        ALTER TABLE "Agency" 
        ADD CONSTRAINT "Agency_ownerId_fkey" 
        FOREIGN KEY ("ownerId") 
        REFERENCES "User"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- 6. Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('User', 'Agency', 'Profile', 'Subscription', 'AuditLog')
ORDER BY table_name;

-- 7. Verify Agency table structure
\d Agency
```

---

## 📝 Deployment Steps Summary

### 1. Database Migrations

```bash
# In Render shell
psql $DATABASE_URL

# Run the complete migration script above
# Exit with \q
```

### 2. Environment Variables

In Render Dashboard → Environment:

**Add:**
```
NEXT_PUBLIC_APP_URL=https://www.socialecho.ai
AGENCY_SUPPORT_EMAIL=agency-support@socialecho.ai
```

**Keep all existing variables** - don't delete anything.

### 3. Stripe Configuration

1. Verify existing Starter and Pro products
2. Create/verify Agency product at £39/unit/month
3. Copy price IDs
4. Update `lib/billing/plans.ts` if needed
5. Configure webhook events
6. Test with test card

### 4. Restart Application

After all changes:
1. Trigger manual deploy in Render
2. Wait for deployment to complete
3. Test admin panel
4. Test agency signup flow

---

## ✅ Verification Checklist

After deployment, verify:

### Database
- [ ] `User` table has `agencyId` column
- [ ] `Agency` table exists with all columns
- [ ] Foreign key constraints exist
- [ ] Indexes created successfully

### Environment Variables
- [ ] `NEXT_PUBLIC_APP_URL` set
- [ ] `AGENCY_SUPPORT_EMAIL` set
- [ ] All existing variables still present

### Stripe
- [ ] Starter product exists (£29.99/month)
- [ ] Pro product exists (£49.99/month)
- [ ] Agency product exists (£39/unit/month)
- [ ] Webhook configured with correct events
- [ ] Webhook secret matches environment variable

### Application
- [ ] Admin panel loads without errors
- [ ] User management page works
- [ ] Pricing page shows unified agency plan
- [ ] Agency signup flow works
- [ ] Test checkout completes successfully

---

## 🚨 Troubleshooting

### Issue: Agency table creation fails

**Error:** `relation "Agency" already exists`

**Solution:** Table already exists, skip to verification step.

---

### Issue: Foreign key constraint fails

**Error:** `violates foreign key constraint`

**Solution:** 
```sql
-- Check for orphaned records
SELECT id, agencyId FROM "User" WHERE agencyId IS NOT NULL;

-- If any exist, set them to NULL
UPDATE "User" SET "agencyId" = NULL WHERE "agencyId" IS NOT NULL;

-- Then retry the foreign key creation
```

---

### Issue: Stripe price IDs don't match

**Error:** Checkout fails with "Invalid price"

**Solution:**
1. Check Stripe dashboard for actual price IDs
2. Update `lib/billing/plans.ts` with correct IDs
3. Commit and deploy changes

---

## 📞 Support

If you encounter issues:

1. Check application logs in Render dashboard
2. Check database connection: `psql $DATABASE_URL`
3. Verify Stripe webhook logs
4. Check browser console for frontend errors

---

**Document Created:** October 6, 2025  
**Last Updated:** October 6, 2025  
**Status:** Ready for Deployment
