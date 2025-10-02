import { NextRequest, NextResponse } from 'next/server'
import * as bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force Node.js runtime
export const runtime = 'nodejs'

const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = ResetPasswordSchema.parse(body)
    
    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validated.token },
      include: { user: true }
    })
    
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }
    
    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      )
    }
    
    // Hash new password
    const password = await bcrypt.hash(validated.password, 10)
    
    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password }
    })
    
    // Delete used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('[reset-password] Error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
