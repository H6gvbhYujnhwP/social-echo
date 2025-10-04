# SOCIAL ECHO - Complete Production Blueprint (UPDATED)
## AI-Powered LinkedIn Content Generation for SMEs

**Last Updated**: October 4, 2025  
**Status**: Phase 2 In Progress (Authentication & Admin Complete)  
**Production URL**: https://socialecho.ai  
**GitHub**: https://github.com/H6gvbhYujnhwP/social-echo

---

## Executive Summary

**Social Echo** is an AI-powered LinkedIn content generation SaaS that enables SMEs to create professional social media posts and images in under 10 minutes per day. The platform addresses the critical pain point of consistent, high-quality content creation without expensive agencies or large marketing teams.

**Current Status** (October 4, 2025):
- ✅ Core content generation fully functional
- ✅ Custom domain deployed (socialecho.ai)
- ✅ Professional UI with glass morphism design
- ✅ 4 post types (Selling, Informational, Advice, News)
- ✅ AI image generation with DALL-E 3
- ✅ 7-day Content Mix Planner
- ✅ **Database integration complete** (PostgreSQL + Prisma)
- ✅ **Authentication system complete** (NextAuth.js + 2FA)
- ✅ **Master Admin system complete** (RBAC + hidden admin URL)
- ✅ **Centralized AI configuration** (database-backed with history)
- ✅ **Master Prompt Template** (editable instruction prompts)
- ✅ **Daily Topic Rotation** (alternating content buckets)
- ✅ **Temperature Randomness** (variety in generation)
- 🚧 **Payment integration** (Phase 2 - next priority)
- 🚧 **Learning from user customizations** (Phase 2)
- 🚧 **Usage limits & subscription enforcement** (Phase 2)

---

## 🎯 Recent Implementations (October 2025)

### ✅ 1. Database Integration (Complete)

**Technology**: PostgreSQL + Prisma ORM

**Schema Implemented**:
- `User` - User accounts with email/password, 2FA support, role-based access
- `Profile` - Business profiles (matches localStorage structure)
- `PostHistory` - Generated content history
- `Feedback` - User feedback on posts (upvote/downvote)
- `PlannerDay` - 7-day content planner
- `Subscription` - Usage tracking and plan management
- `PasswordResetToken` - Secure password reset flow
- `AdminConfig` - Centralized AI configuration storage
- `AdminConfigHistory` - Audit trail for config changes

**Migration Status**: ✅ All migrations deployed to production

### ✅ 2. Authentication System (Complete)

**Technology**: NextAuth.js v4 + bcrypt + otplib

**Features Implemented**:
- ✅ Email/password registration
- ✅ Email verification (via Resend)
- ✅ Login with JWT sessions (30-day expiry)
- ✅ **2FA (Two-Factor Authentication)**:
  - TOTP (Time-based One-Time Password)
  - QR code generation for authenticator apps
  - Setup flow in user settings
  - Verification on login
- ✅ **Password reset flow**:
  - Email-based reset link
  - Secure token generation (expires in 1 hour)
  - Password strength validation
- ✅ **Role-Based Access Control (RBAC)**:
  - `USER` - Regular users (default)
  - `ADMIN` - Can view AI configuration
  - `MASTER_ADMIN` - Can edit AI configuration
- ✅ Session management with JWT
- ✅ Protected routes via middleware

**API Endpoints**:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/2fa/setup` - Setup 2FA for user
- `GET /api/auth/session` - Get current session

**Pages**:
- `/signup` - Registration page
- `/signin` - Login page (with 2FA support)
- `/admin/signin` - Admin login page (MASTER_ADMIN only)

### ✅ 3. Master Admin System (Complete)

**Purpose**: Centralized control over AI generation parameters

**Features Implemented**:
- ✅ **Hidden Admin URL**: `/admin73636` (aliases to `/admin`)
- ✅ **RBAC Protection**: Only MASTER_ADMIN can access
- ✅ **Role-Based Redirects**:
  - MASTER_ADMIN signing in → `/admin` dashboard
  - Regular USER signing in → `/dashboard`
  - Non-admins blocked from admin routes (403 Forbidden)
- ✅ **Admin Dashboard** (`/admin`):
  - Overview of system status
  - Quick links to AI configuration
  - User statistics (future)
- ✅ **AI Configuration Editor** (`/admin/ai-config`):
  - Edit all AI generation parameters
  - Real-time validation
  - Change reason tracking
  - Save/revert functionality

**Middleware Protection**:
```typescript
// middleware.ts
export const config = {
  matcher: ['/admin/:path*', '/admin73636/:path*']
}
```

**URL Rewrites** (next.config.js):
```javascript
async rewrites() {
  return [
    { source: '/admin73636', destination: '/admin' },
    { source: '/admin73636/signin', destination: '/admin/signin' },
    { source: '/admin73636/:path*', destination: '/admin/:path*' },
  ];
}
```

### ✅ 4. Centralized AI Configuration (Complete)

**Purpose**: Database-backed AI settings with full audit trail

**Configuration Fields**:
```typescript
{
  // Model Settings
  textModel: 'gpt-4.1-mini',
  temperature: 0.7,
  
  // Content Settings
  hashtagCountDefault: 8,
  allowedPostTypes: ['selling', 'informational', 'advice', 'news'],
  ukPostingTimeHint: true,
  includeHeadlineOptions: true,
  includeVisualPrompt: true,
  includeHashtags: true,
  
  // Learning Weights
  weightPreferredTerms: 0.6,
  weightDownvotedTones: 0.5,
  
  // News Mode
  enableNewsMode: true,
  newsFallbackToInsight: true,
  
  // Master Prompt Template (NEW)
  masterPromptTemplate: string,
  
  // Daily Topic Rotation (NEW)
  rotation: {
    enabled: boolean,
    mode: 'daily',
    buckets: string[],
    timezone: string,
    diversityWindowDays: number
  },
  
  // Temperature Randomness (NEW)
  randomness: {
    enabled: boolean,
    temperatureMin: number,
    temperatureMax: number
  }
}
```

**Storage**:
- Stored in `AdminConfig` table as JSON
- Key: `'ai_globals'`
- Updated via `/api/admin/ai-config` endpoint

**History Tracking**:
- Every change saved to `AdminConfigHistory`
- Includes: timestamp, user ID, change reason, full config snapshot
- Accessible via `/api/admin/ai-config/history`

### ✅ 5. Master Prompt Template (Complete)

**Purpose**: Editable long-form instruction prompt for AI generation

**Features**:
- ✅ Large textarea in admin UI (15 rows, monospace font)
- ✅ Default: Chris Donnelly style LinkedIn post template
- ✅ Prepended to all generation requests
- ✅ Fully customizable by MASTER_ADMIN
- ✅ Saved to database with history tracking

**Default Template**:
```
Task: Create a LinkedIn post in the style of Chris Donnelly — 
direct, tactical, problem-led, story-first.

Steps:
1. Provide 3 headline/title options (hooks).
2. Write the full LinkedIn post draft with double spacing between sentences, 
   ending in a reflection or question.
3. Add hashtags at the foot of the post (6–8, mixing broad SME finance reach 
   and niche targeting).
4. Suggest 1 strong image concept that pairs with the post.
5. Suggest the best time to post that day (UK time).

Content rotation: Alternate between:
- A serious SME finance post (cashflow, staff, late payments, interest rates, 
  growth, resilience).
- A funny/quirky finance industry story (weird leases, unusual loans, absurd 
  expenses, strange finance deals).

Output format:
- Headline options
- LinkedIn post draft
- Hashtags
- Visual concept
- Best time to post today
```

**Integration**:
```typescript
import { buildSystemPrompt } from '@/lib/ai/generation-helpers'

const systemPrompt = buildSystemPrompt(config, bucket, additionalContext)
```

### ✅ 6. Daily Topic Rotation (Complete)

**Purpose**: Alternating content buckets to reduce repetition

**Features**:
- ✅ Timezone-aware rotation (default: Europe/London)
- ✅ Configurable buckets (default: `['serious_sme_finance', 'funny_finance_story']`)
- ✅ Date-based rotation algorithm
- ✅ Enable/disable toggle in admin UI
- ✅ Diversity window setting (1-30 days)

**Algorithm**:
1. Calculate day index based on timezone
2. Bucket index = day index % number of buckets
3. Return bucket for today

**Example** (2 buckets):
- Monday (day 0): serious_sme_finance
- Tuesday (day 1): funny_finance_story
- Wednesday (day 2): serious_sme_finance
- Thursday (day 3): funny_finance_story

**Integration**:
```typescript
import { getDailyBucket } from '@/lib/ai/generation-helpers'

const bucket = await getDailyBucket(config)
// Returns: 'serious_sme_finance' or 'funny_finance_story'
```

**Note**: Diversity checking (avoiding back-to-back repeats) is currently disabled as it requires a `metadata` field in `PostHistory`. Can be re-enabled after schema update.

### ✅ 7. Temperature Randomness (Complete)

**Purpose**: Variable temperature to increase variety in generation

**Features**:
- ✅ Random temperature per generation
- ✅ Configurable min/max range (default: 0.6-0.9)
- ✅ Enable/disable toggle in admin UI
- ✅ Validation: min <= max
- ✅ Clamped to valid range [0, 2]

**Algorithm**:
```typescript
if (randomness.enabled) {
  const { temperatureMin, temperatureMax } = config.randomness
  temperature = temperatureMin + Math.random() * (temperatureMax - temperatureMin)
} else {
  temperature = config.temperature
}
```

**Integration**:
```typescript
import { getRandomTemperature } from '@/lib/ai/generation-helpers'

const temperature = getRandomTemperature(config)
// Returns: random value between 0.6-0.9 (if enabled)

const response = await openai.chat.completions.create({
  model: config.textModel,
  temperature: temperature,
  messages: [...]
})
```

---

## Product Features (Current - Phase 1 & 2 Complete)

### ✅ 1. One-Time Profile Training
Users set up their business profile once:
- Business name and industry
- **Products/services** offered
- **USP (Unique Selling Point)** - differentiates from competitors
- **Target audience** (multi-select from 16 categories + custom)
- Company website (accepts all formats: domain.com, www.domain.com, https://domain.com)
- Tone preference (professional, casual, funny, bold)
- Keywords for content targeting (sector-specific suggestions)

**Storage**: Database (`Profile` table)

**Improvements Made**:
- Added USP field with comprehensive guidance
- Multi-select target audience with 16 pre-defined categories
- Flexible URL validation for all common formats
- Sector-specific keyword suggestions
- Descriptive help text for every field

### ✅ 2. Dashboard (Daily Content Generation)

**Content Generation Panel**:
- **Post Type Selector**: Auto (follows planner) or manual override
- **4 Post Types**:
  - **Selling**: Hook → Pain → Benefit → Proof → CTA
  - **Informational**: Hook → Context → 3 takeaways → Question
  - **Advice**: Hook → Checklist → Quick-win → Question
  - **News**: Global/local headlines relevant to business sector + commentary
- **AI-Generated Output**:
  - 3 headline options
  - Full LinkedIn post draft (strategic structure)
  - 6-8 optimized hashtags
  - Visual concept description (matches post content accurately)
  - Best posting time (UK timezone)
- **Copy-to-clipboard** functionality for all elements
- **Saved drafts**: Loads from database (with localStorage fallback)

**Storage**: Database (`PostHistory` table)

**Improvements Made**:
- No auto-generation on page load (saves API costs)
- Saved drafts persist by date
- Button shows "Generate" or "Regenerate" based on state
- USP integrated into all post types
- News posts focus on industry headlines, not customer news
- Visual prompts match post content (gender, profession, context)

### ✅ 3. Customise Today's Output Modal

**Features**:
- Override post type (Auto, Selling, Informational, Advice, News)
- Adjust tone (Professional, Casual, Funny, Bold)
- Add twist/context for today (e.g., "add an egg to the post")
- Optional extra keywords

**UX Improvements**:
- Button has press animation (scale + color change)
- Modal closes immediately when Apply is clicked
- Loading spinner shows on dashboard during generation
- Professional, responsive feel

### ✅ 4. Image Generation Panel

**Features**:
- 3 style options: Meme, Illustration, Photo-real
- AI-generated images based on visual concept
- High-resolution output (1024x1024)
- Download button for images
- Preview before download

**Improvements Made**:
- Visual concepts accurately match post content
- Specific gender, profession, and context details
- Emotional arc matching (before/after transformations)

### ✅ 5. 7-Day Content Mix Planner

**Strategic Content Rotation**:
- Plan each day of the week with specific post type
- Ensures balanced content mix
- Prevents repetitive posting
- Builds authority and engagement

**Post Type Distribution** (Recommended):
- Monday: Informational (start week with insights)
- Tuesday: Advice (provide value)
- Wednesday: Selling (mid-week CTA)
- Thursday: News (react to current events)
- Friday: Advice (end week with tips)
- Weekend: Optional (Selling or Informational)

**Features**:
- Visual calendar interface
- Color-coded post types
- Weekly summary
- Save and persist planner (database)
- "Back to Dashboard" button
- Auto-redirect after save

**Storage**: Database (`PlannerDay` table)

### ✅ 6. SEO & Domain Optimization

**Implemented**:
- Custom domain: socialecho.ai
- SSL certificates (verified)
- Enhanced metadata with Open Graph tags
- Twitter Card support
- robots.txt for search engines
- site.webmanifest for PWA support
- Proper canonical URLs

### ✅ 7. Feedback System

**Features**:
- Upvote/downvote on generated posts
- Optional note for feedback
- Tracks context (post type, tone, keywords, hashtags)
- Stored in database for learning engine

**Storage**: Database (`Feedback` table)

**Purpose**: Future learning algorithm will analyze feedback patterns to improve generation quality

---

## Product Features (Phase 2 - In Progress)

### 🚧 8. Payment Integration (Stripe) - NEXT PRIORITY

**Requirements**:
- Stripe Checkout integration
- Subscription plans:
  - Starter: £29.99/month (2 posts/week)
  - Pro: £49.99/month (unlimited posts)
  - Agency tiers: £199-£1,499+/month
- **Payment methods**: Card, Apple Pay, Google Pay
- **Billing portal**: Manage subscriptions, update payment methods
- **Invoices**: Auto-generated and emailed
- **Invoice history**: Downloadable PDFs
- Trial period (optional): 7-day free trial
- Proration for plan upgrades/downgrades
- Failed payment handling
- Cancellation flow

**Technology Stack**:
- **Stripe SDK**: @stripe/stripe-js
- **Webhooks**: Handle subscription events
- **Invoice Generation**: Stripe automatic invoicing

**Database Schema** (Already exists):
```prisma
model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  plan                 String   @default("starter")
  status               String   @default("active")
  usageCount           Int      @default(0)
  usageLimit           Int      @default(8)
  currentPeriodStart   DateTime @default(now())
  currentPeriodEnd     DateTime
  stripeCustomerId     String?
  stripeSubscriptionId String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

**Implementation Steps**:
1. Install Stripe SDK: `npm install @stripe/stripe-js stripe`
2. Set up Stripe account and get API keys
3. Create products and prices in Stripe Dashboard
4. Implement Stripe Checkout flow
5. Set up webhook endpoint: `/api/webhooks/stripe`
6. Handle subscription events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
7. Implement Stripe Customer Portal
8. Add subscription management UI
9. Enforce usage limits based on plan

**Estimated Time**: 2-3 days

### 🚧 9. Usage Limits & Subscription Enforcement

**Requirements**:
- Track posts generated per user per billing period
- Enforce limits based on subscription plan:
  - Starter: 8 posts/month (2 per week)
  - Pro: Unlimited
  - Agency: Unlimited per client
- Show usage statistics in dashboard
- Warn users when approaching limit
- Block generation when limit reached (with upgrade prompt)

**Database**: Already implemented in `Subscription` table
- `usageCount`: Posts generated this period
- `usageLimit`: Max posts allowed
- `currentPeriodStart`: Billing period start
- `currentPeriodEnd`: Billing period end

**Implementation Steps**:
1. Add usage tracking middleware to `/api/generate-text`
2. Check subscription status and limits before generation
3. Increment `usageCount` after successful generation
4. Reset `usageCount` at period end (cron job or webhook)
5. Add usage display to dashboard
6. Add upgrade prompts when limit reached

**Estimated Time**: 1 day

### 🚧 10. Learning from User Customizations

**Requirement**: Track what users change in the "Customise Today's Output" modal to understand their preferences and improve future generations.

**Implementation**:

1. **Track Customizations**:
   - Save every customization to database (new table or extend `PostHistory`)
   - Fields: original post type, custom post type, original tone, custom tone, twist, keywords
   - Associate with user and timestamp

2. **Analyze Patterns**:
   - Identify user's preferred post type (if they always override Auto)
   - Identify preferred tone (if they always change from Professional to Casual)
   - Extract common keywords from twists
   - Detect patterns in customization frequency

3. **Apply Learning**:
   - After 5+ customizations, analyze patterns
   - If user consistently changes post type: Update their planner defaults
   - If user consistently changes tone: Update their profile tone
   - If user adds similar keywords repeatedly: Add to their profile keywords
   - Show suggestion: "We noticed you prefer [X]. Would you like to update your defaults?"

4. **Smart Defaults**:
   - Pre-fill customization modal with learned preferences
   - Adjust AI prompts based on customization history
   - Personalize content generation over time

**Database Schema** (Needs to be added):
```prisma
model Customization {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  originalPostType  String
  customPostType    String?
  originalTone      String
  customTone        String?
  twist             String?
  keywords          String[]
  createdAt         DateTime @default(now())
  
  @@index([userId])
}
```

**Benefits**:
- Reduces need for manual customization
- Improves content relevance
- Increases user satisfaction
- Demonstrates AI learning capability

**Estimated Time**: 2-3 days

### 🚧 11. Account Management

**Features**:
- **Profile Settings**:
  - Update business information
  - Change tone and keywords
  - Update USP and target audience
- **Billing Settings**:
  - View current plan
  - Upgrade/downgrade plan
  - Update payment method
  - View billing history
  - Download invoices
- **Security Settings**:
  - Change password
  - Enable/disable 2FA
  - View active sessions
  - Logout from all devices
- **Usage Statistics**:
  - Posts generated this month
  - Images generated this month
  - API usage (for transparency)

**Status**: Partially implemented
- ✅ Security settings (password change, 2FA setup)
- 🚧 Profile settings (needs UI)
- 🚧 Billing settings (needs Stripe integration)
- 🚧 Usage statistics (needs implementation)

**Estimated Time**: 1-2 days (after Stripe integration)

### 🚧 12. Admin Dashboard Enhancements (for White Label)

**Features** (Agency plans only):
- **Client Management**:
  - Add/remove client accounts
  - View all client profiles
  - Generate content on behalf of clients
  - Bulk operations
- **Usage Monitoring**:
  - Track posts generated per client
  - Monitor API costs
  - View client activity
- **Branding**:
  - Upload agency logo
  - Set brand colors
  - Custom domain setup
- **Reporting**:
  - Export client content (CSV, PDF)
  - Usage reports for billing
  - Performance metrics

**Status**: Foundation complete (RBAC, admin routes)
- ✅ Admin authentication
- ✅ Role-based access control
- ✅ AI configuration editor
- 🚧 Client management (needs implementation)
- 🚧 Usage monitoring (needs implementation)
- 🚧 Branding customization (needs implementation)
- 🚧 Reporting (needs implementation)

**Estimated Time**: 5-7 days (Phase 3)

---

## Technical Architecture

### Current Stack (Phase 1 & 2)

**Frontend**:
- Next.js 14.2.15 (App Router)
- TypeScript 5.4.5
- Tailwind CSS 3.4.13
- Framer Motion 11.2.12 (animations)
- Lucide React 0.414.0 (icons)

**Backend**:
- Next.js API Routes (serverless)
- OpenAI GPT-4o-mini (text generation)
- DALL-E 3 (image generation)
- Zod 3.23.8 (validation)

**Authentication**:
- NextAuth.js v4.24.11
- bcryptjs 3.0.2 (password hashing)
- otplib 12.0.1 (2FA/TOTP)
- qrcode 1.5.4 (QR code generation)

**Database**:
- PostgreSQL (production)
- Prisma ORM 6.16.3
- Connection pooling enabled

**Email**:
- Resend 6.1.2 (transactional emails)

**Storage**:
- Database (primary)
- Browser localStorage (fallback/cache)

**Deployment**:
- Render (current)
- Custom domain: socialecho.ai
- SSL certificates enabled
- Environment variables configured

### Phase 2 Stack (To Add)

**Payments**:
- Stripe SDK (@stripe/stripe-js)
- Stripe Webhooks
- Stripe Customer Portal

**File Storage** (for images - future):
- AWS S3 or Cloudflare R2
- CDN for fast delivery

**Monitoring** (future):
- Sentry (error tracking)
- Vercel Analytics (if migrating)
- Stripe Dashboard (payments)

**Cron Jobs** (for subscription management):
- Render Cron Jobs or Vercel Cron
- Reset usage counts at period end
- Send usage warnings

---

## Database Schema (Current)

### Core Tables

**User**:
```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  password          String
  name              String?
  role              String   @default("USER") // USER | ADMIN | MASTER_ADMIN
  emailVerified     Boolean  @default(false)
  twoFactorSecret   String?
  twoFactorEnabled  Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  profile              Profile?
  subscription         Subscription?
  postHistory          PostHistory[]
  feedback             Feedback[]
  plannerDays          PlannerDay[]
  passwordResetTokens  PasswordResetToken[]
}
```

**Profile**:
```prisma
model Profile {
  id                String   @id @default(cuid())
  userId            String   @unique
  business_name     String
  website           String
  industry          String
  tone              String
  products_services String
  target_audience   String
  usp               String
  keywords          String[]
  rotation          String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**PostHistory**:
```prisma
model PostHistory {
  id              String   @id @default(cuid())
  userId          String
  date            String   // YYYY-MM-DD
  postType        String
  tone            String
  headlineOptions String[]
  postText        String   @db.Text
  hashtags        String[]
  visualPrompt    String   @db.Text
  isRegeneration  Boolean  @default(false)
  createdAt       DateTime @default(now())
  
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  feedback Feedback?
}
```

**Feedback**:
```prisma
model Feedback {
  id       String   @id @default(cuid())
  userId   String
  postId   String   @unique
  feedback String   // 'up' | 'down'
  note     String?  @db.Text
  postType String
  tone     String
  keywords String[]
  hashtags String[]
  createdAt DateTime @default(now())
  
  user User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  post PostHistory @relation(fields: [postId], references: [id], onDelete: Cascade)
}
```

### Subscription & Billing

**Subscription**:
```prisma
model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  plan                 String   @default("starter")
  status               String   @default("active")
  usageCount           Int      @default(0)
  usageLimit           Int      @default(8)
  currentPeriodStart   DateTime @default(now())
  currentPeriodEnd     DateTime
  stripeCustomerId     String?
  stripeSubscriptionId String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Admin & Configuration

**AdminConfig**:
```prisma
model AdminConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  json      Json
  updatedBy String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**AdminConfigHistory**:
```prisma
model AdminConfigHistory {
  id        String   @id @default(cuid())
  key       String
  json      Json
  updatedBy String
  reason    String?  @db.Text
  createdAt DateTime @default(now())
}
```

### Other Tables

**PlannerDay**: 7-day content planner  
**PasswordResetToken**: Password reset flow

---

## API Endpoints (Current)

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/2fa/setup` - Setup 2FA for user

### Content Generation
- `POST /api/generate-text` - Generate LinkedIn post
- `POST /api/generate-image` - Generate image from visual prompt

### User Data
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Create/update user profile
- `GET /api/posts` - Get post history
- `POST /api/posts` - Save generated post
- `GET /api/planner` - Get content planner
- `POST /api/planner` - Update content planner
- `POST /api/feedback` - Submit feedback on post

### Admin (MASTER_ADMIN only)
- `GET /api/admin/ai-config` - Get AI configuration
- `POST /api/admin/ai-config` - Update AI configuration
- `GET /api/admin/ai-config/history` - Get configuration history

---

## Implementation Status & Timeline

### ✅ Completed (October 2025)

**Week 1-2: Database & Authentication Foundation**
- ✅ Set up PostgreSQL database
- ✅ Create Prisma schema (all tables)
- ✅ Run initial migrations
- ✅ Set up NextAuth.js v4
- ✅ Implement email/password registration
- ✅ Add email verification flow
- ✅ Implement login flow
- ✅ Add session management (JWT)
- ✅ Create protected routes middleware
- ✅ Migrate localStorage to database
- ✅ Set up email service (Resend)
- ✅ Create email templates

**Week 3: 2FA & Password Management**
- ✅ Implement 2FA with otplib
- ✅ Generate QR codes for authenticator apps
- ✅ Create 2FA setup flow
- ✅ Add 2FA verification on login
- ✅ Implement password reset flow
- ✅ Create reset token generation
- ✅ Add password reset email template
- ✅ Add password strength requirements

**Week 4: Master Admin System**
- ✅ Implement RBAC (USER, ADMIN, MASTER_ADMIN)
- ✅ Create hidden admin URL (/admin73636)
- ✅ Add middleware protection for admin routes
- ✅ Create admin sign-in page
- ✅ Implement role-based post-login redirects
- ✅ Create admin dashboard
- ✅ Create AI configuration editor
- ✅ Implement configuration history tracking

**Week 5: Advanced AI Features**
- ✅ Implement Master Prompt Template
- ✅ Add Daily Topic Rotation
- ✅ Add Temperature Randomness
- ✅ Create generation helper functions
- ✅ Add admin UI for new features
- ✅ Fix build errors and deploy

### 🚧 In Progress (Next 2 Weeks)

**Week 6: Stripe Integration** (Estimated: 2-3 days)
- 🚧 Set up Stripe account
- 🚧 Create products and prices
- 🚧 Implement Stripe Checkout
- 🚧 Set up webhook endpoint
- 🚧 Handle subscription events
- 🚧 Implement Customer Portal
- 🚧 Add subscription management UI
- 🚧 Test payment flows

**Week 6-7: Usage Limits & Enforcement** (Estimated: 1 day)
- 🚧 Add usage tracking middleware
- 🚧 Check subscription limits before generation
- 🚧 Increment usage count after generation
- 🚧 Reset usage at period end
- 🚧 Add usage display to dashboard
- 🚧 Add upgrade prompts

**Week 7: Account Management** (Estimated: 1-2 days)
- 🚧 Build account settings page
- 🚧 Add profile update form
- 🚧 Add billing settings (after Stripe)
- 🚧 Add usage statistics display
- 🚧 Test account management

### 📅 Upcoming (Phase 3 - Next Month)

**Week 8-9: Learning from Customizations** (Estimated: 2-3 days)
- 📅 Add Customization table to schema
- 📅 Track customizations in database
- 📅 Create analysis algorithm
- 📅 Identify user patterns
- 📅 Generate suggestions
- 📅 Apply learning to defaults
- 📅 Test learning algorithm

**Week 10-12: White Label Features** (Estimated: 5-7 days)
- 📅 Client management portal
- 📅 Usage monitoring dashboard
- 📅 Branding customization
- 📅 Bulk operations
- 📅 Reporting and exports
- 📅 Agency admin dashboard

**Week 13+: Platform Expansion**
- 📅 Content scheduling integration
- 📅 Multi-platform support (Facebook, Twitter, Instagram)
- 📅 Advanced analytics
- 📅 A/B testing for headlines
- 📅 Mobile app (React Native)

---

## Pricing Strategy

### Individual Plans

#### Starter – £29.99/month
- 2 posts per week (8 posts/month)
- Text + image generation
- Content Mix Planner (4 post types)
- Copy & download workflows
- Email support
- **Ideal for**: Freelancers, solopreneurs

#### Pro – £49.99/month ⭐ MOST POPULAR
- **Unlimited posts**
- Text + image generation
- Full Content Mix Planner
- Customise output
- Priority support
- **Ideal for**: SMEs wanting daily visibility

### Enterprise White Label Plans

#### Agency Starter – £199/month
- Branded white-label instance (logo, colors)
- Up to **10 client accounts**
- Unlimited posts per client
- Admin dashboard
- Email support
- **Revenue potential**: £990/month (£99/client × 10) = **£791 margin**

#### Agency Growth – £399/month 🔥 POPULAR
- Everything in Starter
- Up to **25 client accounts**
- Custom domain (app.agencyname.com)
- Priority support
- Export-ready content (CSV, PDF)
- **Revenue potential**: £2,475/month (£99/client × 25) = **£2,076 margin (520% markup)**

#### Agency Scale – £799/month
- Everything in Growth
- Up to **50 client accounts**
- Advanced branding (custom login, client dashboards)
- Team seats (multiple logins)
- Dedicated support channel (Slack/WhatsApp)
- Quarterly strategy call
- White-label landing page template
- **Revenue potential**: £4,950/month (£99/client × 50) = **£4,151 margin**

#### Enterprise Unlimited – £1,499+/month
- Unlimited client accounts
- Full white-label SaaS deployment
- API access for integrations
- Custom onboarding + training
- SLA guarantees (uptime/support)
- Revenue-share or reseller license model
- **Custom pricing** based on volume

---

## Business Model & Unit Economics

### Cost Structure

**Fixed Costs** (Monthly):
- Hosting (Render): £20-50
- Database (PostgreSQL): £25
- Domain: £1 (£12/year)
- Email service (Resend): £10-20
- Monitoring: £10-20
- **Total Fixed**: ~£70-120/month

**Variable Costs** (Per User):
- OpenAI API:
  - GPT-4o-mini: ~£0.50 per 100 posts
  - DALL-E 3: ~£4 per 100 images
- Estimated per user: £2-5/month (Pro unlimited)
- Starter (8 posts/month): ~£0.50/month

### Unit Economics

**Pro Plan (£49.99/month)**:
- Revenue: £49.99
- Variable costs: ~£5
- Gross margin: ~£45 (90%)
- **Break-even**: 2 customers (covers fixed costs)

**Agency Growth (£399/month, 25 clients)**:
- Revenue: £399
- Variable costs: ~£125 (25 × £5)
- Gross margin: ~£274 (69%)
- **If agency resells at £99/client**:
  - Agency revenue: £2,475
  - Agency margin: £2,076

### Revenue Projections

**Conservative Scenario** (Year 1):
- 50 Pro customers: £2,500/month = £30,000/year
- 5 Agency Growth: £2,000/month = £24,000/year
- **Total ARR**: £54,000
- **Costs**: ~£15,000/year
- **Net profit**: ~£39,000 (72% margin)

**Growth Scenario** (Year 2):
- 200 Pro customers: £10,000/month = £120,000/year
- 20 Agency Growth: £8,000/month = £96,000/year
- **Total ARR**: £216,000
- **Costs**: ~£50,000/year
- **Net profit**: ~£166,000 (77% margin)

---

## Success Metrics (KPIs)

### User Acquisition
- **Signups per week**: Target 10-20 (Month 1)
- **Conversion rate**: 10% (signup → paid)
- **Cost per acquisition**: <£50

### User Engagement
- **Posts generated per user per week**: Target 3-5
- **Images generated per user per week**: Target 2-3
- **Customizations per user per week**: Target 1-2
- **Daily active users**: Target 30% of paid users

### Revenue
- **Monthly Recurring Revenue (MRR)**: Target £2,000 (Month 1)
- **Annual Recurring Revenue (ARR)**: Target £50,000 (Year 1)
- **Churn rate**: <5% per month
- **Lifetime Value (LTV)**: >£500

### Product
- **API response time**: <5 seconds (text), <15 seconds (images)
- **Uptime**: >99.5%
- **Error rate**: <1%
- **Customer satisfaction**: >4.5/5

---

## Risk Mitigation

### Technical Risks

**Risk**: OpenAI API outages  
**Mitigation**: 
- Implement retry logic with exponential backoff
- Add fallback to alternative models
- Cache common requests
- Communicate transparently with users

**Risk**: High API costs  
**Mitigation**:
- Implement usage limits per plan
- Monitor costs per user
- Optimize prompts for efficiency
- Add rate limiting

**Risk**: Database performance issues  
**Mitigation**:
- Use connection pooling (already implemented)
- Add database indexes (already implemented)
- Implement caching (Redis - future)
- Regular performance monitoring

### Business Risks

**Risk**: Low conversion rate  
**Mitigation**:
- Offer 7-day free trial
- Improve onboarding flow
- Add demo video
- Collect feedback and iterate

**Risk**: High churn rate  
**Mitigation**:
- Improve content quality
- Add more features
- Provide excellent support
- Implement learning algorithm to personalize

**Risk**: Competition  
**Mitigation**:
- Focus on SME niche
- Emphasize strategic content planning
- Build white-label offering
- Continuous innovation

---

## Marketing Strategy

### Launch Strategy

**Pre-Launch** (Week before):
- Build email waitlist
- Create launch landing page
- Prepare social media content
- Reach out to beta testers
- Set up analytics tracking

**Launch Day**:
- Announce on LinkedIn, Twitter, Product Hunt
- Email waitlist with special offer
- Publish blog post about the problem we solve
- Reach out to industry publications
- Run limited-time discount (20% off first month)

**Post-Launch** (First month):
- Daily LinkedIn posts showcasing features
- User testimonials and case studies
- Content marketing (blog posts, guides)
- SEO optimization
- Paid ads (LinkedIn, Google)

### Marketing Channels

**Organic**:
- LinkedIn content marketing (our own tool!)
- SEO-optimized blog posts
- YouTube tutorials
- Twitter/X engagement
- Reddit (r/entrepreneur, r/smallbusiness)

**Paid**:
- LinkedIn Ads (targeting SME owners, marketing managers)
- Google Ads (keywords: "LinkedIn content tool", "social media automation")
- Facebook Ads (targeting business owners)

**Partnerships**:
- Marketing agencies (white label)
- Business consultants (affiliate program)
- LinkedIn influencers (sponsorships)
- SaaS directories (Product Hunt, G2, Capterra)

---

## Competitive Analysis

### Direct Competitors

**Jasper AI**:
- Strengths: Established brand, many features
- Weaknesses: Expensive (£39+/month), complex, not SME-focused
- Our advantage: Simpler, cheaper, SME-specific, strategic planning

**Copy.ai**:
- Strengths: Good UI, multiple use cases
- Weaknesses: Generic, no strategic planning
- Our advantage: Strategic 7-day planner, LinkedIn-focused

**Lately.ai**:
- Strengths: Social media focus, analytics
- Weaknesses: Expensive (£79+/month), complex
- Our advantage: Simpler, cheaper, faster

### Indirect Competitors

**Marketing Agencies**:
- Strengths: Human touch, full service
- Weaknesses: Expensive (£2,000+/month), slow
- Our advantage: 95% cheaper, instant, 24/7

**Freelance Writers**:
- Strengths: Custom content, human creativity
- Weaknesses: Expensive, inconsistent, slow
- Our advantage: Consistent, fast, scalable

### Our Unique Position

**"The Strategic AI Content Tool for SMEs"**

- ✅ SME-focused (not enterprise)
- ✅ Strategic planning (7-day Content Mix Planner)
- ✅ Complete package (text + images)
- ✅ White-label ready (agency opportunity)
- ✅ Affordable (£29.99-£49.99 vs. £2,000+)
- ✅ Fast (10 minutes vs. hours/days)
- ✅ Learning AI (improves over time)
- ✅ **Master Admin controls** (centralized configuration)
- ✅ **Daily topic rotation** (reduces repetition)
- ✅ **Customizable prompts** (brand voice control)

---

## Deployment & Infrastructure

### Current Setup

**Hosting**: Render  
**Domain**: socialecho.ai (custom domain)  
**SSL**: Enabled  
**Database**: PostgreSQL (Render managed)  
**Email**: Resend  

**Environment Variables**:
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://socialecho.ai
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
```

**Build Command**: `npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`  
**Start Command**: `npm run start`

### Monitoring & Logging

**Current**:
- Render logs (application logs)
- Database connection monitoring
- Error tracking (console.error)

**Future** (Phase 3):
- Sentry (error tracking)
- Vercel Analytics (if migrating)
- Stripe Dashboard (payment monitoring)
- Custom analytics dashboard

---

## Next Steps (Immediate Priorities)

### Week 6: Stripe Integration (2-3 days)
1. Set up Stripe account
2. Create products and prices
3. Implement Stripe Checkout
4. Set up webhook endpoint
5. Handle subscription events
6. Implement Customer Portal
7. Add subscription management UI
8. Test payment flows

### Week 6-7: Usage Limits (1 day)
1. Add usage tracking middleware
2. Check subscription limits
3. Increment usage count
4. Reset usage at period end
5. Add usage display
6. Add upgrade prompts

### Week 7: Account Management (1-2 days)
1. Build account settings page
2. Add profile update form
3. Add billing settings
4. Add usage statistics
5. Test account management

### Week 8-9: Learning Algorithm (2-3 days)
1. Add Customization table
2. Track customizations
3. Create analysis algorithm
4. Generate suggestions
5. Apply learning
6. Test learning

---

## Long-term Vision

Social Echo will become the **go-to content marketing platform for SMEs worldwide**, expanding beyond LinkedIn to all major social platforms, offering advanced analytics, team collaboration, and becoming an indispensable tool for modern business growth.

**We're not just building a tool — we're building a movement to democratize professional content marketing for small businesses.**

---

## Conclusion

Social Echo has made significant progress in Phase 2, with a **complete authentication system, database integration, and advanced admin controls**. The foundation is solid, and we're ready to add payment integration and launch to paying customers.

### Why We'll Succeed

1. **Clear Problem**: SMEs need consistent content but can't afford agencies
2. **Strong Solution**: AI-powered, strategic, complete package
3. **Proven Demand**: 500,000+ UK SMEs actively using LinkedIn
4. **Excellent Economics**: 90% gross margins, low CAC
5. **Scalable Model**: Direct B2C + white-label B2B2C
6. **Technical Excellence**: Modern stack, fast, reliable, secure
7. **Continuous Improvement**: Learning algorithm personalizes over time
8. **Admin Controls**: Centralized AI configuration with full audit trail
9. **Advanced Features**: Master prompts, topic rotation, temperature randomness

### Current Status Summary

**✅ Complete**:
- Core content generation
- Database integration
- Authentication (email/password, 2FA)
- Master admin system (RBAC, hidden URL)
- AI configuration editor
- Master prompt template
- Daily topic rotation
- Temperature randomness

**🚧 In Progress**:
- Stripe payment integration
- Usage limits enforcement
- Account management UI

**📅 Upcoming**:
- Learning from customizations
- White label features
- Platform expansion

**Next Milestone**: Launch with payments (2 weeks)

---

**Let's build this! 🚀**

---

## Appendix: File Structure

```
social-echo/
├── app/
│   ├── admin/
│   │   ├── ai-config/
│   │   │   └── page.tsx          # AI configuration editor
│   │   ├── layout.tsx             # Admin layout
│   │   ├── page.tsx               # Admin dashboard
│   │   └── signin/
│   │       └── page.tsx           # Admin sign-in page
│   ├── api/
│   │   ├── admin/
│   │   │   └── ai-config/
│   │   │       ├── history/
│   │   │       │   └── route.ts   # Config history API
│   │   │       └── route.ts       # AI config API
│   │   ├── auth/
│   │   │   ├── 2fa/
│   │   │   │   └── setup/
│   │   │   │       └── route.ts   # 2FA setup API
│   │   │   ├── request-reset/
│   │   │   │   └── route.ts       # Password reset request
│   │   │   ├── reset-password/
│   │   │   │   └── route.ts       # Password reset
│   │   │   └── signup/
│   │   │       └── route.ts       # User registration
│   │   ├── feedback/
│   │   │   └── route.ts           # Feedback API
│   │   ├── generate-image/
│   │   │   └── route.ts           # Image generation
│   │   ├── generate-text/
│   │   │   └── route.ts           # Text generation
│   │   ├── planner/
│   │   │   └── route.ts           # Content planner API
│   │   ├── posts/
│   │   │   └── route.ts           # Post history API
│   │   └── profile/
│   │       └── route.ts           # Profile API
│   ├── dashboard/
│   │   └── page.tsx               # Main dashboard
│   ├── planner/
│   │   └── page.tsx               # Content planner
│   ├── signin/
│   │   └── page.tsx               # User sign-in
│   ├── signup/
│   │   └── page.tsx               # User registration
│   ├── train/
│   │   └── page.tsx               # Profile training
│   ├── welcome/
│   │   └── page.tsx               # Welcome page
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Landing page
├── components/
│   ├── ui/                        # Base UI components
│   ├── Copyable.tsx               # Copy-to-clipboard
│   ├── FeedbackButtons.tsx        # Upvote/downvote
│   ├── FineTunePanel.tsx          # Customization modal
│   ├── Header.tsx                 # Navigation header
│   ├── ImagePanel.tsx             # Image generation
│   ├── KeywordSuggestions.tsx     # Keyword helper
│   ├── LearningProgress.tsx       # Learning indicator
│   ├── Providers.tsx              # NextAuth provider
│   ├── TagsInput.tsx              # Tag input component
│   ├── TodayPanel.tsx             # Content generation
│   └── TrainForm.tsx              # Profile form
├── lib/
│   ├── ai/
│   │   ├── ai-config.ts           # AI config schema
│   │   ├── ai-service.ts          # AI service (get/set config)
│   │   └── generation-helpers.ts  # Rotation & randomness helpers
│   ├── auth.ts                    # NextAuth configuration
│   ├── contract.ts                # API validation schemas
│   ├── learning-engine.ts         # Learning algorithm (future)
│   ├── localstore.ts              # localStorage utilities
│   ├── openai.ts                  # OpenAI client
│   ├── prisma.ts                  # Prisma client
│   └── rbac.ts                    # Role-based access control
├── prisma/
│   ├── migrations/                # Database migrations
│   ├── schema.prisma              # Database schema
│   ├── seed-admin.ts              # Admin seed script
│   └── seed.ts                    # User seed script
├── middleware.ts                  # Route protection
├── next.config.js                 # Next.js config (rewrites)
├── tailwind.config.ts             # Tailwind config
├── package.json                   # Dependencies
├── .env                           # Environment variables
└── README.md                      # Project README
```

---

**Document Version**: 2.0  
**Last Updated**: October 4, 2025  
**Author**: Social Echo Team
