// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/billing/stripe';
import { normalizePlan, priceIdFor, Plan } from '@/lib/billing/plan-map';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body with error handling
    let planKey: string;
    let userId: string | undefined;
    
    try {
      const body = await req.json();
      planKey = body.planKey || body.plan;
      userId = body.userId;
    } catch (parseError) {
      console.error('[checkout] JSON parse error:', parseError);
      return NextResponse.json({ 
        error: 'Invalid request body',
        message: 'Request body must be valid JSON'
      }, { status: 400 });
    }

    // Normalize plan name
    const plan: Plan = normalizePlan(planKey);
    
    if (plan === 'none') {
      console.error('[checkout] Invalid plan:', planKey);
      return NextResponse.json({ 
        error: 'Invalid plan',
        message: 'Please select a valid plan'
      }, { status: 400 });
    }

    // Get price ID for plan
    const priceId = priceIdFor(plan);
    if (!priceId) {
      console.error('[checkout] No price ID for plan:', plan);
      return NextResponse.json({ 
        error: 'Plan not available',
        message: 'This plan is not currently available'
      }, { status: 400 });
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email }, 
      include: { subscription: true }
    });
    
    if (!user) {
      console.error('[checkout] User not found:', session.user.email);
      return NextResponse.json({ 
        error: 'User not found',
        message: 'Please sign up first'
      }, { status: 404 });
    }

    // Get or create Stripe Customer
    let stripeCustomerId = user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      try {
        // Prefer business name for invoices, fallback to personal name
        const displayName = (user.businessName?.trim() || user.name || 'User').trim();
        
        const customer = await stripe.customers.create({ 
          email: user.email,
          name: displayName,
          metadata: {
            userId: user.id,
            businessName: user.businessName || '',
          }
        });
        stripeCustomerId = customer.id;
        
        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            plan: 'none',
            status: 'pending_payment',
            usageLimit: 0,
            stripeCustomerId,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          },
          update: { stripeCustomerId },
        });
        
        console.log('[checkout] Stripe customer created:', stripeCustomerId);
      } catch (customerError: any) {
        console.error('[checkout] Stripe customer creation failed:', customerError);
        return NextResponse.json({ 
          error: 'CUSTOMER_CREATION_FAILED',
          message: 'Failed to create billing account'
        }, { status: 500 });
      }
    }

    // Determine success URL based on plan type
    const isAgencyPlan = plan === 'agency';
    const successUrl = isAgencyPlan 
      ? `${process.env.NEXTAUTH_URL}/agency?welcome=1`
      : `${process.env.NEXTAUTH_URL}/train?welcome=1`;

    // Create Checkout Session with complete configuration for automatic tax
    const checkoutConfig: any = {
      mode: 'subscription',
      customer: stripeCustomerId,
      
      // Required for tax ID collection
      customer_update: {
        address: 'auto', // Save address to customer for tax calculation
        name: 'auto',    // Required for tax_id_collection
      },
      
      // Line items
      line_items: [{ 
        price: priceId, 
        quantity: 1 
      }],
      
      // URLs
      success_url: successUrl,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?billing=cancel`,
      
      // Required for automatic tax
      billing_address_collection: 'required',
      automatic_tax: { enabled: true },
      
      // Optional: Enable tax ID collection for B2B customers
      tax_id_collection: { enabled: true },
      
      // Ensure customer is always created/updated
      customer_creation: stripeCustomerId ? undefined : 'always',
      
      // Metadata for webhook processing
      subscription_data: {
        metadata: { 
          userId: user.id,
          plan: plan,
          priceId: priceId,
        },
        // NO Stripe trial periods - the only trial is the 8-post free trial
        // All paid plans charge immediately
      },
      
      metadata: {
        userId: user.id,
        plan: plan,
        path: 'signup',
      },
    };

    // Create Stripe Checkout Session
    let checkout;
    try {
      checkout = await stripe.checkout.sessions.create(checkoutConfig);
      console.log('[checkout] Session created:', {
        sessionId: checkout.id,
        plan: plan,
        priceId: priceId,
        userId: user.id,
      });
    } catch (stripeError: any) {
      console.error('[checkout] Stripe session creation failed:', {
        code: stripeError.code,
        message: stripeError.message,
        requestId: stripeError.requestId,
        type: stripeError.type,
        statusCode: stripeError.statusCode,
        plan: plan,
        priceId: priceId,
      });
      return NextResponse.json({ 
        error: 'CHECKOUT_FAILED',
        message: stripeError.message || 'Failed to create checkout session'
      }, { status: 500 });
    }

    if (!checkout.url) {
      console.error('[checkout] No checkout URL returned');
      return NextResponse.json({ 
        error: 'CHECKOUT_URL_MISSING',
        message: 'Stripe did not return a checkout URL'
      }, { status: 500 });
    }

    return NextResponse.json({ url: checkout.url });
    
  } catch (error: any) {
    console.error('[checkout] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
}

