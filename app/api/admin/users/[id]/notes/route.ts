import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminActorOrThrow } from '@/lib/rbac';

export async function POST(req: Request, { params }: { params: { id: string }}) {
  try {
    const actor = await getAdminActorOrThrow();
    const { notes } = await req.json() as { notes: string };

    // Update notes
    await prisma.user.update({
      where: { id: params.id },
      data: { notes }
    });

    // Log action
    await prisma.auditLog.create({
      data: { 
        actorId: actor.id, 
        action: 'UPDATE_NOTES', 
        targetId: params.id 
      }
    });

    return NextResponse.json({ 
      ok: true, 
      message: 'Notes updated successfully' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update notes' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
