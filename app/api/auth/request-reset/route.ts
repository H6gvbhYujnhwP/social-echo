export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email/service';
import { passwordResetEmail } from '@/lib/email/templates';

const requestResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// In-memory debounce tracking (per-email, 60-second window)
const requestDebounce = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = requestResetSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.errors },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const emailLower = email.toLowerCase().trim();

    // Check debounce (prevent spam)
    const now = Date.now();
    const lastRequest = requestDebounce.get(emailLower);
    if (lastRequest && now - lastRequest < 60000) {
      // Still return 200 to prevent information leakage
      return NextResponse.json({ 
        success: true,
        message: 'If that email exists, we\'ve sent a reset link' 
      });
    }
    requestDebounce.set(emailLower, now);

    // Clean up old debounce entries (older than 5 minutes)
    for (const [key, timestamp] of requestDebounce.entries()) {
      if (now - timestamp > 300000) {
        requestDebounce.delete(key);
      }
    }

    // Find user (but don't leak if they exist)
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    // Always return success (don't leak if email exists)
    if (!user) {
      return NextResponse.json({ 
        success: true,
        message: 'If that email exists, we\'ve sent a reset link' 
      });
    }

    // Expire any prior tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Create new reset token (expires in 30 minutes)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Build reset URL (host-aware)
    const baseUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send email
    try {
      const emailTemplate = passwordResetEmail(user.name ?? 'there', resetUrl);
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });
    } catch (emailError) {
      console.error('[password-reset] Email send failed:', emailError);
      // Don't fail the request if email fails - token is still valid
    }

    // Log for audit (success)
    console.log(JSON.stringify({
      event: 'PASSWORD_RESET_REQUESTED',
      userId: user.id,
      email: emailLower,
      timestamp: new Date().toISOString(),
    }));

    // Always return success (don't leak if email exists)
    return NextResponse.json({ 
      success: true,
      message: 'If that email exists, we\'ve sent a reset link' 
    });

  } catch (error) {
    console.error('[password-reset] Request error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
