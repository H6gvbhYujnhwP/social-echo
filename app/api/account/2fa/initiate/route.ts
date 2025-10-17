// app/api/account/2fa/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { authenticator } from 'otplib';
import { qrDataUrl } from '@/lib/qrcode';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate secret
    const secret = authenticator.generateSecret();
    
    // Create otpauth URL
    const otpauthUrl = authenticator.keyuri(
      session.user.email,
      'Social Echo',
      secret
    );

    // Generate QR code as data URL
    const qrCode = await qrDataUrl(otpauthUrl);

    // Store secret in session/cache temporarily
    // For simplicity, we'll return it and expect client to send it back with verify
    // In production, you might want to use Redis or session storage

    console.log('[account] 2FA initiation', { userId: session.user.email });

    return NextResponse.json({
      secret,
      qrCode,
      otpauthUrl
    });

  } catch (error: any) {
    console.error('[account] 2FA initiation failed:', error);

    return NextResponse.json(
      { error: 'Failed to initiate 2FA' },
      { status: 500 }
    );
  }
}

