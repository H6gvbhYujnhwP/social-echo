import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminActorOrThrow } from '@/lib/rbac';

export async function POST(_: Request, { params }: { params: { id: string }}) {
  try {
    const actor = await getAdminActorOrThrow();
    
    await prisma.user.update({ 
      where: { id: params.id }, 
      data: { isSuspended: true }
    });
    
    await prisma.auditLog.create({ 
      data: { 
        actorId: actor.id, 
        action: 'SUSPEND', 
        targetId: params.id 
      }
    });
    
    return NextResponse.json({ ok: true, message: 'User suspended successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to suspend user' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
