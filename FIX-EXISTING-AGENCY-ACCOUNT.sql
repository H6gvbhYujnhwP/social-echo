-- Fix existing agency account that was purchased but not properly set up
-- Run this in your Render database shell: psql $DATABASE_URL

-- 1. Find the user who purchased agency plan
-- Replace 'accounts@sweetbyte.co.uk' with the actual email if different
DO $$
DECLARE
  v_user_id TEXT;
  v_user_name TEXT;
  v_user_email TEXT;
  v_subscription_id TEXT;
  v_stripe_customer_id TEXT;
  v_stripe_subscription_id TEXT;
  v_agency_id TEXT;
  v_slug TEXT;
  v_counter INT := 1;
BEGIN
  -- Get the user details
  SELECT id, name, email 
  INTO v_user_id, v_user_name, v_user_email
  FROM "User" 
  WHERE email = 'accounts@sweetbyte.co.uk';
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User not found with email: accounts@sweetbyte.co.uk';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found user: % (%) - ID: %', v_user_name, v_user_email, v_user_id;
  
  -- Get subscription details
  SELECT id, "stripeCustomerId", "stripeSubscriptionId"
  INTO v_subscription_id, v_stripe_customer_id, v_stripe_subscription_id
  FROM "Subscription"
  WHERE "userId" = v_user_id;
  
  IF v_subscription_id IS NULL THEN
    RAISE NOTICE 'No subscription found for user';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found subscription: % (Customer: %, Subscription: %)', 
    v_subscription_id, v_stripe_customer_id, v_stripe_subscription_id;
  
  -- Update user role to AGENCY_ADMIN
  UPDATE "User"
  SET role = 'AGENCY_ADMIN'
  WHERE id = v_user_id;
  
  RAISE NOTICE 'Updated user role to AGENCY_ADMIN';
  
  -- Generate unique slug
  v_slug := lower(regexp_replace(v_user_name, '[^a-z0-9]', '-', 'g'));
  v_slug := substring(v_slug, 1, 20);
  
  -- Ensure unique slug
  WHILE EXISTS (SELECT 1 FROM "Agency" WHERE slug = v_slug) LOOP
    v_slug := substring(lower(regexp_replace(v_user_name, '[^a-z0-9]', '-', 'g')), 1, 20) || '-' || v_counter;
    v_counter := v_counter + 1;
  END LOOP;
  
  RAISE NOTICE 'Generated slug: %', v_slug;
  
  -- Create or update Agency record
  INSERT INTO "Agency" (
    id,
    "ownerId",
    name,
    slug,
    plan,
    "stripeCustomerId",
    "stripeSubscriptionId",
    "activeClientCount",
    status,
    "createdAt",
    "updatedAt"
  ) VALUES (
    gen_random_uuid()::text,
    v_user_id,
    COALESCE(v_user_name, 'My Agency'),
    v_slug,
    'agency_universal',
    v_stripe_customer_id,
    v_stripe_subscription_id,
    0,
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT ("ownerId") 
  DO UPDATE SET
    "stripeCustomerId" = EXCLUDED."stripeCustomerId",
    "stripeSubscriptionId" = EXCLUDED."stripeSubscriptionId",
    status = 'active',
    "updatedAt" = NOW()
  RETURNING id INTO v_agency_id;
  
  RAISE NOTICE 'Created/updated Agency record: %', v_agency_id;
  
  -- Create audit log entry
  INSERT INTO "AuditLog" (
    id,
    "actorId",
    action,
    meta,
    "createdAt"
  ) VALUES (
    gen_random_uuid()::text,
    v_user_id,
    'AGENCY_UPGRADE',
    jsonb_build_object(
      'message', 'Manual agency upgrade via SQL script',
      'subscriptionId', v_stripe_subscription_id,
      'agencyId', v_agency_id
    ),
    NOW()
  );
  
  RAISE NOTICE 'Created audit log entry';
  RAISE NOTICE '✅ SUCCESS: User upgraded to AGENCY_ADMIN with Agency record';
  
END $$;

-- Verify the changes
SELECT 
  u.email,
  u.name,
  u.role,
  a.id as agency_id,
  a.slug,
  a.plan,
  a."activeClientCount",
  a.status
FROM "User" u
LEFT JOIN "Agency" a ON a."ownerId" = u.id
WHERE u.email = 'accounts@sweetbyte.co.uk';
