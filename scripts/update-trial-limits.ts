/**
 * Database Migration Script
 * Updates existing free trial users from 30 posts to 8 posts
 * Run once after deployment to fix existing trial accounts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateTrialLimits() {
  console.log('🔄 Starting trial limit update...');
  
  try {
    // Find all free trial subscriptions with 30 post limit
    const trialSubs = await prisma.subscription.findMany({
      where: {
        status: 'free_trial',
        usageLimit: 30,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    console.log(`📊 Found ${trialSubs.length} trial users with 30-post limit`);

    if (trialSubs.length === 0) {
      console.log('✅ No trial users need updating');
      return;
    }

    // Update each subscription
    let updated = 0;
    for (const sub of trialSubs) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { usageLimit: 8 },
      });
      
      console.log(`✅ Updated ${sub.user.email} (${sub.user.name}) - ${sub.usageCount}/${sub.usageLimit} → ${sub.usageCount}/8`);
      updated++;
    }

    console.log(`\n🎉 Successfully updated ${updated} trial users from 30 to 8 posts!`);
    
  } catch (error) {
    console.error('❌ Error updating trial limits:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
updateTrialLimits()
  .then(() => {
    console.log('✅ Migration complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
