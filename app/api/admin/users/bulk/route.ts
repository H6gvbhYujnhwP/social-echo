import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminActorOrThrow } from '@/lib/rbac';

export async function POST(req: Request) {
  try {
    const actor = await getAdminActorOrThrow();
    const { ids, action, planKey } = await req.json() as { 
      ids: string[]; 
      action: 'suspend'|'unsuspend'|'plan'; 
      planKey?: string 
    };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No user IDs provided' }, { status: 400 });
    }

    if (action === 'suspend') {
      await prisma.user.updateMany({ 
        where: { id: { in: ids }}, 
        data: { isSuspended: true }
      });
    } else if (action === 'unsuspend') {
      await prisma.user.updateMany({ 
        where: { id: { in: ids }}, 
        data: { isSuspended: false }
      });
    } else if (action === 'plan') {
      // Log intent for bulk plan change
      await prisma.auditLog.create({ 
        data: { 
          actorId: actor.id, 
          action: 'BULK_PLAN_REQUEST', 
          meta: { ids, planKey }
        }
      });
    }

    await prisma.auditLog.create({ 
      data: { 
        actorId: actor.id, 
        action: `BULK_${action.toUpperCase()}`, 
        meta: { ids } 
      }
    });
    
    return NextResponse.json({ 
      ok: true, 
      message: `Bulk ${action} completed for ${ids.length} users` 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Bulk operation failed' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
