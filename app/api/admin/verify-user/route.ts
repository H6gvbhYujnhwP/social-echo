/**
 * Admin API Endpoint
 * Manually verify a user's email address
 * Call: GET /api/admin/verify-user?email=user@example.com&secret=YOUR_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Simple security check - require a secret parameter
    const secret = req.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.ADMIN_SECRET || 'change-me-in-production';
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const email = req.nextUrl.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'User email already verified',
        user: {
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        },
      });
    }

    // Verify the user
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    console.log('[admin] Manually verified user', { userId: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      message: 'User email verified successfully',
      user: {
        email: user.email,
        name: user.name,
        emailVerified: new Date(),
      },
    });
  } catch (error) {
    console.error('[admin] Error verifying user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
