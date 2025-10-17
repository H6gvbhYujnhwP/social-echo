import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminActorOrThrow } from '@/lib/rbac';

export async function POST(_: Request, { params }: { params: { id: string }}) {
  try {
    const actor = await getAdminActorOrThrow();
    
    const user = await prisma.user.update({ 
      where: { id: params.id }, 
      data: { isSuspended: false },
      select: { email: true, name: true }
    });
    
    await prisma.auditLog.create({ 
      data: { 
        actorId: actor.id, 
        action: 'UNSUSPEND', 
        targetId: params.id 
      }
    });
    
    // Send reactivation notification email
    const { sendAccountReactivatedEmail } = await import('@/lib/email/service');
    sendAccountReactivatedEmail(user.email, user.name).catch(err =>
      console.error('[unsuspend] Failed to send email:', err)
    );
    
    return NextResponse.json({ ok: true, message: 'User unsuspended successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to unsuspend user' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
