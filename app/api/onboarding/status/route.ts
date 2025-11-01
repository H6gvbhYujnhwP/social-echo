import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      hasCompletedOnboarding: true,
      onboardingStep: true,
      onboardingSkipped: true,
      profile: { select: { id: true } },  // Check if profile exists
      postHistory: { select: { id: true }, take: 1 },  // Check if any posts exist
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const hasProfile = !!user.profile
  const hasPostHistory = (user.postHistory?.length || 0) > 0

  return NextResponse.json({
    hasCompletedOnboarding: user.hasCompletedOnboarding || false,
    onboardingStep: user.onboardingStep || 0,
    onboardingSkipped: user.onboardingSkipped || false,
    hasProfile,
    hasPostHistory,
  })
}
