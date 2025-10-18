'use server'

import * as bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { limitsFor, normalizePlan, type Plan } from '@/lib/billing/plan-map'
import { sendSecureBillingEmailSafe } from '@/lib/billing/secure-email'
import { z } from 'zod'

// Validation schema
const CreateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  plan: z.enum(['starter', 'pro']).default('pro'),
  trialAmount: z.number().min(0.001).max(365, 'Trial amount must be between 0.001 and 365'),
  trialUnit: z.enum(['minutes', 'hours', 'days']).default('days'),
  sendEmail: z.boolean().default(false),
})

type CreateUserInput = z.infer<typeof CreateUserSchema>

// Convert trial duration to milliseconds
function trialToMilliseconds(amount: number, unit: 'minutes' | 'hours' | 'days'): number {
  switch (unit) {
    case 'minutes':
      return amount * 60_000
    case 'hours':
      return amount * 3_600_000
    case 'days':
      return amount * 86_400_000
    default:
      return amount * 86_400_000 // Default to days
  }
}

// Generate a secure random password
export async function generateSecurePassword(): Promise<string> {
  const length = 16
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Create user with manual trial
export async function createUserWithTrial(input: CreateUserInput) {
  try {
    // Validate input
    const validated = CreateUserSchema.parse(input)
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
      select: { id: true, email: true, name: true }
    })
    
    if (existing) {
      return {
        success: false,
        error: 'A user with this email already exists',
        existingUserId: existing.id,
      }
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10)
    
    // Calculate trial period
    const now = new Date()
    const trialDurationMs = trialToMilliseconds(validated.trialAmount, validated.trialUnit)
    const periodEnd = new Date(now.getTime() + trialDurationMs)
    
    // Get usage limit for plan
    const plan = validated.plan as Plan
    const usageLimit = limitsFor(plan)
    
    // Create user and subscription in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: validated.email,
          name: validated.name ?? null,
          passwordHash,
          role: 'USER',
          isSuspended: false,
        },
      })
      
      // Create subscription with trial
      await tx.subscription.create({
        data: {
          userId: newUser.id,
          plan,
          status: 'active',
          usageCount: 0,
          usageLimit,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
      })
      
      return newUser
    })
    
    // Send activation email if requested
    if (validated.sendEmail) {
      try {
        // Note: We don't have stripeCustomerId for manual trials, so we'll send by userId
        // This is a special case for manual trials
        await sendSecureBillingEmailSafe(
          null, // No stripeCustomerId for manual trials
          'onboarding',
          { userId: user.id }
        )
      } catch (emailError) {
        console.error('[createUserWithTrial] Failed to send email:', emailError)
        // Don't fail the whole operation if email fails
      }
    }
    
    // Generate reset link for the user
    const resetToken = await bcrypt.hash(`${user.id}-${Date.now()}`, 10)
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${encodeURIComponent(resetToken)}`
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan,
        trialEnd: periodEnd.toISOString(),
      },
      resetUrl,
      message: `User created with ${validated.plan} trial until ${periodEnd.toLocaleString()}`,
    }
  } catch (error) {
    console.error('[createUserWithTrial] Error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => e.message).join(', '),
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user',
    }
  }
}

