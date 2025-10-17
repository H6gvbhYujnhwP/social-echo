// scripts/fix-legacy-usage-limits.ts
// Fix legacy subscriptions with incorrect usage limits (e.g., 30/30 posts)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CORRECT_LIMITS = {
  starter: 8,
  pro: 10_000_000,
  agency: 10_000_000,
  enterprise: 10_000_000,
};

async function fixLegacyUsageLimits() {
  console.log('🔍 Finding subscriptions with incorrect usage limits...\n');

  try {
    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany({
      include: { user: { select: { email: true } } }
    });

    console.log(`Found ${subscriptions.length} total subscriptions\n`);

    let fixed = 0;
    let alreadyCorrect = 0;
    let errors = 0;

    for (const sub of subscriptions) {
      const plan = sub.plan.toLowerCase();
      const correctLimit = CORRECT_LIMITS[plan as keyof typeof CORRECT_LIMITS] || 8;

      if (sub.usageLimit !== correctLimit) {
        console.log(`❌ Incorrect limit found:`);
        console.log(`   User: ${sub.user.email}`);
        console.log(`   Plan: ${sub.plan}`);
        console.log(`   Current limit: ${sub.usageLimit}`);
        console.log(`   Correct limit: ${correctLimit}`);

        try {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { usageLimit: correctLimit }
          });

          console.log(`   ✅ Fixed!\n`);
          fixed++;
        } catch (error) {
          console.error(`   ⚠️  Failed to fix: ${error}\n`);
          errors++;
        }
      } else {
        alreadyCorrect++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Fixed: ${fixed}`);
    console.log(`   ✓  Already correct: ${alreadyCorrect}`);
    console.log(`   ⚠️  Errors: ${errors}`);
    console.log(`   📝 Total processed: ${subscriptions.length}`);

    if (fixed > 0) {
      console.log('\n🎉 Legacy usage limits have been corrected!');
      console.log('   All subscriptions now have the correct limits:');
      console.log('   - Starter: 8 posts/month');
      console.log('   - Pro: Unlimited');
      console.log('   - Agency: Unlimited');
    } else {
      console.log('\n✓ All subscriptions already have correct usage limits!');
    }

  } catch (error) {
    console.error('❌ Error fixing usage limits:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixLegacyUsageLimits()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

export {};

