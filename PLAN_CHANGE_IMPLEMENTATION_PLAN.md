# Social Echo: Plan Change Implementation Plan

**Date:** November 3, 2025  
**Author:** Manus AI  
**Purpose:** To provide a comprehensive plan for changing the post limits for the Starter and Pro plans, ensuring all functionality is retained for new subscriptions, upgrades, and downgrades.

---

## 1. Executive Summary

This document outlines the necessary steps to change the post limits for the Starter and Pro plans from 8 and 30 to 30 and 100, respectively. The analysis has identified all the files that need to be updated, and a comprehensive testing checklist has been created to ensure a smooth and error-free transition.

---

## 2. Analysis of Affected Files

### 2.1. Centralized Limits

- **`lib/usage/limits.ts`**: This file contains the primary source of truth for plan limits. The `PLAN_LIMITS` constant needs to be updated.
- **`lib/billing/plan-map.ts`**: This file also contains a `limitsFor` function with hardcoded limits that needs to be updated.

### 2.2. UI Text

- **`app/(marketing)/page.tsx`**: The homepage contains hardcoded references to "8 posts" and "30 posts".
- **`app/(marketing)/pricing/page.tsx`**: The pricing page contains hardcoded references to "8 posts" and "30 posts".
- **`app/account/page.tsx`**: The account page contains a hardcoded reference to "8 posts" for the free trial.
- **`app/admin/users/page.tsx`**: The admin user management page contains hardcoded references to "8 posts/month" and "30 posts/month".
- **`app/signup/page.tsx`**: The signup page contains hardcoded references to "8 posts" for the free trial.
- **`components/TrialExhaustedModal.tsx`**: This modal contains hardcoded references to "8 posts" and "30 posts".
- **`components/UpgradeModal.tsx`**: This modal contains a hardcoded reference to "30 posts/month".

### 2.3. Email Templates

- **`lib/email/templates.ts`**: The email templates contain hardcoded references to "8 posts" and "30 posts".

### 2.4. Plan Metadata

- **`lib/billing/plan-metadata.ts`**: This file contains hardcoded features text that needs to be updated.

---

## 3. Implementation Plan

### 3.1. Update Centralized Limits

1.  **`lib/usage/limits.ts`**: Update the `PLAN_LIMITS` constant:
    ```typescript
    export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
      starter:  { postsPerMonth: 30,   regenerationsPerPost: 2 },
      pro:      { postsPerMonth: 100,  regenerationsPerPost: 2 },
      ultimate: { postsPerMonth: null, regenerationsPerPost: null }, // Unlimited everything
      agency:   { postsPerMonth: null, regenerationsPerPost: null },
    };
    ```
2.  **`lib/billing/plan-map.ts`**: Update the `limitsFor` function:
    ```typescript
    export function limitsFor(plan: Plan): number | null {
      switch (plan) {
        case 'starter':
          return 30;
        case 'pro':
          return 100;
        case 'ultimate':
          return null; // Unlimited monthly posts
        case 'agency':
          return null; // Unlimited monthly posts
        case 'none':
          return 0;
        default:
          return 0;
      }
    }
    ```

### 3.2. Update UI Text

- **`app/(marketing)/page.tsx`**: Replace all instances of "8 posts" with "30 posts" and "30 posts" with "100 posts".
- **`app/(marketing)/pricing/page.tsx`**: Replace all instances of "8 posts" with "30 posts" and "30 posts" with "100 posts".
- **`app/account/page.tsx`**: Replace "8 posts" with "30 posts".
- **`app/admin/users/page.tsx`**: Replace "8 posts/month" with "30 posts/month" and "30 posts/month" with "100 posts/month".
- **`app/signup/page.tsx`**: Replace "8 posts" with "30 posts".
- **`components/TrialExhaustedModal.tsx`**: Replace "8 posts" with "30 posts" and "30 posts" with "100 posts".
- **`components/UpgradeModal.tsx`**: Replace "30 posts/month" with "100 posts/month".

### 3.3. Update Email Templates

- **`lib/email/templates.ts`**: Replace all instances of "8 posts" with "30 posts" and "30 posts" with "100 posts".

### 3.4. Update Plan Metadata

- **`lib/billing/plan-metadata.ts`**: Update the `features` text for the Starter and Pro plans.

---

## 4. Testing Checklist

### 4.1. New Subscriptions

- [ ] **Starter Plan:** Sign up for a new Starter plan and verify that the usage limit is 30 posts.
- [ ] **Pro Plan:** Sign up for a new Pro plan and verify that the usage limit is 100 posts.
- [ ] **Ultimate Plan:** Sign up for a new Ultimate plan and verify that the usage is unlimited.

### 4.2. Upgrades

- [ ] **Starter to Pro:** Upgrade from a Starter plan to a Pro plan and verify that the usage limit is immediately updated to 100 posts.
- [ ] **Starter to Ultimate:** Upgrade from a Starter plan to an Ultimate plan and verify that the usage is immediately unlimited.
- [ ] **Pro to Ultimate:** Upgrade from a Pro plan to an Ultimate plan and verify that the usage is immediately unlimited.

### 4.3. Downgrades

- [ ] **Pro to Starter:** Downgrade from a Pro plan to a Starter plan and verify that the usage limit is updated to 30 posts at the end of the current billing period.
- [ ] **Ultimate to Pro:** Downgrade from an Ultimate plan to a Pro plan and verify that the usage limit is updated to 100 posts at the end of the current billing period.
- [ ] **Ultimate to Starter:** Downgrade from an Ultimate plan to a Starter plan and verify that the usage limit is updated to 30 posts at the end of the current billing period.

### 4.4. UI Verification

- [ ] **Pricing Page:** Verify that the pricing page correctly displays "30 posts" for the Starter plan and "100 posts" for the Pro plan.
- [ ] **Account Page:** Verify that the account page correctly displays the usage limit for the user's current plan.
- [ ] **Dashboard:** Verify that the dashboard correctly displays the usage limit and remaining posts.
- [ ] **Admin Dashboard:** Verify that the admin dashboard correctly displays the usage limits for all users.

---
