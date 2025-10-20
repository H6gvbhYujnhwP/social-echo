/**
 * Admin AI Configuration History API
 * 
 * GET /api/admin/ai-config/history - Get configuration change history
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, unauthorized, forbidden } from '@/lib/rbac'

/**
 * GET /api/admin/ai-config/history
 * Get configuration change history (ADMIN or MASTER_ADMIN)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and role
    const user = await requireAdmin()
    
    // Get query params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Load history from database
    const history = await prisma.adminConfigHistory.findMany({
      where: { key: 'ai_globals' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,

    })
    
    // Get total count
    const total = await prisma.adminConfigHistory.count({
      where: { key: 'ai_globals' }
    })
    
    // Fetch user names for updatedBy IDs
    const userIds = [...new Set(history.map(h => h.updatedBy))]
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    })
    
    const userMap = new Map(users.map(u => [u.id, u]))
    
    // Enrich history with user info
    const enrichedHistory = history.map(h => ({
      id: h.id,
      config: h.json,
      updatedBy: {
        id: h.updatedBy,
        name: userMap.get(h.updatedBy)?.name || 'Unknown',
        email: userMap.get(h.updatedBy)?.email || ''
      },
      reason: h.reason,
      createdAt: h.createdAt
    }))
    
    return Response.json({
      history: enrichedHistory,
      total,
      limit,
      offset
    })
    
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return unauthorized()
    }
    if (error.message.includes('Forbidden')) {
      return forbidden(error.message)
    }
    
    console.error('[admin/ai-config/history] GET error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
