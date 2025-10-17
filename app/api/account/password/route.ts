// app/api/account/password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const runtime = 'nodejs';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input with structured errors
    const result = passwordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          errors: result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }
    
    const { currentPassword, newPassword } = result.data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true }
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'User not found or OAuth-only account' },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { 
          error: 'Current password is incorrect',
          errors: [{ field: 'currentPassword', message: 'Current password is incorrect' }]
        },
        { status: 400 }
      );
    }

    // Hash new password (10 rounds per blueprint)
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPasswordHash }
    });

    // Audit log for password change
    console.log(JSON.stringify({
      event: 'PASSWORD_CHANGED',
      userId: user.id,
      email: session.user.email,
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ 
      ok: true,
      message: 'Password changed successfully' 
    });

  } catch (error: any) {
    console.error('[account] Password change failed:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}

