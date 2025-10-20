# Social Echo Agency Platform - Testing Checklist

**Last Updated:** October 6, 2025  
**Purpose:** Comprehensive testing guide for agency platform features

---

## 📋 Testing Overview

This checklist covers all critical features of the Social Echo agency platform. Complete each section systematically to ensure the platform is production-ready.

---

## 1. Agency Signup & Onboarding

### 1.1 Agency Signup Flow
- [ ] Navigate to `/pricing` page
- [ ] Click "Get Started" on Agency plan
- [ ] Verify redirect to `/signup?plan=SocialEcho_AgencyStarter`
- [ ] Complete signup form with valid email and password
- [ ] Verify redirect to Stripe checkout
- [ ] Complete test payment with Stripe test card (4242 4242 4242 4242)
- [ ] Verify redirect back to application
- [ ] Confirm user role is set to `AGENCY_ADMIN`
- [ ] Verify subscription record created in database

### 1.2 Initial Agency Setup
- [ ] Verify agency record created in database
- [ ] Check that `stripeCustomerId` is populated
- [ ] Verify initial subscription quantity is 0 (no clients yet)
- [ ] Confirm welcome email sent to agency owner

---

## 2. Agency Dashboard Access

### 2.1 Dashboard Navigation
- [ ] Login as agency admin
- [ ] Navigate to `/agency` dashboard
- [ ] Verify dashboard loads without errors
- [ ] Check that agency name and branding appear correctly
- [ ] Verify KPI cards show correct data (clients, billing)

### 2.2 Tab Navigation
- [ ] Click "Client Management" tab
- [ ] Verify client list appears
- [ ] Click "Billing & Subscription" tab
- [ ] Verify billing information loads
- [ ] Confirm tab switching works smoothly

---

## 3. Client Management

### 3.1 Adding Clients
- [ ] Click "Add Client" button
- [ ] Enter client email: `testclient1@example.com`
- [ ] Enter client name: `Test Client 1`
- [ ] Submit form
- [ ] Verify success message appears
- [ ] Confirm client appears in client list
- [ ] Check that active client count increased by 1
- [ ] Verify welcome email sent to client with temporary password
- [ ] Verify agency admin receives notification email

### 3.2 Client List Display
- [ ] Verify all clients appear in the table
- [ ] Check client name and email are correct
- [ ] Verify status badge shows "active" or "paused"
- [ ] Confirm last login date displays correctly
- [ ] Test table sorting (if implemented)
- [ ] Test search/filter functionality (if implemented)

### 3.3 Client Actions
- [ ] Click "View as" (impersonate) button
- [ ] Verify impersonation banner appears
- [ ] Confirm you can navigate as the client
- [ ] Click "Exit Impersonation"
- [ ] Verify return to agency dashboard

- [ ] Click "Reset PW" button
- [ ] Confirm password reset email sent to client
- [ ] Verify email contains agency branding

- [ ] Click "Reset 2FA" button
- [ ] Confirm 2FA reset email sent to client
- [ ] Verify 2FA settings cleared in database

- [ ] Click "Pause" button on active client
- [ ] Confirm client status changes to "paused"
- [ ] Verify client cannot login while paused
- [ ] Verify billing quantity does NOT decrease (paused clients still billed)

- [ ] Click "Resume" button on paused client
- [ ] Confirm client status changes to "active"
- [ ] Verify client can login again

- [ ] Click "Delete" button on a client
- [ ] Confirm deletion warning appears
- [ ] Proceed with deletion
- [ ] Verify client removed from list
- [ ] Confirm active client count decreased
- [ ] Verify Stripe subscription quantity updated

---

## 4. Billing & Subscription

### 4.1 Billing Tab Display
- [ ] Navigate to "Billing & Subscription" tab
- [ ] Verify current plan shows "Agency — Grow as You Go"
- [ ] Check active client count is correct
- [ ] Confirm price per client shows "£39/month"
- [ ] Verify "Your next bill" calculation is correct (clients × £39)
- [ ] Check next billing date displays correctly

### 4.2 Stripe Portal Integration
- [ ] Click "Manage Billing & Payment Methods" button
- [ ] Verify redirect to Stripe customer portal
- [ ] Confirm portal shows correct subscription details
- [ ] Test updating payment method
- [ ] Test viewing invoice history
- [ ] Return to agency dashboard

### 4.3 Billing Calculations
- [ ] Add 5 clients
- [ ] Verify next bill shows £195 (5 × £39)
- [ ] Delete 2 clients
- [ ] Verify next bill shows £117 (3 × £39)
- [ ] Pause 1 client
- [ ] Verify next bill still shows £117 (paused clients still billed)

---

## 5. Stripe Webhook Events

### 5.1 Checkout Completion
- [ ] Complete a new agency signup
- [ ] Check server logs for `[webhook] Checkout completed` message
- [ ] Verify subscription created in database
- [ ] Confirm `stripeCustomerId` and `stripeSubscriptionId` populated
- [ ] Verify payment success email sent

### 5.2 Subscription Updates
- [ ] Add a client (triggers quantity update)
- [ ] Check server logs for `[webhook] Subscription event: customer.subscription.updated`
- [ ] Verify quantity logged correctly
- [ ] Confirm subscription record updated in database

- [ ] Delete a client (triggers quantity update)
- [ ] Verify webhook logs quantity decrease
- [ ] Confirm database reflects new quantity

### 5.3 Payment Failures
- [ ] Use Stripe CLI to trigger `invoice.payment_failed` event
- [ ] Check server logs for payment failure message
- [ ] Verify subscription status updated to `past_due`
- [ ] Confirm payment failed email sent to agency owner

### 5.4 Subscription Cancellation
- [ ] Cancel subscription via Stripe portal
- [ ] Check server logs for `[webhook] Subscription deleted`
- [ ] Verify subscription status updated to `canceled`
- [ ] Confirm cancellation email sent to agency owner
- [ ] Verify all clients paused (optional feature)

---

## 6. Branded Login Experience

### 6.1 Subdomain Detection
- [ ] Set agency subdomain to `testacme`
- [ ] Navigate to `testacme.socialecho.ai/signin` (requires DNS setup)
- [ ] Verify agency logo appears
- [ ] Check that agency primary color applied to buttons
- [ ] Confirm "Powered by Test ACME" message displays
- [ ] Verify "Powered by Social Echo" footer appears

### 6.2 Query Parameter Branding
- [ ] Navigate to `/signin?brand=testacme-agency`
- [ ] Verify same branding appears as subdomain method
- [ ] Test with different agency slugs
- [ ] Confirm fallback to default branding if slug not found

### 6.3 Client Login
- [ ] Login as a client user (not agency admin)
- [ ] Verify branded login page appears
- [ ] Complete login with client credentials
- [ ] Confirm redirect to client dashboard
- [ ] Verify agency branding persists in client dashboard (if implemented)

---

## 7. Email Notifications

### 7.1 Agency Admin Emails
- [ ] Add a client → Verify "New client added" email received
- [ ] Pause a client → Verify "Client paused" email received
- [ ] Resume a client → Verify "Client resumed" email received
- [ ] Delete a client → Verify "Client deleted" email received
- [ ] Payment succeeds → Verify payment receipt email received
- [ ] Payment fails → Verify payment failure email received

### 7.2 Client Emails
- [ ] New client added → Verify welcome email with temporary password
- [ ] Password reset → Verify reset email with agency branding
- [ ] 2FA reset → Verify 2FA reset email with agency branding
- [ ] Subscription cancelled → Verify NO email sent to clients (only agency admin)

### 7.3 Email Branding
- [ ] Check all client emails include agency logo (if provided)
- [ ] Verify agency primary color used in email templates
- [ ] Confirm "From" name shows agency name
- [ ] Verify "Powered by Social Echo" footer in all emails

---

## 8. Pricing Page Consistency

### 8.1 Individual Plans
- [ ] Navigate to `/pricing`
- [ ] Verify "Starter" plan shows £29.99/month
- [ ] Verify "Pro" plan shows £49.99/month
- [ ] Check feature lists are accurate
- [ ] Test "Get Started" buttons redirect correctly

### 8.2 Agency Plans
- [ ] Verify single "Agency — Grow as You Go" section
- [ ] Confirm all three tiers show £39/client/month
- [ ] Check feature lists are consistent
- [ ] Verify "Get Started" buttons work
- [ ] Confirm no old pricing (£199, £399, £799) appears

### 8.3 Revenue Calculator
- [ ] Check "Agency Revenue Potential" section
- [ ] Verify "You Pay" shows £39/mo per client
- [ ] Verify "You Charge" shows £99/mo per client
- [ ] Confirm "Your Margin" shows £60/mo per client
- [ ] Check example calculation (25 clients = £1,500 profit)

---

## 9. Homepage Consistency

### 9.1 Agency Section
- [ ] Navigate to homepage `/`
- [ ] Scroll to agency plans section
- [ ] Verify single "Agency — Grow as You Go" card
- [ ] Confirm pricing shows £39/client/mo
- [ ] Check feature list is accurate
- [ ] Test "Get Started" button

### 9.2 Revenue Example
- [ ] Locate "Agency Revenue Potential" section
- [ ] Verify all numbers match pricing page
- [ ] Confirm calculations are correct
- [ ] Check messaging is consistent

---

## 10. RBAC & Permissions

### 10.1 Agency Admin Permissions
- [ ] Login as `AGENCY_ADMIN`
- [ ] Verify access to `/agency` dashboard
- [ ] Confirm can add clients
- [ ] Verify can pause/resume clients
- [ ] Confirm can delete clients
- [ ] Verify can impersonate clients
- [ ] Check can access billing tab

### 10.2 Agency Staff Permissions (if implemented)
- [ ] Login as `AGENCY_STAFF`
- [ ] Verify access to `/agency` dashboard
- [ ] Confirm can view clients
- [ ] Verify CANNOT delete clients
- [ ] Confirm can impersonate clients (optional)
- [ ] Check can access billing tab (view only)

### 10.3 Customer Permissions
- [ ] Login as `CUSTOMER` (client user)
- [ ] Verify NO access to `/agency` dashboard
- [ ] Confirm redirect to `/dashboard` if attempted
- [ ] Verify can only access own data

### 10.4 Master Admin Permissions
- [ ] Login as `MASTER_ADMIN`
- [ ] Verify access to `/admin` panel
- [ ] Confirm can view all agencies
- [ ] Verify can view all users across agencies
- [ ] Check can modify any subscription

---

## 11. Impersonation Feature

### 11.1 Start Impersonation
- [ ] Login as agency admin
- [ ] Click "View as" on a client
- [ ] Verify yellow banner appears at top
- [ ] Confirm banner shows agency admin name
- [ ] Check banner shows client name
- [ ] Verify 15-minute countdown timer displays

### 11.2 During Impersonation
- [ ] Navigate to `/dashboard` as client
- [ ] Verify can generate posts as client
- [ ] Confirm can view client's content
- [ ] Check banner persists on all pages
- [ ] Verify timer counts down

### 11.3 Exit Impersonation
- [ ] Click "Exit Impersonation" button
- [ ] Verify redirect to `/agency` dashboard
- [ ] Confirm banner disappears
- [ ] Check audit log records impersonation end

### 11.4 Auto-Logout
- [ ] Start impersonation
- [ ] Wait 15 minutes (or manually adjust timer for testing)
- [ ] Verify auto-logout occurs
- [ ] Confirm redirect to agency dashboard

---

## 12. Audit Logging

### 12.1 Client Actions
- [ ] Add a client → Check `AuditLog` table for entry
- [ ] Pause a client → Verify log entry created
- [ ] Resume a client → Verify log entry created
- [ ] Delete a client → Verify log entry created
- [ ] Reset password → Verify log entry created
- [ ] Reset 2FA → Verify log entry created

### 12.2 Impersonation Logs
- [ ] Start impersonation → Verify log entry with `IMPERSONATE_START`
- [ ] Exit impersonation → Verify log entry with `IMPERSONATE_END`
- [ ] Check logs include actor (agency admin) and target (client)

### 12.3 Billing Logs (if implemented)
- [ ] Subscription created → Verify log entry
- [ ] Subscription updated → Verify log entry
- [ ] Payment succeeded → Verify log entry
- [ ] Payment failed → Verify log entry

---

## 13. Error Handling

### 13.1 Invalid Inputs
- [ ] Try adding client with invalid email → Verify error message
- [ ] Try adding client with duplicate email → Verify error message
- [ ] Try deleting non-existent client → Verify graceful error
- [ ] Try accessing `/agency` as non-agency user → Verify 403 error

### 13.2 Network Errors
- [ ] Simulate network failure during client add → Verify error handling
- [ ] Test Stripe webhook with invalid signature → Verify rejection
- [ ] Test API endpoints with missing auth → Verify 401 error

### 13.3 Edge Cases
- [ ] Add 100+ clients → Verify performance
- [ ] Delete all clients → Verify billing shows £0
- [ ] Pause all clients → Verify billing still calculates correctly
- [ ] Test with agency that has no logo → Verify default branding

---

## 14. Performance & Load Testing

### 14.1 Dashboard Load Times
- [ ] Measure time to load `/agency` with 10 clients
- [ ] Measure time to load `/agency` with 50 clients
- [ ] Measure time to load `/agency` with 100 clients
- [ ] Verify load times are acceptable (<2 seconds)

### 14.2 API Response Times
- [ ] Test `GET /api/agency` response time
- [ ] Test `POST /api/agency/clients` response time
- [ ] Test `GET /api/agency/billing` response time
- [ ] Verify all APIs respond within 500ms

---

## 15. Browser Compatibility

### 15.1 Desktop Browsers
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)

### 15.2 Mobile Browsers
- [ ] Test in Chrome Mobile (Android)
- [ ] Test in Safari Mobile (iOS)
- [ ] Verify responsive design works
- [ ] Check touch interactions work correctly

---

## 16. Security Testing

### 16.1 Authentication
- [ ] Verify JWT tokens expire correctly
- [ ] Test session timeout after inactivity
- [ ] Confirm password reset tokens expire
- [ ] Verify 2FA cannot be bypassed

### 16.2 Authorization
- [ ] Test accessing `/agency` without login → Verify redirect to `/signin`
- [ ] Test accessing other agency's data → Verify 403 error
- [ ] Test modifying other agency's clients → Verify rejection

### 16.3 Input Validation
- [ ] Test SQL injection in client email field
- [ ] Test XSS in client name field
- [ ] Test CSRF protection on forms
- [ ] Verify all inputs sanitized

---

## 17. Database Integrity

### 17.1 Relationships
- [ ] Verify agency-client relationship is correct
- [ ] Check subscription-agency relationship
- [ ] Confirm audit log entries reference correct entities

### 17.2 Data Consistency
- [ ] Add client → Verify all related records created
- [ ] Delete client → Verify cascade deletes work correctly
- [ ] Verify no orphaned records after deletions

---

## 18. Deployment Verification

### 18.1 Environment Variables
- [ ] Verify all required env vars set in production
- [ ] Check `STRIPE_SECRET_KEY` is live key (not test)
- [ ] Verify `STRIPE_WEBHOOK_SECRET` matches production webhook
- [ ] Confirm `NEXTAUTH_URL` is correct production URL

### 18.2 Database Migration
- [ ] Run `npx prisma migrate deploy` on production database
- [ ] Verify all tables created correctly
- [ ] Check indexes are applied
- [ ] Confirm no migration errors

### 18.3 Post-Deployment Checks
- [ ] Test agency signup flow in production
- [ ] Verify Stripe webhooks are received
- [ ] Check email delivery works
- [ ] Confirm all pages load without errors

---

## ✅ Testing Sign-Off

**Tested By:** ___________________________  
**Date:** ___________________________  
**Environment:** ☐ Staging  ☐ Production  
**Overall Status:** ☐ Pass  ☐ Fail  ☐ Needs Review  

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

## 🐛 Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Example: Billing tab slow with 100+ clients | Low | Open | Optimize query |
|  |  |  |  |
|  |  |  |  |

---

**End of Testing Checklist**
