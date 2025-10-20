/**
 * Fix Duplicate Subscriptions Script
 * 
 * This script identifies and fixes customers with multiple active Stripe subscriptions.
 * It keeps the most recent Pro subscription and cancels older Starter subscriptions.
 * 
 * Usage:
 *   npx ts-node scripts/fix-duplicate-subs.ts <customer_email_or_id>
 */

import Stripe from 'stripe';
import { prisma } from '../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
});

interface DuplicateSubInfo {
  customerId: string;
  customerEmail: string;
  subscriptions: Array<{
    id: string;
    status: string;
    plan: string;
    created: number;
    current_period_end: number;
  }>;
}

async function findDuplicateSubscriptions(identifier: string): Promise<DuplicateSubInfo | null> {
  let customerId: string;
  let customerEmail: string;

  // Check if identifier is email or Stripe customer ID
  if (identifier.startsWith('cus_')) {
    customerId = identifier;
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    customerEmail = customer.email || 'unknown';
  } else {
    // Find customer by email
    const customers = await stripe.customers.list({
      email: identifier,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.error(`❌ No customer found with email: ${identifier}`);
      return null;
    }

    customerId = customers.data[0].id;
    customerEmail = customers.data[0].email || 'unknown';
  }

  // Get all subscriptions for this customer
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 100
  });

  // Filter to active/trialing subscriptions
  const activeSubscriptions = subscriptions.data.filter(sub => 
    ['active', 'trialing', 'past_due'].includes(sub.status)
  );

  if (activeSubscriptions.length <= 1) {
    console.log(`✅ Customer ${customerEmail} has ${activeSubscriptions.length} active subscription(s). No duplicates found.`);
    return null;
  }

  return {
    customerId,
    customerEmail,
    subscriptions: activeSubscriptions.map(sub => ({
      id: sub.id,
      status: sub.status,
      plan: sub.items.data[0]?.price.id || 'unknown',
      created: sub.created,
      current_period_end: sub.current_period_end
    }))
  };
}

async function fixDuplicateSubscriptions(info: DuplicateSubInfo, dryRun: boolean = true): Promise<void> {
  console.log(`\n🔍 Found ${info.subscriptions.length} active subscriptions for ${info.customerEmail}:\n`);

  // Sort by creation date (newest first)
  const sortedSubs = [...info.subscriptions].sort((a, b) => b.created - a.created);

  sortedSubs.forEach((sub, index) => {
    const date = new Date(sub.created * 1000).toISOString();
    const endDate = new Date(sub.current_period_end * 1000).toISOString();
    console.log(`  ${index + 1}. ${sub.id}`);
    console.log(`     Status: ${sub.status}`);
    console.log(`     Plan: ${sub.plan}`);
    console.log(`     Created: ${date}`);
    console.log(`     Period End: ${endDate}\n`);
  });

  // Determine which subscription to keep (newest one)
  const keepSub = sortedSubs[0];
  const cancelSubs = sortedSubs.slice(1);

  console.log(`\n📌 Strategy:`);
  console.log(`  KEEP: ${keepSub.id} (${keepSub.plan})`);
  console.log(`  CANCEL: ${cancelSubs.map(s => s.id).join(', ')}\n`);

  if (dryRun) {
    console.log(`⚠️  DRY RUN MODE - No changes will be made`);
    console.log(`   Run with --execute flag to apply changes\n`);
    return;
  }

  // Cancel older subscriptions
  for (const sub of cancelSubs) {
    try {
      console.log(`🔄 Canceling subscription ${sub.id}...`);
      await stripe.subscriptions.cancel(sub.id, {
        prorate: false,
        invoice_now: false
      });
      console.log(`✅ Canceled ${sub.id}`);
    } catch (error: any) {
      console.error(`❌ Failed to cancel ${sub.id}:`, error.message);
    }
  }

  // Update local database to match kept subscription
  try {
    const user = await prisma.user.findFirst({
      where: {
        subscription: {
          stripeCustomerId: info.customerId
        }
      },
      include: { subscription: true }
    });

    if (user && user.subscription) {
      console.log(`\n🔄 Updating local database for user ${user.email}...`);
      
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          stripeSubscriptionId: keepSub.id,
          status: keepSub.status,
          // Plan will be synced by webhook
        }
      });
      
      console.log(`✅ Local database updated`);
    }
  } catch (error: any) {
    console.error(`❌ Failed to update local database:`, error.message);
  }

  console.log(`\n✅ Cleanup complete for ${info.customerEmail}`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error(`Usage: npx ts-node scripts/fix-duplicate-subs.ts <email_or_customer_id> [--execute]`);
    process.exit(1);
  }

  const identifier = args[0];
  const execute = args.includes('--execute');

  console.log(`\n🔍 Checking for duplicate subscriptions...`);
  console.log(`   Identifier: ${identifier}`);
  console.log(`   Mode: ${execute ? 'EXECUTE' : 'DRY RUN'}\n`);

  const duplicateInfo = await findDuplicateSubscriptions(identifier);

  if (!duplicateInfo) {
    console.log(`\n✅ No action needed\n`);
    process.exit(0);
  }

  await fixDuplicateSubscriptions(duplicateInfo, !execute);

  console.log(`\n✅ Script complete\n`);
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

