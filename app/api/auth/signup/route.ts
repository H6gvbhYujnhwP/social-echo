import { NextRequest, NextResponse } from 'next/server'
import * as bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendFreeTrialWelcomeEmail } from '@/lib/email/service'
import crypto from 'crypto'

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
        // Check if they already used free trial - require payment for reactivation
        if (existingUser.hasUsedFreeTrial) {
          console.log('[signup] User already used free trial, requiring payment for reactivation', {
            userId: existingUser.id,
            email: existingUser.email
          });
          
          return NextResponse.json({
            reactivationRequired: true,
            requiresPayment: true,
            userId: existingUser.id,
            email: existingUser.email,
            message: 'You have already used your free trial. Please select a paid plan to continue.'
          }, { status: 200 });
        }
        
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
    
    // Create user with free_trial status (Starter plan only)
    // User gets 8 free posts without payment
    const user = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase(),
        password: passwordHash,
        name: validated.name || 'User',
        businessName: validated.businessName || null,
        emailVerified: new Date(), // Auto-verify email to remove friction
        hasUsedFreeTrial: true, // Mark that they've used their free trial
        freeTrialUsedAt: new Date(),
        subscription: {
          create: {
            plan: 'starter', // Free trial uses Starter plan features
            status: 'free_trial', // New status for payment-free trial
            usageLimit: 8, // 8 free trial posts
            usageCount: 0,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year (usage-based, not time-based)
          }
        }
      },
      include: {
        subscription: true
      }
    })
    
    console.log('[signup] User created with free_trial status (email auto-verified)', {
      userId: user.id,
      businessName: user.businessName || 'none',
      usageLimit: 8
    });
    
    // Email verification removed to reduce signup friction
    // Users can now access the platform immediately after signup
    
    // Return userId and email for signin flow
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      message: 'Account created successfully! You can now sign in.',
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

