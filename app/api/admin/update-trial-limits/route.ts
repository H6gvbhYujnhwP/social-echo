/**
 * Admin API Endpoint
 * Updates existing free trial users from 30 posts to 8 posts
 * Call once after deployment: GET /api/admin/update-trial-limits?secret=YOUR_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Simple security check - require a secret parameter
    const secret = req.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.ADMIN_SECRET || 'change-me-in-production';
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting trial limit update...');
    
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
      return NextResponse.json({
        success: true,
        message: 'No trial users need updating',
        updated: 0,
      });
    }

    // Update each subscription
    const updates = [];
    for (const sub of trialSubs) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { usageLimit: 8 },
      });
      
      updates.push({
        email: sub.user.email,
        name: sub.user.name,
        oldLimit: `${sub.usageCount}/${sub.usageLimit}`,
        newLimit: `${sub.usageCount}/8`,
      });
      
      console.log(`✅ Updated ${sub.user.email} - ${sub.usageCount}/${sub.usageLimit} → ${sub.usageCount}/8`);
    }

    console.log(`\n🎉 Successfully updated ${updates.length} trial users!`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updates.length} trial users from 30 to 8 posts`,
      updated: updates.length,
      details: updates,
    });
    
  } catch (error) {
    console.error('❌ Error updating trial limits:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update trial limits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
