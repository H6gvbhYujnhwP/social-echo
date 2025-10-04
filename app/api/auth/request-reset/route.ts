import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import crypto from 'crypto'

// Force Node.js runtime
export const runtime = 'nodejs'

const RequestResetSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = RequestResetSchema.parse(body)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() }
    })
    
    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }
    
    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour
    
    // Save token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    })
    
    // Send password reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    const { sendPasswordResetEmail } = await import('@/lib/email/service');
    sendPasswordResetEmail(user.email, user.name, resetUrl).catch(err =>
      console.error('[request-reset] Failed to send email:', err)
    );
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('[request-reset] Error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
