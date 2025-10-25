// app/api/admin/fix-usage-limits/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CORRECT_LIMITS: Record<string, number | null> = {
  starter: 8,
  pro: 30,
  ultimate: null, // Unlimited
  agency: null,   // Unlimited
  enterprise: null, // Unlimited
};

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || user.role !== 'MASTER_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany({
      include: { user: { select: { email: true } } }
    });

    let fixed = 0;
    let alreadyCorrect = 0;
    const errors: string[] = [];
    const fixedUsers: Array<{ email: string; plan: string; oldLimit: number | null; newLimit: number | null }> = [];

    for (const sub of subscriptions) {
      const plan = sub.plan.toLowerCase();
      const correctLimit: number | null = CORRECT_LIMITS[plan] ?? 8;

      if (sub.usageLimit !== correctLimit) {
        try {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { usageLimit: correctLimit }
          });

          fixedUsers.push({
            email: sub.user.email,
            plan: sub.plan,
            oldLimit: sub.usageLimit,
            newLimit: correctLimit
          });

          fixed++;
        } catch (error: any) {
          errors.push(`${sub.user.email}: ${error.message}`);
        }
      } else {
        alreadyCorrect++;
      }
    }

    console.log('[admin] Fixed legacy usage limits', {
      fixed,
      alreadyCorrect,
      errors: errors.length,
      fixedUsers
    });

    return NextResponse.json({
      success: true,
      fixed,
      alreadyCorrect,
      errors,
      fixedUsers,
      total: subscriptions.length
    });

  } catch (error: any) {
    console.error('[admin] Fix usage limits failed:', error);
    return NextResponse.json(
      { error: 'Failed to fix usage limits' },
      { status: 500 }
    );
  }
}

