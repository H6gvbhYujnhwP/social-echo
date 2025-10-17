import { NextRequest, NextResponse } from 'next/server'
import * as bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendWelcomeEmail } from '@/lib/email/service'

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
      email: user.email,
      businessName: user.businessName || 'none',
    });
    
    // Send welcome email (non-blocking) with retry logic
    const sendWelcomeEmailAsync = async () => {
      // Check if welcome email already sent (defensive guard)
      if (user.welcomeSentAt) {
        console.log('[signup] Welcome email already sent', { userId: user.id, sentAt: user.welcomeSentAt });
        return;
      }
      
      try {
        // First attempt
        const success = await sendWelcomeEmail(user.email, user.name);
        if (success) {
          await prisma.user.update({
            where: { id: user.id },
            data: { welcomeSentAt: new Date() }
          });
          console.log('[signup] Welcome email sent and marked', { userId: user.id, email: user.email });
        } else {
          throw new Error('Email send returned false');
        }
      } catch (err) {
        console.error('[signup] Welcome email failed, retrying...', {
          userId: user.id,
          email: user.email,
          error: (err as Error)?.message
        });
        
        // Retry once after 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const success = await sendWelcomeEmail(user.email, user.name);
          if (success) {
            await prisma.user.update({
              where: { id: user.id },
              data: { welcomeSentAt: new Date() }
            });
            console.log('[signup] Welcome email sent on retry', { userId: user.id });
          } else {
            console.error('[signup] Welcome email retry failed', { userId: user.id });
          }
        } catch (err2) {
          console.error('[signup] Welcome email retry failed', {
            userId: user.id,
            email: user.email,
            error: (err2 as Error)?.message
          });
        }
      }
    };
    
    // Execute async (non-blocking)
    sendWelcomeEmailAsync().catch(err => 
      console.error('[signup] Unexpected error in welcome email:', err)
    );
    
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

