import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireMasterAdminFromReq } from '@/lib/rbac';

export async function GET(req: Request) {
  try {
    await requireMasterAdminFromReq(req);
    
    const { searchParams } = new URL(req.url);
    const q      = searchParams.get('query') ?? '';
    const role   = searchParams.get('role') ?? undefined;
    const plan   = searchParams.get('plan') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(50, parseInt(searchParams.get('pageSize') ?? '20', 10));
    const skip = (page - 1) * pageSize;

    const where: any = {
      AND: [
        q ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' } },
            { id: q }
          ]
        } : {},
        role ? { role } : {},
        plan || status ? {
          subscription: {
            ...(plan   ? { plan }   : {}),
            ...(status ? { status } : {}),
          }
        } : {}
      ]
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { subscription: true },
        orderBy: { createdAt: 'desc' },
        skip, 
        take: pageSize
      }),
      prisma.user.count({ where })
    ]);

    // Fetch accurate usage from UsageCounter for each user
    const itemsWithUsage = await Promise.all(
      items.map(async (user: any) => {
        if (!user.subscription) return user;

        const cycleStart = user.subscription.currentPeriodStart;
        const cycleEnd = user.subscription.currentPeriodEnd;

        // Get usage counter for current cycle
        const usageCounter = await prisma.usageCounter.findUnique({
          where: {
            userId_cycleStartUtc_cycleEndUtc: {
              userId: user.id,
              cycleStartUtc: cycleStart,
              cycleEndUtc: cycleEnd,
            }
          }
        });

        // Replace usageCount with accurate value from UsageCounter
        return {
          ...user,
          subscription: {
            ...user.subscription,
            usageCount: usageCounter?.postsUsed || 0
          }
        };
      })
    );

    return NextResponse.json({ items: itemsWithUsage, total, page, pageSize });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
