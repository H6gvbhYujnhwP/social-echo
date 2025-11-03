import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deriveLearningSignals } from '@/lib/ai/learning-signals'

// Force Node.js runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/learning-signals
 * 
 * Fetch learning signals for the current user
 * 
 * Response:
 * {
 *   preferredTerms: string[]
 *   avoidedTerms: string[]
 *   preferredTone: string | null
 *   preferredPostTypes: string[]
 *   confidence: number
 *   totalFeedback: number
 *   upvoteRate: number
 *   lastCalculated: string
 *   feedbackSince: string | null
 * }
 */
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
    
    console.log('[learning-signals-api] Fetching signals for user:', userId)
    
    // Derive learning signals
    const signals = await deriveLearningSignals(userId)
    
    console.log('[learning-signals-api] Signals derived:', {
      confidence: signals.confidence,
      totalFeedback: signals.totalFeedback,
      preferredTermsCount: signals.preferredTerms.length,
      avoidedTermsCount: signals.avoidedTerms.length
    })
    
    // Return with cache-control headers to prevent stale data
    return NextResponse.json(signals, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error: any) {
    console.error('[learning-signals-api] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning signals' },
      { status: 500 }
    )
  }
}
