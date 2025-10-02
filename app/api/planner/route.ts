import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force Node.js runtime
export const runtime = 'nodejs'

const PlannerDaySchema = z.object({
  weekday: z.number().min(0).max(6),
  postType: z.enum(['auto', 'informational', 'advice', 'selling', 'news']),
})

const PlannerUpdateSchema = z.array(PlannerDaySchema)

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
      orderBy: { weekday: 'asc' }
    })
    
    // Ensure all 7 days exist
    const allDays = []
    for (let weekday = 0; weekday < 7; weekday++) {
      const existing = plannerDays.find(d => d.weekday === weekday)
      if (existing) {
        allDays.push({
          weekday: existing.weekday,
          postType: existing.postType
        })
      } else {
        // Create default day
        const newDay = await prisma.plannerDay.create({
          data: {
            userId,
            weekday,
            postType: 'auto'
          }
        })
        allDays.push({
          weekday: newDay.weekday,
          postType: newDay.postType
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
    const body = await request.json()
    const validated = PlannerUpdateSchema.parse(body)
    
    // Update each day
    const updates = validated.map(day =>
      prisma.plannerDay.upsert({
        where: {
          userId_weekday: {
            userId,
            weekday: day.weekday
          }
        },
        update: {
          postType: day.postType
        },
        create: {
          userId,
          weekday: day.weekday,
          postType: day.postType
        }
      })
    )
    
    await prisma.$transaction(updates)
    
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
