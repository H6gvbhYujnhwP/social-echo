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
 * DELETE /api/agency/clients/[id]
 * 
 * Delete a client (hard delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    
    // Check role - only AGENCY_ADMIN can delete clients
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

    const wasActive = !client.isSuspended

    // Delete client (cascade will handle related records)
    await prisma.user.delete({
      where: { id: clientId }
    })

    // Update agency client count only if client was active
    if (wasActive) {
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
          console.error('[agency/clients/delete] Failed to update Stripe quantity:', error)
        }
      }
    }

    // Create audit log
    await createAuditLog({
      actorId: user.id,
      action: 'CLIENT_DELETED',
      targetId: clientId,
      meta: {
        agencyId: agency.id,
        clientEmail: client.email,
        wasActive
      }
    })

    return NextResponse.json({ ok: true, message: 'Client deleted successfully' })
  } catch (error: any) {
    console.error('[api/agency/clients/delete] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
