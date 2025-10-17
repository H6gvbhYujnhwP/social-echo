# Social Echo Agency Platform - Complete Deployment Guide

**Last Updated:** October 6, 2025  
**Purpose:** A comprehensive guide for deploying the Social Echo agency platform to production.

---

## 🚀 Overview

This document provides a step-by-step guide for deploying the Social Echo agency platform. It covers all necessary prerequisites, environment variables, database migrations, Stripe configuration, and post-deployment verification steps.

## 📋 Prerequisites

Before deploying, ensure you have the following:

- A **Render** account (or other hosting provider)
- A **PostgreSQL** database
- A **Stripe** account with API keys
- A **Resend** account for transactional emails
- A **GitHub** repository with the latest application code

## ⚙️ Environment Variables

Configure the following environment variables in your hosting provider's dashboard (e.g., Render):

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Connection string for your PostgreSQL database. | `postgresql://user:password@host:port/dbname` |
| `NEXTAUTH_SECRET` | A secret key for NextAuth.js session encryption. | Generate a 32-byte hex string. |
| `NEXTAUTH_URL` | The canonical URL of your application. | `https://socialecho.ai` |
| `STRIPE_SECRET_KEY` | Your Stripe secret key (use the **live** key for production). | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | The signing secret for your Stripe webhook endpoint. | `whsec_...` |
| `RESEND_API_KEY` | Your API key for the Resend email service. | `re_...` |
| `OPENAI_API_KEY` | Your OpenAI API key for AI text generation. | `sk-...` |
| `ANTHROPIC_API_KEY` | Your Anthropic API key for AI text generation. | `sk-ant-...` |
| `NEXT_PUBLIC_APP_DOMAIN` | The public domain of your application (for subdomains). | `socialecho.ai` |

## 🗄️ Database Migration

Before deploying the application for the first time, or after any schema changes, you must run the database migrations.

```bash
# Connect to your production database and run:
npx prisma migrate deploy
```

This command applies all pending migrations from your `prisma/migrations` directory to the database, ensuring the schema is up-to-date.

## 💳 Stripe Configuration

Proper Stripe configuration is critical for the billing system to function correctly.

### 1. Create Agency Product & Price

In your Stripe dashboard, create a new product for the agency plan:

- **Product Name:** `Agency — Grow as You Go`
- **Pricing Model:** `Standard pricing`
- **Price:** `£39`
- **Billing Period:** `Monthly`
- **Usage is based on:** `A flat price`

Once created, copy the **Price ID** (e.g., `price_...`) and update it in `/home/ubuntu/social-echo/lib/billing/plans.ts` for the `SocialEcho_AgencyStarter` plan.

### 2. Configure Webhook Endpoint

Create a new webhook endpoint in your Stripe dashboard:

- **Endpoint URL:** `https://<your-domain>/api/webhooks/stripe`
- **Listen to:** `Events on your account`
- **Events to send:**
    - `checkout.session.completed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`

After creating the endpoint, copy the **Signing secret** and set it as the `STRIPE_WEBHOOK_SECRET` environment variable.

## 🚀 Deployment Process

1.  **Push to GitHub:** Ensure all latest changes are pushed to your main branch.
2.  **Trigger Deployment:** Your hosting provider (e.g., Render) should automatically detect the new commit and start a new deployment.
3.  **Monitor Build:** Check the deployment logs for any build errors. The build should complete successfully without any static generation errors.

## ✅ Post-Deployment Verification

After the deployment is complete, perform the following checks to ensure everything is working correctly:

### Functional Testing

1.  **Homepage:** Load the homepage and verify all content appears correctly.
2.  **Pricing Page:** Navigate to `/pricing` and confirm the new £39/client/month agency pricing is displayed.
3.  **Signup:** Create a new agency account and complete the Stripe checkout process.
4.  **Agency Dashboard:**
    - Navigate to `/agency` and verify the dashboard loads.
    - Add a new client and confirm the client appears in the list.
    - Switch to the "Billing & Subscription" tab and verify the billing information is correct.
    - Use the "Manage Billing" button to ensure it redirects to the Stripe portal.
5.  **Webhook Verification:** Check the server logs to confirm that Stripe webhooks are being received and processed correctly.

### Technical Verification

- **No Console Errors:** Open the browser's developer tools and check for any console errors.
- **No 500 Errors:** Monitor the application logs for any 500-level server errors.
- **Email Delivery:** Confirm that transactional emails (e.g., welcome emails, password resets) are being delivered.

## 🔄 Rollback Plan

If the deployment introduces critical issues, you can roll back to the previous stable version by reverting the latest commit in your Git repository:

```bash
git revert HEAD
git push origin main
```

This will trigger a new deployment with the previous version of the code.

---

This guide provides a comprehensive overview of the deployment process. By following these steps, you can ensure a smooth and successful deployment of the Social Echo agency platform.
