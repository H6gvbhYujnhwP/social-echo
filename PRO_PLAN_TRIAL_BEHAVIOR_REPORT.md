# Pro Plan "Start Free Trial" Button Behavior Report

**Date:** November 3, 2025  
**Investigator:** Manus AI  
**Status:** ⚠️ MISLEADING - Button text doesn't match actual behavior

---

## Summary

The homepage shows "Start Free Trial" for both Starter and Pro plans, but **Pro does NOT offer a free trial**. The button text is misleading.

---

## Current Behavior

### Homepage (app/(marketing)/page.tsx)

**Starter Plan:**
- Button Text: "Start Free Trial" ✅ Correct
- onClick: `handleSignUp('SocialEcho_Starter')`
- Redirects to: `/pricing?plan=SocialEcho_Starter`

**Pro Plan:**
- Button Text: "Start Free Trial" ❌ **MISLEADING**
- onClick: `handleSignUp('SocialEcho_Pro')`
- Redirects to: `/pricing?plan=SocialEcho_Pro`

**Ultimate Plan:**
- Button Text: "Get Started" ✅ Correct
- onClick: `handleSignUp('SocialEcho_Ultimate')`
- Redirects to: `/pricing?plan=SocialEcho_Ultimate`

---

## What Actually Happens

### Step 1: Homepage → Pricing Page
When users click "Start Free Trial" for Pro:
- Redirects to `/pricing?plan=SocialEcho_Pro`

### Step 2: Pricing Page → Signup
On the pricing page:
- Pro plan button says "Get Started" (correct)
- Redirects to `/signup?plan=SocialEcho_Pro`

### Step 3: Signup → Stripe Checkout
In `app/signup/page.tsx` (lines 103-133):

```typescript
if (plan) {
  const isStarterPlan = plan.toLowerCase().includes('starter');
  
  if (isStarterPlan) {
    // Starter plan gets free trial - skip payment, go to training
    router.push('/train?welcome=1')
    return
  }
  
  // For Pro and Ultimate plans, redirect to Stripe Checkout
  const checkoutRes = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      planKey: plan,
      withTrial: false // No Stripe trial for Pro/Ultimate
    })
  })
  
  // Redirect to Stripe Checkout
  if (checkoutData.url) {
    window.location.href = checkoutData.url
    return
  }
}
```

**What this means:**
- **Starter:** Gets free trial (30 posts, no payment required)
- **Pro:** Goes directly to Stripe Checkout (£49.99 charged immediately)
- **Ultimate:** Goes directly to Stripe Checkout (£179 charged immediately)

---

## The Problem

### Homepage Button Text is Misleading

| Plan | Homepage Button | Actual Behavior | Correct? |
|------|----------------|-----------------|----------|
| Starter | "Start Free Trial" | Free trial (30 posts) | ✅ Yes |
| Pro | "Start Free Trial" | Immediate payment (£49.99) | ❌ **NO** |
| Ultimate | "Get Started" | Immediate payment (£179) | ✅ Yes |

---

## User Experience Issue

**What users expect when they click "Start Free Trial" for Pro:**
- Sign up and get a free trial with 100 posts
- No payment required initially
- Can try the Pro features before committing

**What actually happens:**
- Sign up
- Immediately redirected to Stripe Checkout
- Must pay £49.99 to proceed
- **No free trial**

This creates a **trust issue** and **conversion drop-off** because:
1. Users feel misled
2. They're not prepared to pay immediately
3. The button promise doesn't match reality

---

## Recommendation

### Option 1: Change Button Text (Simple Fix)
**Homepage:**
- Starter: "Start Free Trial" (keep as is)
- Pro: "Get Started" (change from "Start Free Trial")
- Ultimate: "Get Started" (keep as is)

This makes the homepage consistent with the pricing page and sets correct expectations.

### Option 2: Add Free Trial to Pro (Complex)
If you want to offer a free trial for Pro:
1. Update signup logic to give Pro users a trial status
2. Modify Stripe checkout to include trial period
3. Update usage limits to allow trial users to access Pro features
4. Add trial expiration logic

**This is more complex and requires careful planning.**

---

## Files That Need Changing (Option 1 - Simple Fix)

### app/(marketing)/page.tsx
**Line 458:** Change button text from "Start Free Trial" to "Get Started"

```typescript
// Before
buttonText="Start Free Trial"

// After
buttonText="Get Started"
```

That's it! One line change.

---

## Conclusion

The Pro plan button on the homepage says "Start Free Trial" but there is **no free trial** for Pro. Users are immediately charged £49.99 after signup.

**Recommended Action:** Change the Pro button text to "Get Started" to match the pricing page and set correct user expectations.

---

**Status:** Awaiting user decision on whether to:
1. Change button text (simple, recommended)
2. Add free trial to Pro (complex)
3. Keep as is (not recommended - misleading)
