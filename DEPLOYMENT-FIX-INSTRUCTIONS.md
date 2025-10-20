# SocialEcho Signup Fix - Deployment Instructions

## Issue Summary
The signup flow was failing with error: `The column User.businessName does not exist in the current database`

## Root Cause
- The `businessName` field was added to the Prisma schema but no migration was created
- The production database doesn't have this column yet
- Missing `STRIPE_AGENCY_PRICE_ID` environment variable

## Fixes Applied

### 1. Database Migration Created
- **File**: `prisma/migrations/20251017_add_business_name/migration.sql`
- **Action**: Adds `businessName VARCHAR(120)` column to User table

### 2. Environment Variable Required
Add this to Render environment variables:

```
Key: STRIPE_AGENCY_PRICE_ID
Value: price_1SFCsCLCgRgCwthBJ4l3xVFT
```

## Deployment Steps

### Step 1: Add Missing Environment Variable
1. Go to Render Dashboard → social-echo service
2. Click "Environment" tab
3. Add new environment variable:
   - **Key**: `STRIPE_AGENCY_PRICE_ID`
   - **Value**: `price_1SFCsCLCgRgCwthBJ4l3xVFT`
4. Click "Save Changes" (this will trigger a rebuild)

### Step 2: Run Database Migration
After the deployment completes, run this migration manually:

**Option A: Via Render Shell**
1. Go to Render Dashboard → social-echo service
2. Click "Shell" tab
3. Run:
```bash
npx prisma migrate deploy
```

**Option B: Via Direct SQL (if Prisma fails)**
Connect to your PostgreSQL database and run:
```sql
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "businessName" VARCHAR(120);
```

### Step 3: Verify the Fix
1. Go to https://www.socialecho.ai/signup?plan=SocialEcho_Pro
2. Fill in the signup form with:
   - Name: Test User
   - Business name: Test Business (optional)
   - Email: test@example.com
   - Password: testpass123
3. Click "Create Account & Continue to Payment"
4. Should redirect to Stripe Checkout successfully

## Expected Behavior After Fix

### Signup Flow
1. User fills signup form → Creates User record with `businessName`
2. Creates Subscription with `plan: 'none'`, `status: 'pending_payment'`
3. Auto signs in user
4. Redirects to Stripe Checkout with proper tax configuration
5. After payment, webhook updates Subscription to `plan: 'pro'`, `status: 'active'`
6. User can access `/train` page

### Stripe Checkout Configuration
The checkout includes all required fields for automatic tax:
- ✅ `automatic_tax: { enabled: true }`
- ✅ `billing_address_collection: 'required'`
- ✅ `customer_update: { address: 'auto', name: 'auto' }`
- ✅ `tax_id_collection: { enabled: true }`

## Files Changed
- `prisma/migrations/20251017_add_business_name/migration.sql` (NEW)
- No code changes required - existing code is correct

## Verification Checklist
- [ ] `STRIPE_AGENCY_PRICE_ID` added to Render environment
- [ ] Database migration applied successfully
- [ ] Signup flow works without errors
- [ ] Stripe Checkout redirects properly
- [ ] Webhook processes payment and activates subscription
- [ ] User can access `/train` after payment

## Troubleshooting

### If signup still fails:
1. Check Render logs for errors
2. Verify all Stripe Price IDs are correct:
   - `STRIPE_STARTER_PRICE_ID=price_1SESnsLCgRgCwthBIS45euRo`
   - `STRIPE_PRO_PRICE_ID=price_1SFD2xLCgRgCwthB6CVcyT4r`
   - `STRIPE_AGENCY_PRICE_ID=price_1SFCsCLCgRgCwthBJ4l3xVFT`
3. Verify database has `businessName` column:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'User' AND column_name = 'businessName';
   ```

### If Stripe Checkout fails:
1. Check that automatic tax is enabled in Stripe Dashboard
2. Verify webhook endpoint is configured: `https://www.socialecho.ai/api/webhooks/stripe`
3. Check webhook secret matches `STRIPE_WEBHOOK_SECRET` env var

## Next Steps After Deployment
1. Test the complete signup → payment → activation flow
2. Monitor Render logs for any errors
3. Verify webhook events are being processed correctly
4. Test with a real Stripe test card: `4242 4242 4242 4242`

