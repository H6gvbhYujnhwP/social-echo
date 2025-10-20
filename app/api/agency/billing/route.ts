export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAgencyForUser, isAgencyStaff } from '@/lib/agency-helpers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
})

/**
 * GET /api/agency/billing
 * 
 * Returns billing information for the current user's agency
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id as string

    // Check if user is agency staff
    if (!await isAgencyStaff(userId)) {
      return NextResponse.json({ 
        error: 'Only agency staff can view billing information' 
      }, { status: 403 })
    }

    // Get agency
    const agency = await getAgencyForUser(userId)
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Count active clients
    const activeClientsCount = await prisma.user.count({
      where: {
        agencyId: agency.id,
        role: 'CUSTOMER',
        isSuspended: false
      }
    })

    // Get Stripe subscription info if available
    let nextBillingDate: string | null = null
    let lastInvoiceStatus: string | null = null

    if (agency.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(agency.stripeSubscriptionId) as any
        nextBillingDate = new Date(subscription.current_period_end * 1000).toISOString()

        // Get latest invoice
        if (subscription.latest_invoice) {
          const invoiceId = typeof subscription.latest_invoice === 'string' 
            ? subscription.latest_invoice 
            : subscription.latest_invoice.id
          
          const invoice = await stripe.invoices.retrieve(invoiceId) as any
          lastInvoiceStatus = invoice.status
        }
      } catch (error) {
        console.error('[agency/billing] Error fetching Stripe data:', error)
      }
    }

    return NextResponse.json({
      plan: agency.plan,
      activeClients: activeClientsCount,
      monthlyAmount: activeClientsCount * 39, // £39 per client
      stripeCustomerId: agency.stripeCustomerId,
      stripeSubscriptionId: agency.stripeSubscriptionId,
      nextBillingDate,
      lastInvoiceStatus
    })

  } catch (error) {
    console.error('[agency/billing] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    )
  }
}
