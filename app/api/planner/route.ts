import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force Node.js runtime
export const runtime = 'nodejs'

const PlannerDaySchema = z.object({
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  // Support both legacy and new post types for backward compatibility
  type: z.enum(['informational', 'advice', 'selling', 'news', 'information_advice', 'random']),
  enabled: z.boolean()
})

const PlannerUpdateSchema = z.array(PlannerDaySchema)

// Default planner schedule (using new v8.8 post types)
const DEFAULT_SCHEDULE = [
  { day: 'mon', type: 'information_advice', enabled: true },
  { day: 'tue', type: 'random', enabled: true },
  { day: 'wed', type: 'information_advice', enabled: true },
  { day: 'thu', type: 'news', enabled: true },
  { day: 'fri', type: 'selling', enabled: true },
  { day: 'sat', type: 'information_advice', enabled: true },
  { day: 'sun', type: 'random', enabled: true }
] as const

// Get planner schedule
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    
    // Get all planner days for user
    const plannerDays = await prisma.plannerDay.findMany({
      where: { userId },
      orderBy: { day: 'asc' }
    })
    
    // Ensure all 7 days exist
    const allDays = []
    const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    
    for (const dayName of dayOrder) {
      const existing = plannerDays.find((d: any) => d.day === dayName)
      if (existing) {
        allDays.push({
          day: existing.day,
          type: existing.type,
          enabled: existing.enabled
        })
      } else {
        // Create default day
        const defaultDay = DEFAULT_SCHEDULE.find((d: any) => d.day === dayName)!
        const newDay = await prisma.plannerDay.create({
          data: {
            userId,
            day: dayName,
            type: defaultDay.type,
            enabled: defaultDay.enabled
          }
        })
        allDays.push({
          day: newDay.day,
          type: newDay.type,
          enabled: newDay.enabled
        })
      }
    }
    
    return NextResponse.json({ days: allDays })
    
  } catch (error: any) {
    console.error('[planner-get] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get planner' },
      { status: 500 }
    )
  }
}

// Update planner schedule
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any).id
    
    // Check access control (trial expiration, suspension, subscription status)
    const { checkUserAccess } = await import('@/lib/access-control')
    const accessCheck = await checkUserAccess(userId)
    
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Access denied',
          message: accessCheck.reason,
          status: accessCheck.subscription?.status
        },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validated = PlannerUpdateSchema.parse(body)
    
    // Update each day
    for (const dayUpdate of validated) {
      await prisma.plannerDay.upsert({
        where: {
          userId_day: {
            userId,
            day: dayUpdate.day
          }
        },
        update: {
          type: dayUpdate.type,
          enabled: dayUpdate.enabled
        },
        create: {
          userId,
          day: dayUpdate.day,
          type: dayUpdate.type,
          enabled: dayUpdate.enabled
        }
      })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('[planner-post] Error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update planner' },
      { status: 500 }
    )
  }
}
