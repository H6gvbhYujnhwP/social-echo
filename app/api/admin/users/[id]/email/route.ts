import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminActorOrThrow } from '@/lib/rbac';

export async function POST(req: Request, { params }: { params: { id: string }}) {
  try {
    const actor = await getAdminActorOrThrow();
    const { email } = await req.json() as { email: string };

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email }});
    if (existing && existing.id !== params.id) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Update email
    await prisma.user.update({
      where: { id: params.id },
      data: { email }
    });

    // Log action
    await prisma.auditLog.create({
      data: { 
        actorId: actor.id, 
        action: 'CHANGE_EMAIL', 
        targetId: params.id 
      }
    });

    return NextResponse.json({ 
      ok: true, 
      message: 'Email updated successfully' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update email' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
