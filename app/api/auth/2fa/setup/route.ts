import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { authenticator } from 'otplib'
import * as QRCode from 'qrcode'

// Force Node.js runtime
export const runtime = 'nodejs'

// Generate 2FA secret and QR code
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    
    // Generate secret
    const secret = authenticator.generateSecret()
    
    // Get user email for QR code
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Generate QR code URL
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'SOCIAL ECHO',
      secret
    )
    
    // Generate QR code image
    const qrCode = await QRCode.toDataURL(otpauthUrl)
    
    return NextResponse.json({
      secret,
      qrCode
    })
    
  } catch (error: any) {
    console.error('[2fa-setup-get] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate 2FA setup' },
      { status: 500 }
    )
  }
}

// Verify and enable 2FA
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    const body = await request.json()
    const { secret, code } = body
    
    if (!secret || !code) {
      return NextResponse.json(
        { error: 'Secret and code required' },
        { status: 400 }
      )
    }
    
    // Verify code
    const isValid = authenticator.verify({
      token: code,
      secret
    })
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 400 }
      )
    }
    
    // Save secret to user
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret }
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('[2fa-setup-post] Error:', error)
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    )
  }
}

// Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    
    // Remove 2FA secret
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: null }
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('[2fa-setup-delete] Error:', error)
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    )
  }
}
