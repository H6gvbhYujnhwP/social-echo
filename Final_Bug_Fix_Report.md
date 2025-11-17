# Bug Fix & Verification Report: Dashboard Post Count

**Date:** November 17, 2025
**Status:** Resolved

## 1. Summary

This report details the investigation and resolution of a critical bug where the user dashboard was incorrectly displaying **30 of 30** posts for new free trial users, instead of the correct **8 of 8** posts.

The issue was successfully identified and fixed. The root cause was a hardcoded value in the backend code that overrode the database-driven subscription limits for trial users. After deploying the fix, we have verified that new trial accounts now correctly display the 8-post limit on the dashboard.

## 2. The Problem

When a new user signed up for a free trial, the system was expected to grant them 8 free posts. While the account page and admin panel correctly showed an 8-post limit, the main dashboard was incorrectly displaying a 30-post limit.

This created a confusing user experience and misrepresented the actual trial offering.

**Symptoms:**
- **Dashboard:** Showed "Posts left: 30 of 30"
- **Account Page:** Correctly showed "8 posts included"
- **Admin Panel:** Correctly showed "0/8" usage

This discrepancy pointed to an issue in how the dashboard was fetching or calculating the post allowance, as other parts of the system were working correctly.

## 3. Investigation & Findings

Our investigation followed a logical path from the frontend to the backend to pinpoint the source of the incorrect value.

### Step 1: Frontend Code Analysis

We first examined the dashboard UI code. We discovered two different components responsible for displaying post counts:

1.  **Dashboard `page.tsx`**: Displays `Posts: {usageCount}/{usageLimit}` using data from the `/api/subscription` endpoint. This was showing the correct values.
2.  **`UsageCounter.tsx` Component**: Displays `Posts left: {posts_left} of {posts_allowance}` using data from the `/api/usage` endpoint. This was the component showing the incorrect "30 of 30" value.

This finding narrowed the problem down to the `/api/usage` endpoint and its data source.

### Step 2: Backend API Analysis

We then traced the data flow for the `/api/usage` endpoint:

1.  The `/api/usage/route.ts` file handles the API request.
2.  It calls the `checkPostsRemaining()` function from the `/lib/usage/service.ts` file to get the usage data.
3.  The `checkPostsRemaining()` function was calling another function, `getUsageLimit(plan)`, to determine the post allowance.

### Step 3: Root Cause Discovery

The final step of the investigation led us to the root cause in `/lib/usage/limits.ts`:

```typescript
// lib/usage/limits.ts

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  starter:  { postsPerMonth: 30,   regenerationsPerPost: 2 }, // BUG FOUND HERE
  pro:      { postsPerMonth: 100,  regenerationsPerPost: 2 },
  ultimate: { postsPerMonth: null, regenerationsPerPost: null },
  agency:   { postsPerMonth: null, regenerationsPerPost: null },
};
```

The `getUsageLimit()` function was looking up the plan name ("starter") in this hardcoded `PLAN_LIMITS` map and returning **30**, completely ignoring the `usageLimit` value of **8** that was correctly set in the database for free trial users.

## 4. The Solution

The fix was to modify the `checkPostsRemaining()` function in `/lib/usage/service.ts` to prioritize the `usageLimit` value from the database subscription record before falling back to the hardcoded plan limits.

This ensures that custom limits for trials or special promotions are always respected.

**Code Change in `/lib/usage/service.ts`:**

**Before (Incorrect):**
```typescript
const postsAllowance = getUsageLimit(plan); // Always returned 30 for "starter"
```

**After (Correct):**
```typescript
const postsAllowance = subscription.usageLimit ?? getUsageLimit(plan);
// Uses database value (8) if set, otherwise falls back to plan limit (30)
```

This simple but critical change ensures the system is flexible and that the database remains the single source of truth for user-specific limits.

## 5. Verification

After deploying the fix, we performed the following verification steps:

1.  Created a new free trial account.
2.  Navigated to the dashboard.
3.  **Confirmed that the dashboard now correctly displays "Posts left: 8 of 8".**

This successful test confirms that the bug is fully resolved.

--- 

Congratulations on resolving this issue! The system is now more robust and provides a consistent experience for your users.
