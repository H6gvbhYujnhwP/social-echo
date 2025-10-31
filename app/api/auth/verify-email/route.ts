import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/signin?error=invalid_token', request.url))
    }

    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/signin?error=invalid_token', request.url))
    }

    // Check if token has expired
    if (verificationToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.emailVerificationToken.delete({
        where: { token },
      })
      return NextResponse.redirect(new URL('/signin?error=token_expired', request.url))
    }

    // Update user's emailVerified field
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    })

    // Delete the used token
    await prisma.emailVerificationToken.delete({
      where: { token },
    })

    console.log('[verify-email] Email verified successfully', {
      userId: verificationToken.userId,
      email: verificationToken.email,
    })

    // Redirect to signin with success message
    return NextResponse.redirect(new URL('/signin?verified=1', request.url))
  } catch (error: any) {
    console.error('[verify-email] Error:', error)
    return NextResponse.redirect(new URL('/signin?error=verification_failed', request.url))
  }
}
