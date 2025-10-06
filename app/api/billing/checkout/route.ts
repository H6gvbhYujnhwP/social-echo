export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil' as any,
})

/**
 * POST /api/billing/checkout
 * 
 * Creates a Stripe Checkout session for agency subscription
 * 
 * Body:
 * - plan: 'SocialEcho_Agency' | 'SocialEcho_Starter' | 'SocialEcho_Pro'
 * - quantity: number (for agency plans, defaults to 1 for individual plans)
 * - coupon?: string (optional coupon code)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id as string

    const body = await request.json()
    const { plan, quantity = 1, coupon } = body

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 })
    }

    // Get user and check if they have an agency
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        ownedAgency: true,
        subscription: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine if this is an agency plan
    const isAgencyPlan = plan === 'SocialEcho_Agency'

    // For agency plans, only agency owners can checkout
    if (isAgencyPlan && user.role !== 'AGENCY_ADMIN') {
      return NextResponse.json({ 
        error: 'Only agency owners can purchase agency plans' 
      }, { status: 403 })
    }

    // Get the Stripe price ID from environment variables
    const priceId = process.env[`STRIPE_PRICE_${plan.toUpperCase()}`]
    if (!priceId) {
      return NextResponse.json({ 
        error: `Price ID not configured for plan: ${plan}` 
      }, { status: 400 })
    }

    // Get or create Stripe customer
    // For agency plans, use agency's stripeCustomerId
    // For individual plans, use subscription's stripeCustomerId
    let stripeCustomerId: string | null = null
    
    if (isAgencyPlan && user.ownedAgency) {
      stripeCustomerId = user.ownedAgency.stripeCustomerId
    } else if (user.subscription) {
      stripeCustomerId = user.subscription.stripeCustomerId
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          plan: plan,
          isAgencyPlan: isAgencyPlan.toString(),
        }
      })
      stripeCustomerId = customer.id

      // Update the appropriate model with Stripe customer ID
      if (isAgencyPlan && user.ownedAgency) {
        await prisma.agency.update({
          where: { id: user.ownedAgency.id },
          data: { stripeCustomerId }
        })
      } else {
        // For individual plans, update or create subscription
        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            stripeCustomerId,
            plan: 'pending',
            status: 'incomplete',
            usageLimit: 0,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(),
          },
          update: {
            stripeCustomerId
          }
        })
      }
    }

    // Build checkout session parameters
    const host = request.headers.get('host') || 'socialecho.ai'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    // Preserve branding in success/cancel URLs
    const url = new URL(request.url)
    const brandParam = url.searchParams.get('brand')
    const brandQuery = brandParam ? `?brand=${brandParam}` : ''

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: isAgencyPlan ? quantity : 1,
        }
      ],
      success_url: isAgencyPlan 
        ? `${baseUrl}/agency${brandQuery}?session_id={CHECKOUT_SESSION_ID}`
        : `${baseUrl}/dashboard${brandQuery}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing${brandQuery}`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan: plan,
        quantity: quantity.toString(),
        isAgencyPlan: isAgencyPlan.toString(),
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: plan,
          quantity: quantity.toString(),
          isAgencyPlan: isAgencyPlan.toString(),
        }
      },
      allow_promotion_codes: true,
    }

    // Add coupon if provided
    if (coupon) {
      checkoutParams.discounts = [{ coupon }]
    }

    // For agency plans, add agency-specific metadata
    if (isAgencyPlan && user.ownedAgency) {
      checkoutParams.metadata!.agencyId = user.ownedAgency.id
      if (checkoutParams.subscription_data?.metadata) {
        checkoutParams.subscription_data.metadata.agencyId = user.ownedAgency.id
      }
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams)

    // Log the checkout initiation
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CHECKOUT_INITIATED',
        meta: {
          plan,
          quantity,
          sessionId: checkoutSession.id,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        }
      }
    })

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    })

  } catch (error) {
    console.error('[billing/checkout] Error:', error)
    
    // Log error to audit log if we have a session
    const session = await getServerSession(authOptions) as any
    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          actorId: session.user.id as string,
          action: 'SYSTEM_ERROR',
          meta: {
            error: error instanceof Error ? error.message : 'Unknown error',
            context: 'checkout',
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          }
        }
      }).catch(console.error)
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
