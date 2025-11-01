import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const { step } = await request.json()

  await prisma.user.update({
    where: { id: userId },
    data: { onboardingStep: step },
  })

  return NextResponse.json({ success: true })
}
