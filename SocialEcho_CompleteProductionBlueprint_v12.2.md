# Social Echo — Complete Production Blueprint v12.2

**Last Updated:** November 3, 2025  
**Version:** 12.2  
**Status:** ✅ **Production Verified** (New Post Limits + Trial System Correction + All Previous Features)

---

### What's New in v12.2

#### Plan & Trial System Corrections 🚀

**1. New Post Limits:**
- ✅ **Starter Plan:** 8 → 30 posts per month
- ✅ **Pro Plan:** 30 → 100 posts per month
- ✅ **Ultimate Plan:** Unlimited (unchanged)

**2. Trial System Correction:**
- ✅ **Trial Posts:** 8 → 30 free posts for new trial users
- ✅ **Trial Type:** Usage-based (30 posts), not time-based (no 24-hour limit)
- ✅ **UI/Backend Alignment:** All UI copy, email templates, and backend logic now consistently reference 30 free posts

**3. Pro Plan Button Fix:**
- ✅ **Homepage Button:** Changed from misleading "Start Free Trial" to "Get Started"
- ✅ **User Expectation:** Now correctly sets expectation that Pro plan requires immediate payment

**Technical Implementation:**
- Updated `lib/usage/limits.ts` and `lib/billing/plan-map.ts` with new post limits
- Updated all UI text files (7 files) to reflect new post limits
- Updated email templates and plan metadata with new post limits
- Updated `app/api/auth/signup/route.ts` to give 30 free posts instead of 8
- Updated all hardcoded 8-post references to 30 in backend files
- Updated `app/(marketing)/page.tsx` to change Pro button text

**Git Commits:**
- `b176c83` - Fix trial limit: 8 → 30 posts to match UI promises
- `91f7dd8` - Fix Pro plan button text: 'Start Free Trial' → 'Get Started'
- `3781a33` - Update plan limits: Starter 8→30, Pro 30→100

---

### What's New in v12.1

#### Feedback-to-Training Loop & Learning Profile 🚀

**Core Features:**
- ✅ **Feedback-to-Training Loop:** A complete system that turns user feedback into actionable learning signals for the AI.
- ✅ **Learning Signals Service:** Analyzes user feedback (thumbs up/down and notes) to derive preferred/avoided terms, tone preferences, and post type preferences.
- ✅ **AI Integration:** Learning signals are now derived before every post generation and influence the AI's output.
- ✅ **My Learning Profile Page:** A new dashboard page that gives users full transparency and control over their AI's learning.
- ✅ **Edit Functionality:** Users can now edit both the rating (thumbs up/down) and the note text of their feedback.

**Technical Implementation:**
- Created a new `LearningSignals` service (`lib/ai/learning-signals.ts`) to analyze feedback and derive learning signals.
- Created new API endpoints for fetching learning signals (`/api/learning-signals`) and feedback history (`/api/feedback/history`).
- Integrated learning signals into the `prompt-builder.ts` to influence AI generation.
- Created a new `My Learning Profile` page (`app/learning-profile/page.tsx`) with a comprehensive UI.
- Added edit functionality to the Learning Profile page, including a new `updateFeedback()` function and UI for editing notes.

**User Experience Improvements:**
- **Before:** Feedback was collected but did not influence the AI.
- **After:** The AI now learns from user feedback, becoming more personalized over time.
- **Before:** No way to see what the AI has learned.
- **After:** The Learning Profile page provides full transparency into the AI's learning process.
- **Before:** No way to edit feedback.
- **After:** Users can now edit both the rating and the note of their feedback.

**Files Changed:**
- `lib/ai/learning-signals.ts` (NEW)
- `app/api/learning-signals/route.ts` (NEW)
- `app/api/feedback/history/route.ts` (MODIFIED)
- `lib/ai/prompt-builder.ts` (MODIFIED)
- `app/learning-profile/page.tsx` (NEW)
- `components/Header.tsx` (MODIFIED)
- `components/LearningProgress.tsx` (MODIFIED)
- `components/FeedbackButtons.tsx` (MODIFIED)

**Git Commits:**
- `df22b80` - Add note editing to Learning Profile feedback edit feature
- `7c5067f` - Add edit functionality to Learning Profile feedback history
- `547ba0f` - Implement Feedback-to-Training Loop and Learning Profile

---

### What's New in v12.0

#### 18-Step Onboarding Trainer System 🚀

**Onboarding Trainer Implementation:**
- ✅ **Complete 18-Step Onboarding Flow:** A comprehensive and interactive guide for new users, from welcome screen to final celebration.
- ✅ **Profile Setup (Steps 1-11):** Guides users through filling out their Echo profile, a critical step for personalizing AI-generated content.
- ✅ **Dashboard Training (Steps 12-17):** A guided tour of the main dashboard, explaining key features like post generation, post types, customization, feedback, and image generation.
- ✅ **Final Celebration (Step 18):** A final confirmation screen that congratulates the user and summarizes the key benefits of the platform.
- ✅ **Bug Fix:** Resolved a critical client-side JavaScript exception that was blocking the dashboard training.

**Technical Implementation:**
- Created a new `OnboardingProvider` to manage the state of the onboarding process.
- Implemented a series of `OnboardingModal` and `SpotlightTooltip` components to guide the user.
- Fixed a bug in `DashboardTrainingSteps.tsx` by replacing a `SpotlightTooltip` that used an invalid CSS selector (`:contains()`) with a standard `OnboardingModal`.
- The fix was committed and pushed to the `main` branch, and automatically deployed to the production environment.

**User Experience Improvements:**
- **Before:** The onboarding process was incomplete and buggy, with a critical JavaScript error blocking users from completing the dashboard training.
- **After:** A smooth, end-to-end onboarding experience that guides users through the entire platform, increasing user engagement and reducing churn.

**Files Changed:**
- `components/onboarding/DashboardTrainingSteps.tsx` (MODIFIED)
- `components/onboarding/OnboardingProvider.tsx` (NEW)
- `components/onboarding/OnboardingModal.tsx` (NEW)
- `components/onboarding/SpotlightTooltip.tsx` (MODIFIED)

**Git Commits:**
- `91dc37d` - Fix Step 13: Replace SpotlightTooltip with modal to avoid invalid :contains() selector

---

### What's New in v11.3

#### Image Generation & Persistence System 🖼️

**Image Persistence Implementation:**
- ✅ **Complete Image Persistence:** Generated images now persist across navigation and page refreshes
- ✅ **Database Storage:** Images automatically saved to PostHistory table when generated
- ✅ **Image Restoration:** Images restored when returning to dashboard or loading saved posts
- ✅ **History Integration:** Images displayed as thumbnails in history drawer (already existed, now fully functional)
- ✅ **New API Endpoint:** `PATCH /api/posts/[id]/image` for saving images to existing posts
- ✅ **Enhanced GET Response:** `/api/posts` now includes `imageUrl` and `imageStyle` fields
- ✅ **ImagePanel Props:** Added `savedImageUrl` and `savedImageStyle` props for state restoration
- ✅ **Automatic Saving:** Dashboard automatically saves generated images to database
- ✅ **History Button:** Added History button to Create Image section for easy access

**Technical Implementation:**
- Created new API endpoint: `app/api/posts/[id]/image/route.ts` (95 lines)
- Updated `app/api/posts/route.ts` to include image fields in response
- Enhanced `components/ImagePanel.tsx` with saved image props and restoration logic
- Updated `app/dashboard/page.tsx` to save and restore images automatically
- Images stored as base64 data URLs in PostgreSQL (no external storage needed)

**User Experience Improvements:**
- **Before:** Images disappeared when navigating away from dashboard
- **After:** Images persist across navigation, page refreshes, and history restoration
- **Before:** No history button on Create Image section
- **After:** History button opens drawer showing all posts with image thumbnails

**Error Handling Improvements:**
- ✅ **Better Error Messages:** OpenAI content policy violations now show specific error messages
- ✅ **Content Policy Handling:** Distinguishes between safety system rejections and actual failures
- ✅ **User-Friendly Feedback:** Clear guidance when image prompts are rejected by safety system
- ✅ **Retry Suggestions:** Helpful messages suggesting users try again or adjust content

**Files Changed:**
- `app/api/posts/[id]/image/route.ts` (NEW - 95 lines)
- `app/api/posts/route.ts` (+2 lines)
- `app/api/generate-image/route.ts` (+15 lines)
- `components/ImagePanel.tsx` (+24 lines)
- `app/dashboard/page.tsx` (+35 lines)

**Git Commits:**
- `85abbd3` - Implement image persistence and history functionality
- `ce68039` - Improve image generation error handling and add history button

---

### What's New in v11.2

#### Critical Bug Fixes & Production Improvements 🔧

**Admin Dashboard Fixes:**
- ✅ **Admin Login Redirect:** Fixed 403 Forbidden error when accessing `/admin73636` without authentication - now properly redirects to login page
- ✅ **Usage Display Fix:** Admin user management now correctly shows actual post usage from `UsageCounter` table instead of stale `Subscription.usageCount` values
- ✅ **Cancellation Reason Column:** New "Cancellation" column in admin user management showing reason badges and comments for cancelled subscriptions

**Downgrade & Cancellation Flow Fixes:**
- ✅ **Downgrade Banner Fix:** Removed incorrect "Subscription Cancelled" banner when users have scheduled downgrades - now only shows for actual cancellations
- ✅ **Cancel Button Visibility:** "Cancel Subscription" button now always visible, even during scheduled downgrades (users can cancel entirely)
- ✅ **Cancellation API Fix:** Fixed 400 error when trying to cancel subscription with scheduled downgrade - API now distinguishes between actual cancellations and downgrades
- ✅ **Subscription Schedule Handling:** When cancelling during a downgrade, the system now properly releases the subscription schedule first, then cancels the subscription
- ✅ **Database Cleanup:** `pendingPlan` field is now cleared when subscription is cancelled

**Email Deliverability Analysis:**
- ✅ **Comprehensive Investigation:** Documented why cancellation emails may go to junk (missing SPF/DKIM/DMARC, noreply@ sender, promotional content)
- ✅ **Recommendations Provided:** Clear guidance on fixing email authentication, changing sender address, and improving email content

**Technical Improvements:**
- Middleware now properly allows access for active subscriptions with `cancelAtPeriodEnd=true` (scheduled downgrades)
- Cancel API validates `pendingPlan` field to distinguish downgrades from cancellations
- Admin API fetches cancellation feedback from `CancellationFeedback` table
- Stripe subscription schedule release implemented before cancellation

**User Experience:**
- **Before:** Downgrade showed "Subscription Cancelled" → Confusing
- **After:** Downgrade shows "Downgrade Scheduled" → Clear
- **Before:** Cancel button disappeared during downgrade → Frustrating
- **After:** Cancel button always visible → User has control
- **Before:** Clicking "Confirm Cancellation" did nothing → Broken
- **After:** Cancellation works perfectly → Fixed

---

### What's New in v11.1

#### Cancellation Feedback & Access Retention System 🔄
- ✅ **Feedback Modal:** Beautiful modal requiring users to select a reason before cancellation (5 options + comment field)
- ✅ **Access Retention:** Users stay logged in and retain full access until billing period ends (no immediate logout)
- ✅ **Reactivation Functionality:** Green "Reactivate Subscription" button allows users to undo cancellation before period ends
- ✅ **Immediate Cancellation Email:** Email sent immediately after cancellation (in addition to webhook email at period end)
- ✅ **Admin Analytics:** New "Cancellation" column in user management showing reason badges and comments
- ✅ **Middleware Updates:** Allow access for active subscriptions even with `cancelAtPeriodEnd=true`
- ✅ **JWT Token Enhancement:** Includes `cancelAtPeriodEnd` and `currentPeriodEnd` for real-time status
- ✅ **Database Model:** New `CancellationFeedback` table tracking reasons and comments
- ✅ **Stripe Integration:** Properly sets `cancel_at_period_end` flag, no future charges
- ✅ **Visual Indicators:** Yellow banner showing end date and days remaining for cancelled subscriptions

#### Cancellation Reasons Tracked
- 💰 Too expensive
- ⏰ Not using it enough
- 🔧 Missing features I need
- 📝 Other reason (with optional comment)

#### User Experience Improvements
- **Before:** Browser confirm → Immediate logout → Lost access (even though paid)
- **After:** Feedback modal → Stay logged in → Yellow banner with end date → Reactivation option → Access until period ends

---

### What's New in v11.0

#### Document Upload Feature 📄
- ✅ **Document Upload UI:** New section on the "Train Your Echo" page for uploading documents.
- ✅ **Supported File Types:** .txt, .doc, and .docx.
- ✅ **PDF Support Removed:** PDF upload functionality was removed due to technical compatibility issues.
- ✅ **AI Integration:** The AI randomly (30% chance) incorporates snippets from uploaded documents into generated posts for greater variety and relevance.
- ✅ **Backend API:** Secure endpoints for uploading, retrieving, and deleting documents.
- ✅ **Database Integration:** Document content is stored in the `Profile` model.
- ✅ **Null Byte Sanitization:** (v11.3) Fixed DOCX upload errors by removing null bytes before database insert

---

## Document Overview

This blueprint documents the complete Social Echo application with **New Post Limits**, **Trial System Correction**, **Feedback-to-Training Loop**, **18-Step Onboarding Trainer**, **image persistence**, **enhanced security**, **document upload improvements**, **Ultimate plan implementation**, **GA4 analytics tracking**, and all verified features. All functionality has been tested in production.

### What's New in v10.0

#### Payment System Fixes 🔧
- ✅ **3D Secure Payment Fix:** Resolved false payment failure notifications during 3D Secure authentication
- ✅ **Payment Intent Status Check:** Added status validation before sending failure emails
- ✅ **Ultimate Plan Payment Handling:** Fixed payment flow for higher-value subscriptions (£179)
- ✅ **Webhook Improvements:** Enhanced `invoice.payment_failed` and `payment_intent.payment_failed` handlers
- ✅ **Defensive Error Handling:** Only send failure notifications for actual payment failures, not temporary authentication states

#### Google Analytics 4 (GA4) Implementation 📊
- ✅ **GA4 Base Tracking:** Full GA4 integration with measurement ID G-67GSJZ0Z3B
- ✅ **SPA Pageview Tracking:** Automatic pageview events for Next.js App Router navigation
- ✅ **Automatic Click Tracking:** Site-wide button and link click tracking without manual coding
- ✅ **Custom Event Tracking:** Type-safe event tracking utility for specific user actions
- ✅ **CTA Performance Tracking:** Homepage and pricing page call-to-action tracking
- ✅ **Plan Selection Funnel:** Detailed tracking of pricing plan selections with plan name and price
- ✅ **Realtime Debugging:** Console logging for development and testing
- ✅ **Environment Variable Configuration:** `NEXT_PUBLIC_GA_ID` for flexible deployment

#### Analytics Events Tracked
**Automatic Events:**
- `page_view` - All page views including SPA navigation
- `button_click` - Every button clicked site-wide
- `link_click` - Every link clicked site-wide
- `cta_click` - Call-to-action conversions
- `plan_selected` - Pricing plan selections with pricing data
- `form_start`, `form_submit` - Form interactions
- `scroll`, `user_engagement` - Engagement metrics

**Event Categories:**
- `navigation` - Page navigation and links
- `cta` - Call-to-action buttons
- `form` - Form interactions
- `engagement` - General user engagement
- `conversion` - Plan selections and purchases
- `social` - Social proof interactions

#### Technical Implementation
- ✅ **GA Pageview Component:** `app/ga-pageview.tsx` for SPA tracking
- ✅ **GA Click Tracker:** `app/ga-click-tracker.tsx` for automatic click tracking
- ✅ **Event Tracking Utility:** `lib/analytics/track-event.ts` with type-safe functions
- ✅ **Suspense Boundary:** Proper Next.js 14+ static generation support
- ✅ **Homepage Integration:** CTA tracking on hero and pricing sections
- ✅ **Pricing Page Integration:** Plan selection tracking with detailed metadata

### What's New in v9.2

#### Ultimate Plan Implementation ✨
- ✅ **Ultimate Plan Backend:** Complete backend support for unlimited posts and regenerations
- ✅ **Ultimate Plan Frontend:** Pricing page card, dashboard unlimited display, regenerate button
- ✅ **Null-Safety Implementation:** TypeScript build passes with nullable `usageLimit` field
- ✅ **Database Migration:** Safe migration to support unlimited plans (`usageLimit Int?`)
- ✅ **Fair Usage Policy:** Internal limit of 1,000,000 posts/month (effectively unlimited)
- ✅ **Usage Counter Hidden:** "Posts left" text hidden for Ultimate users
- ✅ **Stripe Integration:** £179/month pricing, immediate billing, no trial
- ✅ **Upgrade/Downgrade Flows:** Seamless transitions to/from Ultimate plan
- ✅ **Production Deployed:** All features live and tested with real subscription

#### Technical Improvements
- ✅ **Helper Functions:** `isUnlimitedMonthly()` and `formatLimit()` for null-safety
- ✅ **Type Safety:** All TypeScript errors resolved for nullable usage limits
- ✅ **Regeneration Infinity:** `customisationsLeft === Infinity` for Ultimate users
- ✅ **Plan Helpers:** `isProOrHigher()` for feature gating
- ✅ **Missing Dependencies:** Added `jose` package for agency impersonation

### What's in v9.1

#### Navigation & Layout Fixes
- ✅ **Help Page Navigation Fix:** Removed double header, consistent menu across all marketing pages
- ✅ **Mobile Responsive Dashboard:** Fixed horizontal scrolling, single-column layout on mobile
- ✅ **Post Type Section UI:** Improved button visibility and label positioning on mobile

#### Content & Copy Updates
- ✅ **Social Media Rebrand:** Replaced all "LinkedIn" references with generic "Social Media" copy
- ✅ **SEO & Meta Tags:** Updated all page titles and descriptions for multi-platform positioning

#### Form & Validation Fixes
- ✅ **Country Field Optional:** Fixed validation error when "Not specified" is selected
- ✅ **Better Error Messages:** Clearer validation feedback across forms

#### Image Generation Improvements
- ✅ **Vision API Integration:** OpenAI Vision API for reliable text detection
- ✅ **Text Checkbox Fix:** "Include text in image" checkbox now works correctly
- ✅ **Smart Detection:** Only checks for text when checkbox is unchecked
- ✅ **Automatic Retry:** Regenerates images with unwanted text automatically
- ✅ **Image Persistence:** (v11.3) Images now persist across navigation and page refreshes
- ✅ **History Button:** (v11.3) Added History button to Create Image section
- ✅ **Better Error Messages:** (v11.3) OpenAI content policy violations show specific errors

### What's in v9.0

- ✅ **Homepage Redesign:** New hero section, agency comparison, features showcase
- ✅ **Agency Plan Hidden:** Removed from public homepage and pricing page
- ✅ **Navigation Update:** "Features" replaced with "How It Works"
- ✅ **Generate Button Fix:** Immediate visual feedback when clicking "Generate New Post"

### What's in v8.9

- ✅ **Post Refinement System:** AI refines existing posts instead of generating new ones
- ✅ **Customisation Counter Fix:** Counter progresses correctly (2/2 → 1/2 → 0/2)
- ✅ **Regenerate Endpoint Fix:** Updated to use v8.8 AI service

### What's in v8.8

- ✅ **24-Hour Starter Trial:** Verified working in production - no immediate charge
- ✅ **Trial-to-Pro Upgrade:** Tested and confirmed - only £49.99 charged
- ✅ **Live Countdown Timer:** Real-time trial countdown in dashboard

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Subscription Plans](#2-subscription-plans)
3. [Free Trial System](#3-free-trial-system)
4. [Checkout Flow](#4-checkout-flow)
5. [Upgrade Flow](#5-upgrade-flow)
6. [Downgrade Flow](#6-downgrade-flow)
7. [Cancel Downgrade Flow](#7-cancel-downgrade-flow)
8. [Cancellation & Reactivation System](#8-cancellation--reactivation-system)
9. [Stripe Webhooks](#9-stripe-webhooks)
10. [Database Schema](#10-database-schema)
11. [API Reference](#11-api-reference)
12. [AI Generation System](#12-ai-generation-system)
13. [Post Refinement System](#13-post-refinement-system)
14. [Usage Tracking System](#14-usage-tracking-system)
15. [UI Components](#15-ui-components)
16. [Environment Variables](#16-environment-variables)
17. [Google Analytics 4 (GA4) Implementation](#17-google-analytics-4-ga4-implementation)
18. [Security](#18-security)

---

## 1. System Architecture

Social Echo is a full-stack application built with the following technologies:

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (hosted on Render)
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **AI:** OpenAI (GPT-4o-mini, DALL-E 3, Vision API)
- **Deployment:** Render

---

## 2. Subscription Plans

| Plan | Price | Monthly Posts | Regenerations | Key Features |
|---|---|---|---|---|
| Starter | £29.99/mo | 30 | 2 per post | AI post generation, image generation |
| Pro | £49.99/mo | 100 | 2 per post | All Starter features + more posts |
| Ultimate | £179/mo | ✨ Unlimited | ✨ Unlimited | All Pro features + unlimited usage |
| Agency | Custom | Unlimited | Unlimited | All Ultimate features + white-labeling |

---

## 3. Free Trial System

- **Trial Plan:** Starter plan
- **Trial Type:** Usage-based (30 posts)
- **Billing:** No immediate charge. No credit card required.
- **Conversion:** After 30 posts are used, users must upgrade to a paid plan to continue.
- **Upgrade:** Users can upgrade to Pro or Ultimate at any time during the trial. The trial ends immediately and the new plan is charged.

---

## 4. Checkout Flow

- **Stripe Checkout:** Uses Stripe Checkout for secure payment processing.
- **Webhook:** `checkout.session.completed` webhook creates the subscription in the database.
- **User Creation:** New users are created in the database upon successful checkout.

---

## 5. Upgrade Flow

- **Immediate Upgrade:** Upgrades are effective immediately.
- **Prorated Billing:** Stripe automatically calculates the prorated cost, crediting the unused time on the old plan and charging the difference.
- **Trial Upgrade:** Upgrading from a trial ends the trial immediately and charges the full price of the new plan.

---

## 6. Downgrade Flow

- **Scheduled Downgrade:** Downgrades are scheduled to occur at the end of the current billing period.
- **Stripe Subscription Schedules:** Uses Stripe Subscription Schedules to manage the downgrade.
- **No Immediate Change:** Users retain their current plan's features until the billing period ends.

---

## 7. Cancel Downgrade Flow

- **User Control:** Users can cancel a scheduled downgrade at any time before it takes effect.
- **Stripe API:** Releases the subscription schedule in Stripe, reverting to the original subscription.

---

## 8. Cancellation & Reactivation System

- **Feedback Modal:** Requires users to provide a reason for cancellation.
- **Access Retention:** Users retain access to their plan's features until the end of the billing period.
- **Reactivation:** Users can reactivate their subscription with a single click before the period ends.

---

## 9. Stripe Webhooks

- **Endpoint:** `/api/webhooks/stripe`
- **Events Handled:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `payment_intent.payment_failed`
- **3D Secure Fix:** Handles 3D Secure authentication gracefully, preventing false payment failure notifications.

---

## 10. Database Schema

- **User:** Stores user information, including email, role, and subscription details.
- **Subscription:** Stores subscription details, including plan, status, and usage limits.
- **PostHistory:** Stores all generated posts, including text, image URL, and post type.
- **UsageCounter:** Tracks post usage for each user.
- **CancellationFeedback:** Stores cancellation reasons and comments.
- **Document:** Stores uploaded documents for AI integration.

---

## 11. API Reference

- **Authentication:** All API endpoints are protected and require a valid JWT token.
- **Authorization:** Endpoints verify that the user has the necessary permissions to access the requested resources.
- **Ownership:** Endpoints verify that the user owns the resources they are trying to access.

---

## 12. AI Generation System

- **AI Model:** GPT-4o-mini for text generation, DALL-E 3 for image generation, and Vision API for text detection in images.
- **Prompt Engineering:** A sophisticated prompt builder constructs detailed prompts based on the user's Echo profile, post type, and custom instructions.
- **Cost Optimization:** Uses GPT-4o-mini and limits `max_tokens` to control costs.

---

## 13. Post Refinement System

- **Targeted Changes:** Allows users to refine existing posts with custom instructions.
- **Customization Counter:** Limits the number of refinements per post for Starter and Pro plans.
- **Refinement History:** Links refined posts to their originals.

---

## 14. Usage Tracking System

- **Real-time Tracking:** The `UsageCounter` table is updated in real-time as posts are generated.
- **Plan Limits:** Enforces the usage limits for each subscription plan.
- **Unlimited Handling:** Gracefully handles unlimited usage for the Ultimate plan.

---

## 15. UI Components

- **Onboarding Trainer:** A series of modals and tooltips that guide new users through the platform.
- **Dashboard:** The main interface for generating posts and images.
- **Account Page:** Allows users to manage their subscription, view their profile, and see their usage.
- **Admin Dashboard:** A separate interface for administrators to manage users and view analytics.

---

## 16. Environment Variables

- **Stripe:** API keys, price IDs, and webhook secret.
- **Database:** Connection URL.
- **Authentication:** NextAuth secret and JWT secret.
- **AI Services:** OpenAI and Anthropic API keys.
- **Email:** Resend API key and support email addresses.
- **App URLs:** Application URLs for redirects.
- **Analytics:** GA4 measurement ID.

---

## 17. Google Analytics 4 (GA4) Implementation

- **Comprehensive Tracking:** Tracks page views, clicks, and custom events.
- **SPA Support:** Automatically tracks page views in the Next.js App Router.
- **Automatic Click Tracking:** Tracks all button and link clicks site-wide.

---

## 18. Security

- **Authentication:** All sensitive pages and API endpoints are protected with NextAuth.js.
- **Authorization:** The system verifies that users have the necessary permissions to access resources.
- **Ownership:** The system verifies that users own the resources they are trying to access.
- **Data Sanitization:** All user input is sanitized to prevent XSS and other attacks.
- **SQL Injection Prevention:** The use of Prisma ORM prevents SQL injection attacks.
- **CSRF Protection:** NextAuth.js provides built-in CSRF protection.

---
