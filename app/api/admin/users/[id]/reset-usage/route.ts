import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminActorOrThrow } from '@/lib/rbac';

export async function POST(req: Request, { params }: { params: { id: string }}) {
  try {
    const actor = await getAdminActorOrThrow();

    // Reset usage count to 0
    await prisma.subscription.updateMany({
      where: { userId: params.id },
      data: { usageCount: 0 }
    });

    // Log action
    await prisma.auditLog.create({
      data: { 
        actorId: actor.id, 
        action: 'RESET_USAGE', 
        targetId: params.id 
      }
    });

    return NextResponse.json({ 
      ok: true, 
      message: 'Usage count reset to 0' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to reset usage' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
