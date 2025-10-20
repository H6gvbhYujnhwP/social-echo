import { NextRequest, NextResponse } from 'next/server'
import * as bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
// Email sending removed - now handled by webhooks after payment

// Force Node.js runtime
export const runtime = 'nodejs'

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  businessName: z.string().optional(), // Optional business name for invoices
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validated = SignupSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
      include: { subscription: true }
    })
    
    if (existingUser) {
      // Check if user has a canceled subscription - allow reactivation
      if (existingUser.subscription?.status === 'canceled') {
        console.log('[signup] Existing user with canceled subscription, allowing reactivation', {
          userId: existingUser.id,
          email: existingUser.email
        });
        
        return NextResponse.json({
          reactivationRequired: true,
          userId: existingUser.id,
          email: existingUser.email,
        }, { status: 200 });
      }
      
      // User exists with active subscription
      return NextResponse.json(
        { error: 'User already exists with an active account' },
        { status: 409 } // 409 Conflict
      )
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10)
    
    // Create user with pending_payment status
    // The webhook will upgrade to active once payment succeeds
    const user = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase(),
        password: passwordHash,
        name: validated.name || 'User',
        businessName: validated.businessName || null,
        subscription: {
          create: {
            plan: 'none', // No plan until payment succeeds
            status: 'pending_payment', // Waiting for Stripe checkout
            usageLimit: 0, // No usage until plan is activated
            usageCount: 0,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      include: {
        subscription: true
      }
    })
    
    console.log('[signup] User created with pending_payment status', {
      userId: user.id,
      businessName: user.businessName || 'none',
    });
    
    // NOTE: Email sending removed from signup route per v7.0 blueprint
    // Emails are now sent ONLY after payment confirmation via Stripe webhooks
    // This prevents sending emails to users who never complete payment
    
    // Return userId and email for checkout flow
    return NextResponse.json({
      userId: user.id,
      email: user.email,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('[signup] Error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', message: 'Please check your email and password' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'SIGNUP_FAILED', message: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}

