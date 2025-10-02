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
    
    // Send email (using Resend)
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
        
        await resend.emails.send({
          from: 'SOCIAL ECHO <noreply@socialecho.ai>',
          to: user.email,
          subject: 'Reset your password',
          html: `
            <h2>Reset your password</h2>
            <p>You requested to reset your password. Click the link below to continue:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `
        })
      } catch (emailError) {
        console.error('[request-reset] Email error:', emailError)
        // Don't fail the request if email fails
      }
    }
    
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
