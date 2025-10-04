import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminActorOrThrow } from '@/lib/rbac';

export async function POST(req: Request, { params }: { params: { id: string }}) {
  try {
    const actor = await getAdminActorOrThrow();
    const { mode } = await req.json() as { mode: 'soft' | 'hard' };

    if (mode === 'soft') {
      await prisma.user.update({ 
        where: { id: params.id }, 
        data: { 
          isSuspended: true, 
          notes: 'SOFT_DELETED' 
        }
      });
    } else {
      // Hard delete - remove all related data
      await prisma.subscription.deleteMany({ where: { userId: params.id }});
      await prisma.profile.deleteMany({ where: { userId: params.id }});
      await prisma.postHistory.deleteMany({ where: { userId: params.id }});
      await prisma.feedback.deleteMany({ where: { userId: params.id }});
      await prisma.plannerDay.deleteMany({ where: { userId: params.id }});
      await prisma.passwordResetToken.deleteMany({ where: { userId: params.id }});
      await prisma.user.delete({ where: { id: params.id }});
    }

    await prisma.auditLog.create({
      data: { 
        actorId: actor.id, 
        action: mode === 'soft' ? 'DELETE_SOFT' : 'DELETE_HARD', 
        targetId: params.id 
      }
    });

    return NextResponse.json({ ok: true, message: `User ${mode} deleted successfully` });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
