export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  getAgencyForUser, 
  isAgencyAdmin, 
  updateStripeQuantity,
  createAuditLog
} from '@/lib/agency-helpers'

/**
 * POST /api/agency/clients/[id]/pause
 * 
 * Pause a client (removes from billing)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    
    // Check role
    if (!isAgencyAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Agency admin role required.' },
        { status: 403 }
      )
    }

    // Get agency
    const agency = await getAgencyForUser(user.id)
    
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }

    const clientId = params.id

    // Get client and verify they belong to this agency
    const client = await prisma.user.findFirst({
      where: {
        id: clientId,
        agencyId: agency.id,
        role: 'CUSTOMER'
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or does not belong to your agency' },
        { status: 404 }
      )
    }

    if (client.isSuspended) {
      return NextResponse.json(
        { error: 'Client is already paused' },
        { status: 400 }
      )
    }

    // Pause client
    await prisma.user.update({
      where: { id: clientId },
      data: { isSuspended: true }
    })

    // Update agency client count
    const newClientCount = Math.max(0, agency.activeClientCount - 1)
    await prisma.agency.update({
      where: { id: agency.id },
      data: { activeClientCount: newClientCount }
    })

    // Update Stripe subscription quantity
    if (agency.stripeSubscriptionId) {
      try {
        await updateStripeQuantity(agency.stripeSubscriptionId, newClientCount)
      } catch (error) {
        console.error('[agency/clients/pause] Failed to update Stripe quantity:', error)
      }
    }

    // Create audit log
    await createAuditLog({
      actorId: user.id,
      action: 'CLIENT_PAUSED',
      targetId: clientId,
      meta: {
        agencyId: agency.id,
        clientEmail: client.email,
        newClientCount
      }
    })

    return NextResponse.json({
      status: 'paused',
      newQuantity: newClientCount,
      message: 'Client paused successfully'
    })
  } catch (error: any) {
    console.error('[api/agency/clients/pause] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
