import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminActorOrThrow } from '@/lib/rbac';
import crypto from 'crypto';

export async function POST(req: Request, { params }: { params: { id: string }}) {
  try {
    const actor = await getAdminActorOrThrow();
    
    // Get user
    const user = await prisma.user.findUnique({ where: { id: params.id }});
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Create reset link
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Log action
    await prisma.auditLog.create({
      data: { 
        actorId: actor.id, 
        action: 'RESET_PASSWORD_LINK', 
        targetId: params.id 
      }
    });

    // Note: Email sending is handled separately by admin
    // This is an admin-initiated reset, so the link is returned to admin
    // If you want to send email directly to user, uncomment below:
    // import { sendPasswordResetEmail } from '@/lib/email/service';
    // sendPasswordResetEmail(user.email, user.name, resetUrl).catch(console.error);

    return NextResponse.json({ 
      ok: true, 
      resetUrl,
      message: 'Password reset link generated' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate reset link' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
