# Social Echo Agency Platform - Comprehensive Implementation Document

**Date:** October 5, 2025  
**Status:** Part 1 Complete, Part 2 In Progress  
**Version:** 2.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [What's Been Implemented](#whats-been-implemented)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Email System](#email-system)
7. [Billing Integration](#billing-integration)
8. [RBAC & Security](#rbac--security)
9. [Remaining Work](#remaining-work)
10. [Testing Plan](#testing-plan)
11. [Deployment Checklist](#deployment-checklist)

---

## Executive Summary

The Social Echo Agency Platform enables agencies to white-label the Social Echo service for their clients. The platform implements:

- **One unified agency plan**: "Agency—Grow as You Go" with quantity-based billing (£15/client/month)
- **Complete white-labeling**: Agency logo, colors, and subdomain support
- **Full client management**: Add, pause, resume, delete, impersonate clients
- **Branded communications**: All customer emails use agency branding
- **Quantity-based billing**: Stripe subscription quantity syncs with active client count
- **Role-based access control**: MASTER_ADMIN → AGENCY_ADMIN → AGENCY_STAFF → CUSTOMER
- **Audit logging**: All agency actions are tracked

### Current Status

**✅ Completed:**
- Database schema with Agency model and relationships
- 10+ API endpoints for agency operations
- RBAC system with role hierarchy
- Email branding system
- Stripe quantity-based billing helpers
- Agency dashboard UI
- Audit logging system

**🚧 In Progress:**
- Branded login system
- Impersonation UI
- Pricing page updates
- Agency onboarding flow

**📋 To Do:**
- Complete branded login
- Stripe webhook updates
- UI copy updates
- Testing and deployment

---

## What's Been Implemented

### 1. Database Schema

**New Models:**

```prisma
model Agency {
  id                    String   @id @default(cuid())
  name                  String
  slug                  String   @unique
  logoUrl               String?
  primaryColor          String?  @default("#3B82F6")
  subdomain             String?  @unique
  customDomain          String?  @unique
  activeClientCount     Int      @default(0)
  stripeCustomerId      String?  @unique
  stripeSubscriptionId  String?  @unique
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  customers             User[]   @relation("AgencyCustomers")
  admins                User[]   @relation("AgencyAdmins")
}
```

**Updated User Model:**
- Added `role` enum: `MASTER_ADMIN`, `AGENCY_ADMIN`, `AGENCY_STAFF`, `CUSTOMER`, `USER`, `ADMIN`
- Added `agencyId` foreign key
- Added `agencyOwnedId` for agency owners

**Updated AuditLog Model:**
- Supports agency-specific actions
- Tracks impersonation events

### 2. API Endpoints

All endpoints are located in `/app/api/agency/`:

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/agency` | GET | Get agency data and client list | AGENCY_STAFF+ |
| `/api/agency/clients` | POST | Add new client | AGENCY_ADMIN |
| `/api/agency/clients/[id]` | DELETE | Delete client (hard delete) | AGENCY_ADMIN |
| `/api/agency/clients/[id]/pause` | POST | Pause client (remove from billing) | AGENCY_ADMIN |
| `/api/agency/clients/[id]/resume` | POST | Resume client (add to billing) | AGENCY_ADMIN |
| `/api/agency/clients/[id]/reset-password` | POST | Send password reset email | AGENCY_ADMIN |
| `/api/agency/clients/[id]/reset-2fa` | POST | Clear 2FA configuration | AGENCY_ADMIN |
| `/api/agency/clients/[id]/impersonate` | POST | Start 15-min impersonation session | AGENCY_ADMIN |
| `/api/agency/portal` | POST | Create Stripe billing portal session | AGENCY_ADMIN |
| `/api/agency/branding` | PATCH | Update logo, color, subdomain | AGENCY_ADMIN |

### 3. Helper Functions

**File:** `/lib/agency-helpers.ts`

Key functions:
- `isAgencyAdmin(role)` - Check if user is agency admin
- `isAgencyStaff(role)` - Check if user is agency staff or higher
- `getAgencyForUser(userId)` - Get user's agency with full data
- `updateStripeQuantity(subscriptionId, quantity)` - Update Stripe subscription quantity
- `createAuditLog(data)` - Create audit log entry
- `validateSubdomain(subdomain)` - Validate subdomain format
- `isSubdomainAvailable(subdomain, agencyId)` - Check subdomain availability
- `getAgencyUnitPrice()` - Get per-client price (£15)

### 4. Email Branding System

**Files:**
- `/lib/email/service.ts` - Updated to support agency branding
- `/lib/email/branding.ts` - Branding helper functions
- `/lib/email/templates.ts` - Email templates

**How It Works:**

1. When sending email to agency customer, pass `agencyBranding` object:
```typescript
await sendEmail({
  to: client.email,
  subject: emailTemplate.subject,
  html: emailTemplate.html,
  text: emailTemplate.text,
  agencyBranding: {
    name: agency.name,
    logoUrl: agency.logoUrl,
    primaryColor: agency.primaryColor
  }
})
```

2. Email service automatically:
   - Sets From name to "Agency Name via Social Echo"
   - Applies agency logo to email header
   - Replaces default colors with agency colors
   - Adds agency attribution to footer

**New Email Templates:**
- `agencyClientAddedEmail()` - Notify admin when client added
- `agencyClientPausedEmail()` - Notify admin when client paused
- `agencyClientDeletedEmail()` - Notify admin when client deleted
- `agencyClientResumedEmail()` - Notify admin when client resumed

### 5. Agency Dashboard UI

**File:** `/app/agency/page.tsx`

Features:
- Agency branding preview (logo, color)
- Active client count and monthly billing total
- Client list with status indicators
- Client actions: View, Train, Reset Password, Reset 2FA, Pause/Resume, Delete
- Impersonate button (starts 15-min session)
- Manage Billing button (opens Stripe portal)
- Branding settings section

### 6. RBAC System

**File:** `/lib/rbac.ts`

**Role Hierarchy:**
```
CUSTOMER (0)        - Agency client (lowest privilege)
USER (1)            - Regular individual user
AGENCY_STAFF (2)    - Agency team member (read-only)
AGENCY_ADMIN (3)    - Agency owner (full agency control)
ADMIN (4)           - Legacy admin role
MASTER_ADMIN (5)    - Full system access (highest privilege)
```

**Permission Rules:**
- CUSTOMER: Can only access their own account
- AGENCY_STAFF: Can view agency data, cannot modify
- AGENCY_ADMIN: Full control over their agency and clients
- MASTER_ADMIN: Can access all agencies and impersonate anyone

---

## Architecture Overview

### File Structure

```
social-echo/
├── app/
│   ├── agency/
│   │   └── page.tsx                    # Agency dashboard
│   └── api/
│       └── agency/
│           ├── route.ts                # GET agency data
│           ├── branding/
│           │   └── route.ts            # PATCH branding
│           ├── clients/
│           │   ├── route.ts            # POST add client
│           │   └── [id]/
│           │       ├── route.ts        # DELETE client
│           │       ├── pause/route.ts
│           │       ├── resume/route.ts
│           │       ├── reset-password/route.ts
│           │       ├── reset-2fa/route.ts
│           │       └── impersonate/route.ts
│           └── portal/
│               └── route.ts            # POST Stripe portal
├── lib/
│   ├── agency-helpers.ts               # Agency utility functions
│   ├── agency-branding-context.ts      # Subdomain/brand detection
│   ├── rbac.ts                         # Role-based access control
│   └── email/
│       ├── service.ts                  # Email sending (with branding)
│       ├── branding.ts                 # Branding helpers
│       └── templates.ts                # Email templates
└── prisma/
    └── schema.prisma                   # Database schema
```

### Data Flow

#### Adding a Client

```
1. Agency admin clicks "Add Client" on dashboard
2. POST /api/agency/clients { email, name }
3. Verify AGENCY_ADMIN role
4. Create User with role=CUSTOMER, agencyId=agency.id
5. Generate temporary password
6. Increment agency.activeClientCount
7. Update Stripe subscription quantity
8. Send branded welcome email to client
9. Send confirmation email to agency admin
10. Create audit log entry
11. Return success with new client count and monthly total
```

#### Pausing a Client

```
1. Agency admin clicks "Pause" on client
2. POST /api/agency/clients/[id]/pause
3. Verify AGENCY_ADMIN role and client belongs to agency
4. Set user.isSuspended = true
5. Decrement agency.activeClientCount
6. Update Stripe subscription quantity (prorates automatically)
7. Send confirmation email to agency admin
8. Create audit log entry
9. Return new billing total
```

#### Billing Quantity Sync

```
Active Client Count ←→ Stripe Subscription Quantity

When client count changes:
1. Update agency.activeClientCount in database
2. Call stripe.subscriptions.update() with new quantity
3. Stripe automatically prorates the change
4. Next invoice reflects new quantity × unit price
```

---

## Database Schema

### Agency Table

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier (cuid) |
| name | String | Agency display name |
| slug | String | URL-safe identifier (unique) |
| logoUrl | String? | Logo URL for branding |
| primaryColor | String? | Hex color code (default: #3B82F6) |
| subdomain | String? | Subdomain for white-label login |
| customDomain | String? | Custom domain (future) |
| activeClientCount | Int | Number of active (non-paused) clients |
| stripeCustomerId | String? | Stripe customer ID |
| stripeSubscriptionId | String? | Stripe subscription ID |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relationships:**
- `customers` - One-to-many with User (agency clients)
- `admins` - One-to-many with User (agency admins/staff)

### User Table Updates

**New Fields:**
- `role` - UserRole enum (MASTER_ADMIN, AGENCY_ADMIN, AGENCY_STAFF, CUSTOMER, USER, ADMIN)
- `agencyId` - Foreign key to Agency (for customers)
- `agencyOwnedId` - Foreign key to Agency (for agency owners)

**Role Assignment:**
- Individual users: `role = USER`
- Agency owners: `role = AGENCY_ADMIN`, `agencyOwnedId = agency.id`
- Agency staff: `role = AGENCY_STAFF`, `agencyOwnedId = agency.id`
- Agency clients: `role = CUSTOMER`, `agencyId = agency.id`

### AuditLog Table

**New Action Types:**
- `CLIENT_ADDED`
- `CLIENT_PAUSED`
- `CLIENT_RESUMED`
- `CLIENT_DELETED`
- `CLIENT_PASSWORD_RESET`
- `CLIENT_2FA_RESET`
- `IMPERSONATE_START`
- `IMPERSONATE_END`
- `BRANDING_UPDATED`
- `BILLING_PORTAL_OPENED`

---

## API Endpoints

### GET /api/agency

**Auth:** AGENCY_STAFF or higher  
**Returns:** Agency data with client list

**Response:**
```json
{
  "id": "agency_123",
  "name": "Acme Agency",
  "slug": "acme-agency",
  "logoUrl": "https://example.com/logo.png",
  "primaryColor": "#FF5733",
  "subdomain": "acme",
  "customDomain": null,
  "activeClientCount": 5,
  "stripeCustomerId": "cus_123",
  "stripeSubscriptionId": "sub_123",
  "clients": [
    {
      "id": "user_123",
      "email": "client@example.com",
      "name": "John Doe",
      "status": "active",
      "lastLogin": "2025-10-05T10:00:00Z",
      "createdAt": "2025-10-01T10:00:00Z"
    }
  ]
}
```

### POST /api/agency/clients

**Auth:** AGENCY_ADMIN  
**Body:**
```json
{
  "email": "newclient@example.com",
  "name": "Jane Smith"
}
```

**Response:**
```json
{
  "clientId": "user_456",
  "newClientCount": 6,
  "newMonthlyTotal": 90.00,
  "message": "Client added successfully"
}
```

**Side Effects:**
1. Creates User with role=CUSTOMER
2. Generates temporary password
3. Increments activeClientCount
4. Updates Stripe subscription quantity
5. Sends branded welcome email to client
6. Sends confirmation email to agency admin
7. Creates audit log

### POST /api/agency/clients/[id]/pause

**Auth:** AGENCY_ADMIN  
**Response:**
```json
{
  "status": "paused",
  "newQuantity": 5,
  "message": "Client paused successfully"
}
```

**Side Effects:**
1. Sets user.isSuspended = true
2. Decrements activeClientCount
3. Updates Stripe subscription quantity (prorates)
4. Sends confirmation email to agency admin
5. Creates audit log

### POST /api/agency/clients/[id]/resume

**Auth:** AGENCY_ADMIN  
**Response:**
```json
{
  "status": "active",
  "newQuantity": 6,
  "message": "Client resumed successfully"
}
```

**Side Effects:**
1. Sets user.isSuspended = false
2. Increments activeClientCount
3. Updates Stripe subscription quantity (prorates)
4. Sends confirmation email to agency admin
5. Creates audit log

### DELETE /api/agency/clients/[id]

**Auth:** AGENCY_ADMIN  
**Response:**
```json
{
  "ok": true,
  "message": "Client deleted successfully"
}
```

**Side Effects:**
1. Hard deletes User (cascade deletes posts, history, etc.)
2. Decrements activeClientCount (if client was active)
3. Updates Stripe subscription quantity
4. Sends confirmation email to agency admin
5. Creates audit log

### POST /api/agency/clients/[id]/reset-password

**Auth:** AGENCY_ADMIN  
**Response:**
```json
{
  "ok": true,
  "message": "Password reset email sent."
}
```

**Side Effects:**
1. Generates password reset token (1-hour expiry)
2. Sends branded password reset email to client
3. Creates audit log

### POST /api/agency/clients/[id]/reset-2fa

**Auth:** AGENCY_ADMIN  
**Response:**
```json
{
  "ok": true,
  "message": "2FA reset. The user must set it up again."
}
```

**Side Effects:**
1. Sets twoFactorEnabled = false, twoFactorSecret = null
2. Sends branded 2FA reset notification to client
3. Creates audit log

### POST /api/agency/clients/[id]/impersonate

**Auth:** AGENCY_ADMIN or MASTER_ADMIN  
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-05T10:15:00Z",
  "message": "Impersonation session started"
}
```

**Side Effects:**
1. Generates JWT token with 15-minute expiry
2. Creates audit log (no email sent)

**Token Payload:**
```json
{
  "impersonatorId": "admin_123",
  "targetUserId": "client_456",
  "expiresAt": "2025-10-05T10:15:00Z"
}
```

### POST /api/agency/portal

**Auth:** AGENCY_ADMIN  
**Response:**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

**Side Effects:**
1. Creates Stripe billing portal session
2. Creates audit log

### PATCH /api/agency/branding

**Auth:** AGENCY_ADMIN  
**Body:**
```json
{
  "logoUrl": "https://example.com/new-logo.png",
  "color": "#FF5733",
  "subdomain": "acme"
}
```

**Response:**
```json
{
  "branding": {
    "logoUrl": "https://example.com/new-logo.png",
    "color": "#FF5733",
    "subdomain": "acme",
    "customDomain": null
  },
  "message": "Branding updated successfully"
}
```

**Validation:**
- logoUrl: Must be valid HTTP(S) URL
- color: Must be valid hex color (#RRGGBB)
- subdomain: 3-63 chars, lowercase, alphanumeric + hyphens, must be available

**Side Effects:**
1. Updates agency branding fields
2. Creates audit log

---

## Email System

### Email Behavior Summary

#### 1. Stripe Billing Emails
- **Recipient:** Only the agency owner (Stripe customer)
- **Content:** Invoices, receipts, payment notices
- **Sender:** Stripe (Social Echo's Stripe account branding)
- **Frequency:** Monthly billing cycle, payment events

**✅ Confirmed:** Agency clients NEVER receive Stripe emails.

#### 2. App-Level Transactional Emails
- **Recipients:** Agency customers (clients)
- **Content:** Welcome, password reset, 2FA reset
- **Sender:** "Agency Name via Social Echo <noreply@socialecho.ai>"
- **Branding:** Agency logo, colors applied automatically

**Example:**
```
From: Acme Agency via Social Echo <noreply@socialecho.ai>
To: client@example.com
Subject: Welcome to Your New Social Media Guru! 🎉

[Acme Agency Logo]
[Email content with Acme's primary color]
```

#### 3. Agency Admin Notifications
- **Recipient:** Agency admin only
- **Content:** Client added/paused/deleted/resumed confirmations
- **Sender:** "Social Echo <noreply@socialecho.ai>"
- **Includes:** Updated client count, new monthly total, billing clarity message

**Example:**
```
From: Social Echo <noreply@socialecho.ai>
To: admin@acmeagency.com
Subject: New Client Added: client@example.com

✅ Client Added

Client Email: client@example.com
Total Active Clients: 6
Next Monthly Bill: £90.00

Note: Social Echo bills your agency directly. Your clients are 
billed by you. No Stripe invoices are sent to your clients.
```

#### 4. Impersonation and Security
- **No emails sent** for impersonation events
- **Audit log only** - tracks who, when, and for how long
- Password/2FA resets email the customer directly with agency branding

### Email Templates

**Customer-Facing (With Agency Branding):**
- `welcomeEmail()` - Account creation with temp password
- `passwordResetEmail()` - Password reset link
- `twoFactorResetEmail()` - 2FA cleared notification

**Agency Admin Only:**
- `agencyClientAddedEmail()` - Client added confirmation
- `agencyClientPausedEmail()` - Client paused confirmation
- `agencyClientDeletedEmail()` - Client deleted confirmation
- `agencyClientResumedEmail()` - Client resumed confirmation

### Branding Application

**Automatic Transformations:**
1. **From Name:** "Agency Name via Social Echo"
2. **Logo:** Inserted in email header (max 200×80px)
3. **Colors:** Replace #667eea and #764ba2 with agency color
4. **Footer:** "Provided by Agency Name via Social Echo"

**Code Example:**
```typescript
// In agency API endpoint
const emailTemplate = welcomeEmail(clientName, clientEmail, tempPassword)
await sendEmail({
  to: clientEmail,
  subject: emailTemplate.subject,
  html: emailTemplate.html,
  text: emailTemplate.text,
  agencyBranding: {
    name: agency.name,
    logoUrl: agency.logoUrl,
    primaryColor: agency.primaryColor
  }
})
```

---

## Billing Integration

### Stripe Subscription Model

**Plan Structure:**
- **Product:** "Agency—Grow as You Go"
- **Price:** £15 per client per month
- **Billing:** Quantity-based (quantity = active client count)
- **Proration:** Automatic when quantity changes

### How Quantity Sync Works

**Initial Setup:**
1. Agency signs up and completes Stripe checkout
2. Stripe creates customer and subscription with quantity=0
3. Webhook stores `stripeCustomerId` and `stripeSubscriptionId` in Agency table

**Adding a Client:**
```typescript
// 1. Create client user
const client = await prisma.user.create({ ... })

// 2. Update agency client count
const newCount = agency.activeClientCount + 1
await prisma.agency.update({
  where: { id: agency.id },
  data: { activeClientCount: newCount }
})

// 3. Update Stripe subscription
await stripe.subscriptions.update(agency.stripeSubscriptionId, {
  items: [{
    id: subscriptionItemId,
    quantity: newCount
  }],
  proration_behavior: 'always_invoice'
})
```

**Stripe Response:**
- Immediately prorates the change
- Creates invoice item for partial period
- Updates next invoice to reflect new quantity

**Pausing a Client:**
- Same process, but decrements quantity
- Stripe credits the prorated amount

### Proration Example

**Scenario:**
- Agency has 5 clients (£75/month)
- On day 15 of billing cycle, adds 1 client
- Billing period: 30 days

**Calculation:**
- Remaining days: 15
- Prorated charge: (£15 × 15) / 30 = £7.50
- Immediate charge: £7.50
- Next month: £90 (6 clients × £15)

### Webhook Events

**Required Webhooks:**
- `checkout.session.completed` - Initial subscription creation
- `customer.subscription.updated` - Quantity changes
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

**Current Implementation:**
- Basic webhook handler exists at `/api/webhooks/stripe`
- **Needs update** to handle agency-specific events

---

## RBAC & Security

### Role Hierarchy

```
Level 5: MASTER_ADMIN
         └─ Full system access
         └─ Can impersonate anyone
         └─ Can manage all agencies

Level 4: ADMIN (legacy)
         └─ System administration
         └─ Not agency-specific

Level 3: AGENCY_ADMIN
         └─ Full control over their agency
         └─ Can add/pause/delete clients
         └─ Can impersonate their clients
         └─ Can update branding
         └─ Can access billing portal

Level 2: AGENCY_STAFF
         └─ Read-only access to agency data
         └─ Can view client list
         └─ Cannot modify anything

Level 1: USER
         └─ Regular individual user
         └─ Not part of an agency

Level 0: CUSTOMER
         └─ Agency client
         └─ Limited to their own account
         └─ Cannot see agency dashboard
```

### Permission Checks

**Helper Functions:**
```typescript
// Check if user is agency admin
isAgencyAdmin(role: UserRole): boolean

// Check if user is agency staff or higher
isAgencyStaff(role: UserRole): boolean

// Check if user has required role or higher
hasRole(userRole: UserRole, requiredRole: UserRole): boolean
```

**Usage in API Routes:**
```typescript
// Require agency admin
if (!isAgencyAdmin(user.role)) {
  return NextResponse.json(
    { error: 'Access denied. Agency admin role required.' },
    { status: 403 }
  )
}

// Verify client belongs to agency
const client = await prisma.user.findFirst({
  where: {
    id: clientId,
    agencyId: agency.id,
    role: 'CUSTOMER'
  }
})

if (!client) {
  return NextResponse.json(
    { error: 'Client not found or does not belong to your agency' },
    { status: 404 }
  )
}
```

### Audit Logging

**All agency actions are logged:**
- Who performed the action (actorId)
- What action was performed (action)
- Who was affected (targetId)
- When it happened (timestamp)
- Additional context (meta)

**Example Audit Log Entry:**
```json
{
  "id": "log_123",
  "actorId": "admin_456",
  "action": "CLIENT_ADDED",
  "targetId": "client_789",
  "timestamp": "2025-10-05T10:00:00Z",
  "meta": {
    "agencyId": "agency_123",
    "clientEmail": "newclient@example.com",
    "newClientCount": 6
  }
}
```

### Impersonation Security

**Constraints:**
- 15-minute time limit (hard-coded)
- JWT token-based (signed with JWT_SECRET)
- Audit logged (start and end)
- No email notifications (security)
- AGENCY_ADMIN can only impersonate their own clients
- MASTER_ADMIN can impersonate anyone

**Token Structure:**
```typescript
{
  impersonatorId: string,  // Who is impersonating
  targetUserId: string,    // Who is being impersonated
  expiresAt: string        // ISO timestamp
}
```

---

## Remaining Work

### Phase 2: Branded Login (In Progress)

**Status:** Infrastructure started, UI incomplete

**What's Done:**
- Agency branding context detection (`/lib/agency-branding-context.ts`)
- Subdomain and query parameter extraction
- Agency branding retrieval functions

**What's Needed:**

1. **Update Login Page** (`/app/signin/page.tsx`)
   - Detect agency branding from URL
   - Display agency logo if present
   - Apply agency colors to login form
   - Show "Powered by Social Echo" footer

2. **Create Branded Login Component**
   ```tsx
   // /components/BrandedLogin.tsx
   interface Props {
     branding: AgencyBrandingContext | null
   }
   
   export function BrandedLogin({ branding }: Props) {
     return (
       <div className={branding ? "agency-branded" : ""}>
         {branding?.logoUrl && (
           <img src={branding.logoUrl} alt={branding.name} />
         )}
         {/* Login form */}
         {branding && (
           <p className="text-sm text-gray-500">
             Powered by Social Echo
           </p>
         )}
       </div>
     )
   }
   ```

3. **Update Middleware** (`/middleware.ts`)
   - Extract agency identifier from request
   - Store in cookie or session for persistence
   - Redirect to branded URL if needed

4. **Session Enhancement**
   - Store agency branding in session
   - Make available to all pages
   - Use for consistent branding throughout app

**Estimated Time:** 4-6 hours

### Phase 3: Impersonation UI

**What's Needed:**

1. **Impersonation Banner Component**
   ```tsx
   // /components/ImpersonationBanner.tsx
   export function ImpersonationBanner() {
     return (
       <div className="bg-yellow-500 text-black p-3 text-center">
         <strong>⚠️ Impersonation Mode</strong>
         <span className="mx-2">|</span>
         <span>Viewing as: {targetUserName}</span>
         <span className="mx-2">|</span>
         <span>Expires in: {timeRemaining}</span>
         <button onClick={exitImpersonation}>Exit</button>
       </div>
     )
   }
   ```

2. **Impersonation Session Handling**
   - Store JWT token in session/cookie
   - Verify token on each request
   - Auto-logout when expired
   - Create audit log on exit

3. **Exit Impersonation Endpoint**
   ```typescript
   // POST /api/agency/clients/[id]/exit-impersonation
   // Clear impersonation session
   // Log audit event
   // Redirect to agency dashboard
   ```

4. **Update Layout** (`/app/layout.tsx`)
   - Check for impersonation session
   - Show banner if impersonating
   - Hide for non-impersonation sessions

**Estimated Time:** 3-4 hours

### Phase 4: Pricing Page Updates

**What's Needed:**

1. **Remove Old Agency Tiers**
   - Delete "Agency Starter" (£99/month, 10 clients)
   - Delete "Agency Growth" (£249/month, 30 clients)
   - Delete "Agency Scale" (£499/month, 100 clients)

2. **Add New Agency Plan**
   ```tsx
   <PricingCard
     name="Agency—Grow as You Go"
     price="£15"
     period="per client/month"
     description="Perfect for agencies managing multiple clients"
     features={[
       "Unlimited posts per client",
       "White-label branding (logo & colors)",
       "Custom subdomain",
       "Client management dashboard",
       "Impersonation for support",
       "Quantity-based billing",
       "Add or pause clients anytime",
       "Only pay for active clients"
     ]}
     cta="Start Your Agency"
     ctaLink="/signup?plan=agency"
   />
   ```

3. **Update Pricing Copy**
   - Emphasize flexibility and scalability
   - Show example pricing (5 clients = £75/month)
   - Clarify proration and billing

**Estimated Time:** 2-3 hours

### Phase 5: Agency Onboarding Flow

**What's Needed:**

1. **Post-Payment Redirect**
   - After Stripe checkout, redirect to `/agency/onboarding`
   - Check if agency record exists, create if not

2. **Onboarding Wizard** (`/app/agency/onboarding/page.tsx`)
   ```tsx
   // Step 1: Welcome
   // Step 2: Agency Details (name, slug)
   // Step 3: Branding (logo, color)
   // Step 4: Subdomain (optional)
   // Step 5: Add First Client
   // Step 6: Complete
   ```

3. **API Endpoint**
   ```typescript
   // POST /api/agency/onboarding
   // Create agency record
   // Link to user
   // Set role to AGENCY_ADMIN
   // Return agency ID
   ```

4. **Skip Option**
   - Allow skipping branding setup
   - Can configure later from dashboard

**Estimated Time:** 4-5 hours

### Phase 6: Stripe Webhook Updates

**What's Needed:**

1. **Update Webhook Handler** (`/app/api/webhooks/stripe/route.ts`)

2. **Handle Agency Subscription Events**
   ```typescript
   case 'checkout.session.completed':
     // If metadata.type === 'agency'
     // Create Agency record
     // Set stripeCustomerId and stripeSubscriptionId
     // Set activeClientCount = 0
     // Send welcome email to agency owner
     break
   
   case 'customer.subscription.updated':
     // If subscription belongs to agency
     // Log quantity change
     // Send notification to agency admin if quantity mismatch
     break
   
   case 'customer.subscription.deleted':
     // If subscription belongs to agency
     // Mark agency as inactive
     // Suspend all clients
     // Send cancellation email
     break
   
   case 'invoice.payment_succeeded':
     // If invoice belongs to agency
     // Send payment confirmation to agency owner
     // Include client count and amount
     break
   
   case 'invoice.payment_failed':
     // If invoice belongs to agency
     // Send payment failed email to agency owner
     // Warn about suspension
     break
   ```

3. **Add Metadata to Checkout**
   ```typescript
   // In /api/checkout
   const session = await stripe.checkout.sessions.create({
     // ... existing config
     metadata: {
       type: 'agency',
       userId: user.id
     }
   })
   ```

**Estimated Time:** 3-4 hours

### Phase 7: UI Copy Updates

**Files to Update:**

1. `/app/pricing/page.tsx` - Already updated (see Phase 4)
2. `/app/dashboard/page.tsx` - Add agency context if user is CUSTOMER
3. `/app/agency/page.tsx` - Add billing clarity message
4. `/components/Header.tsx` - Show agency branding for CUSTOMER users
5. `/app/train/page.tsx` - Show agency branding for CUSTOMER users

**Key Messages:**
- "Powered by [Agency Name]"
- "Your account is managed by [Agency Name]"
- "Social Echo bills your agency directly. Your clients are billed by you."

**Estimated Time:** 2-3 hours

### Phase 8: Testing

See [Testing Plan](#testing-plan) below.

**Estimated Time:** 4-6 hours

---

## Testing Plan

### Pre-Deployment Testing

#### 1. Agency Creation & Onboarding

**Test Case 1.1: Agency Signup**
- [ ] Go to `/pricing`
- [ ] Click "Start Your Agency" on Agency plan
- [ ] Complete signup form
- [ ] Complete Stripe checkout with test card (4242 4242 4242 4242)
- [ ] Verify redirect to `/agency/onboarding`
- [ ] Complete onboarding wizard
- [ ] Verify agency record created in database
- [ ] Verify user role set to AGENCY_ADMIN
- [ ] Verify welcome email received

**Test Case 1.2: Branding Setup**
- [ ] Upload agency logo
- [ ] Set primary color
- [ ] Set subdomain
- [ ] Save branding
- [ ] Verify branding stored in database
- [ ] Verify subdomain is unique and valid

#### 2. Client Management

**Test Case 2.1: Add Client**
- [ ] Go to `/agency`
- [ ] Click "Add Client"
- [ ] Enter client email and name
- [ ] Submit form
- [ ] Verify client created with role=CUSTOMER
- [ ] Verify activeClientCount incremented
- [ ] Verify Stripe subscription quantity updated
- [ ] Verify welcome email sent to client with agency branding
- [ ] Verify confirmation email sent to agency admin
- [ ] Verify audit log created

**Test Case 2.2: Pause Client**
- [ ] Click "Pause" on active client
- [ ] Confirm action
- [ ] Verify client.isSuspended = true
- [ ] Verify activeClientCount decremented
- [ ] Verify Stripe subscription quantity updated
- [ ] Verify confirmation email sent to agency admin
- [ ] Verify client cannot log in
- [ ] Verify audit log created

**Test Case 2.3: Resume Client**
- [ ] Click "Resume" on paused client
- [ ] Confirm action
- [ ] Verify client.isSuspended = false
- [ ] Verify activeClientCount incremented
- [ ] Verify Stripe subscription quantity updated
- [ ] Verify confirmation email sent to agency admin
- [ ] Verify client can log in
- [ ] Verify audit log created

**Test Case 2.4: Delete Client**
- [ ] Click "Delete" on client
- [ ] Confirm action (warning shown)
- [ ] Verify client deleted from database
- [ ] Verify activeClientCount decremented (if was active)
- [ ] Verify Stripe subscription quantity updated
- [ ] Verify confirmation email sent to agency admin
- [ ] Verify audit log created

**Test Case 2.5: Reset Password**
- [ ] Click "Reset Password" on client
- [ ] Verify password reset email sent to client with agency branding
- [ ] Verify reset token created with 1-hour expiry
- [ ] Verify audit log created
- [ ] Client clicks reset link
- [ ] Client sets new password
- [ ] Client logs in with new password

**Test Case 2.6: Reset 2FA**
- [ ] Enable 2FA on client account
- [ ] As agency admin, click "Reset 2FA" on client
- [ ] Verify 2FA cleared (twoFactorEnabled = false)
- [ ] Verify 2FA reset email sent to client with agency branding
- [ ] Verify audit log created
- [ ] Client logs in without 2FA
- [ ] Client can re-enable 2FA

#### 3. Impersonation

**Test Case 3.1: Start Impersonation**
- [ ] Click "Impersonate" on client
- [ ] Verify JWT token generated with 15-min expiry
- [ ] Verify audit log created
- [ ] Verify redirected to client's dashboard
- [ ] Verify impersonation banner shown
- [ ] Verify banner shows target user name and time remaining
- [ ] Verify can use app as client

**Test Case 3.2: Exit Impersonation**
- [ ] Click "Exit" in impersonation banner
- [ ] Verify redirected to agency dashboard
- [ ] Verify impersonation session cleared
- [ ] Verify audit log created
- [ ] Verify banner no longer shown

**Test Case 3.3: Impersonation Expiry**
- [ ] Start impersonation
- [ ] Wait 15 minutes
- [ ] Verify auto-logout
- [ ] Verify redirected to agency dashboard
- [ ] Verify session cleared

#### 4. Branded Login

**Test Case 4.1: Subdomain Login**
- [ ] Set agency subdomain to "acme"
- [ ] Go to `acme.socialecho.ai/signin`
- [ ] Verify agency logo shown
- [ ] Verify agency colors applied
- [ ] Verify "Powered by Social Echo" footer shown
- [ ] Log in as client
- [ ] Verify agency branding persists throughout app

**Test Case 4.2: Query Parameter Login**
- [ ] Go to `socialecho.ai/signin?brand=acme-agency`
- [ ] Verify agency logo shown
- [ ] Verify agency colors applied
- [ ] Log in as client
- [ ] Verify agency branding persists

**Test Case 4.3: Regular Login (No Branding)**
- [ ] Go to `socialecho.ai/signin`
- [ ] Verify default Social Echo branding
- [ ] Log in as individual user
- [ ] Verify no agency branding

#### 5. Billing & Stripe Integration

**Test Case 5.1: Initial Subscription**
- [ ] Sign up as agency
- [ ] Complete Stripe checkout
- [ ] Verify Stripe customer created
- [ ] Verify Stripe subscription created with quantity=0
- [ ] Verify stripeCustomerId stored in database
- [ ] Verify stripeSubscriptionId stored in database

**Test Case 5.2: Quantity Updates**
- [ ] Add 3 clients
- [ ] Verify Stripe subscription quantity = 3
- [ ] Check Stripe dashboard for proration invoice items
- [ ] Pause 1 client
- [ ] Verify Stripe subscription quantity = 2
- [ ] Check Stripe dashboard for credit invoice item
- [ ] Resume client
- [ ] Verify Stripe subscription quantity = 3

**Test Case 5.3: Billing Portal**
- [ ] Click "Manage Billing" on agency dashboard
- [ ] Verify redirected to Stripe billing portal
- [ ] Verify can view invoices
- [ ] Verify can update payment method
- [ ] Verify can view subscription details
- [ ] Verify quantity shown correctly
- [ ] Return to agency dashboard

**Test Case 5.4: Invoice Generation**
- [ ] Wait for monthly billing cycle (or trigger manually in Stripe)
- [ ] Verify invoice generated
- [ ] Verify invoice amount = activeClientCount × £15
- [ ] Verify invoice sent to agency owner email only
- [ ] Verify clients do NOT receive invoice

**Test Case 5.5: Payment Failed**
- [ ] Use test card that fails (4000 0000 0000 0341)
- [ ] Trigger payment
- [ ] Verify payment failed webhook received
- [ ] Verify payment failed email sent to agency owner
- [ ] Verify clients NOT affected

#### 6. Email Branding

**Test Case 6.1: Welcome Email**
- [ ] Add new client
- [ ] Check client's email inbox
- [ ] Verify From: "Agency Name via Social Echo"
- [ ] Verify agency logo in header
- [ ] Verify agency colors applied
- [ ] Verify temporary password included
- [ ] Verify footer: "Provided by Agency Name via Social Echo"

**Test Case 6.2: Password Reset Email**
- [ ] Trigger password reset for client
- [ ] Check client's email inbox
- [ ] Verify From: "Agency Name via Social Echo"
- [ ] Verify agency logo in header
- [ ] Verify agency colors applied
- [ ] Verify reset link works

**Test Case 6.3: 2FA Reset Email**
- [ ] Trigger 2FA reset for client
- [ ] Check client's email inbox
- [ ] Verify From: "Agency Name via Social Echo"
- [ ] Verify agency logo in header
- [ ] Verify agency colors applied

**Test Case 6.4: Agency Admin Notifications**
- [ ] Add client
- [ ] Check agency admin's email inbox
- [ ] Verify From: "Social Echo" (not branded)
- [ ] Verify subject: "New Client Added: ..."
- [ ] Verify includes client count and monthly total
- [ ] Verify includes billing clarity message
- [ ] Repeat for pause, resume, delete actions

#### 7. RBAC & Security

**Test Case 7.1: Role Permissions**
- [ ] As CUSTOMER, try to access `/agency`
- [ ] Verify 403 Forbidden
- [ ] As AGENCY_STAFF, access `/agency`
- [ ] Verify can view client list
- [ ] Try to add client
- [ ] Verify 403 Forbidden
- [ ] As AGENCY_ADMIN, access `/agency`
- [ ] Verify can add/pause/delete clients

**Test Case 7.2: Agency Isolation**
- [ ] Create two agencies (A and B)
- [ ] As Agency A admin, try to access Agency B's client
- [ ] Verify 404 Not Found
- [ ] Try to impersonate Agency B's client
- [ ] Verify 404 Not Found

**Test Case 7.3: Audit Logging**
- [ ] Perform various agency actions
- [ ] Check AuditLog table in database
- [ ] Verify all actions logged with:
  - [ ] Correct actorId
  - [ ] Correct action type
  - [ ] Correct targetId
  - [ ] Correct timestamp
  - [ ] Relevant metadata

#### 8. Edge Cases

**Test Case 8.1: Duplicate Email**
- [ ] Try to add client with existing user email
- [ ] Verify 409 Conflict error
- [ ] Verify client not created
- [ ] Verify activeClientCount not changed

**Test Case 8.2: Invalid Subdomain**
- [ ] Try to set subdomain with special characters
- [ ] Verify validation error
- [ ] Try to set subdomain that's already taken
- [ ] Verify 409 Conflict error

**Test Case 8.3: Stripe API Failure**
- [ ] Simulate Stripe API failure (disconnect internet or use invalid key)
- [ ] Try to add client
- [ ] Verify client still created in database
- [ ] Verify error logged
- [ ] Verify can manually sync quantity later

**Test Case 8.4: Email Delivery Failure**
- [ ] Simulate email delivery failure (invalid Resend key)
- [ ] Add client
- [ ] Verify client still created
- [ ] Verify error logged
- [ ] Verify can manually resend email

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (see Testing Plan)
- [ ] Database migration ready
- [ ] Environment variables configured on Render
- [ ] Stripe webhooks configured
- [ ] Email templates reviewed
- [ ] Documentation complete

### Environment Variables (Render)

Add these to Render environment variables:

```bash
# Existing variables
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://socialecho.ai
NEXTAUTH_SECRET=...
JWT_SECRET=...
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
RESEND_API_KEY=...
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

# New variables (if needed)
# AGENCY_UNIT_PRICE=15  # Optional, defaults to 15
```

### Stripe Configuration

1. **Create Agency Product**
   - Name: "Agency—Grow as You Go"
   - Description: "White-label Social Echo for agencies"
   - Pricing: £15 per unit per month
   - Billing: Recurring, monthly
   - Usage type: Licensed (quantity-based)

2. **Configure Webhooks**
   - Endpoint: `https://socialecho.ai/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Webhook signing secret: Add to Render env vars

3. **Test Mode First**
   - Use Stripe test mode for initial deployment
   - Test all billing scenarios
   - Switch to live mode when ready

### Database Migration

1. **Backup Production Database**
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Run Migration**
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify Migration**
   ```bash
   npx prisma studio
   # Check Agency table exists
   # Check User table has new fields
   ```

### Deployment Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Render Auto-Deploy**
   - Render detects push
   - Runs build
   - Deploys to production

3. **Run Post-Deployment Checks**
   - [ ] Site loads correctly
   - [ ] Database connection works
   - [ ] Stripe webhooks receiving events
   - [ ] Emails sending correctly
   - [ ] Login works
   - [ ] Agency dashboard accessible

4. **Monitor Logs**
   ```bash
   # On Render dashboard
   # Check logs for errors
   # Watch for Stripe webhook events
   # Monitor email delivery
   ```

### Rollback Plan

If issues occur:

1. **Revert Code**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Restore Database**
   ```bash
   psql $DATABASE_URL < backup.sql
   ```

3. **Notify Users**
   - Send email to agency admins
   - Explain issue and timeline
   - Provide support contact

---

## Summary

### What's Working Now

✅ **Database & Schema**
- Agency model with all required fields
- User roles and relationships
- Audit logging

✅ **API Endpoints**
- 10+ agency management endpoints
- Full CRUD for clients
- Stripe integration helpers
- Branding management

✅ **Email System**
- Agency branding support
- Customer-facing emails with white-labeling
- Agency admin notifications
- Proper From name formatting

✅ **Dashboard UI**
- Agency dashboard with client list
- Client actions (add, pause, resume, delete)
- Branding preview
- Billing information

✅ **RBAC & Security**
- Role hierarchy
- Permission checks
- Audit logging
- Agency isolation

### What Needs Completion

🚧 **Branded Login**
- Login page with agency branding
- Subdomain detection
- Query parameter support
- Session persistence

🚧 **Impersonation UI**
- Impersonation banner
- Session handling
- Exit functionality
- Time remaining display

🚧 **Pricing Updates**
- Remove old agency tiers
- Add new agency plan
- Update copy and CTAs

🚧 **Onboarding Flow**
- Post-payment redirect
- Onboarding wizard
- Branding setup
- First client invitation

🚧 **Stripe Webhooks**
- Agency-specific event handling
- Subscription lifecycle
- Payment notifications

🚧 **UI Copy**
- Update all agency references
- Add billing clarity messages
- Show agency branding for customers

🚧 **Testing**
- Comprehensive test suite
- Edge case handling
- Integration testing

### Estimated Time to Completion

- **Phase 2 (Branded Login):** 4-6 hours
- **Phase 3 (Impersonation UI):** 3-4 hours
- **Phase 4 (Pricing Updates):** 2-3 hours
- **Phase 5 (Onboarding Flow):** 4-5 hours
- **Phase 6 (Stripe Webhooks):** 3-4 hours
- **Phase 7 (UI Copy Updates):** 2-3 hours
- **Phase 8 (Testing):** 4-6 hours

**Total:** 22-31 hours of development work

### Next Steps

1. **Review this document** - Confirm all requirements are captured
2. **Prioritize remaining phases** - Decide which to complete first
3. **Complete Phase 2** - Branded login is foundational
4. **Test incrementally** - Test each phase as it's completed
5. **Deploy to staging** - Test full flow before production
6. **Production deployment** - Follow deployment checklist

---

## Contact & Support

For questions or issues:
- **Development:** Review this document and code comments
- **Stripe:** Check Stripe dashboard and webhook logs
- **Email:** Check Resend dashboard for delivery status
- **Database:** Use Prisma Studio for inspection

---

**Document Version:** 2.0  
**Last Updated:** October 5, 2025  
**Status:** Part 1 Complete, Part 2 In Progress
