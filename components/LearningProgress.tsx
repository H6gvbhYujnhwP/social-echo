'use client'

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { motion } from 'framer-motion'

interface FeedbackStats {
  totalFeedback: number
  upvotes: number
  downvotes: number
  byPostType: Record<string, { up: number; down: number }>
  byTone: Record<string, { up: number; down: number }>
}

export interface LearningProgressRef {
  refresh: () => void
}

export const LearningProgress = forwardRef<LearningProgressRef>((props, ref) => {
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  // Expose refresh method to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchStats
  }))

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/feedback', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        // Don't show error for 401 (not logged in) - just show empty state
        if (response.status === 401) {
          console.log('[LearningProgress] Not authenticated, showing empty state')
          setStats({
            totalFeedback: 0,
            upvotes: 0,
            downvotes: 0,
            byPostType: {},
            byTone: {}
          })
          setError(null)
          return
        }
        throw new Error('Failed to fetch learning progress')
      }
      
      const data = await response.json()
      console.log('[LearningProgress] Fetched stats:', data)
      
      // Ensure data has the expected structure
      const validatedStats: FeedbackStats = {
        totalFeedback: data.totalFeedback || 0,
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        byPostType: data.byPostType || {},
        byTone: data.byTone || {}
      }
      
      setStats(validatedStats)
      setError(null)
    } catch (err: any) {
      console.error('[LearningProgress] Error fetching stats:', err)
      // Don't show error - just show empty state gracefully
      setStats({
        totalFeedback: 0,
        upvotes: 0,
        downvotes: 0,
        byPostType: {},
        byTone: {}
      })
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  // Calculate confidence percentage (0-100)
  const calculateConfidence = (total: number): number => {
    if (total === 0) return 0
    // Confidence grows with feedback count, plateaus at 50 items
    return Math.min(100, Math.round((total / 50) * 100))
  }

  // Calculate success rate for a category
  const calculateSuccessRate = (up: number, down: number): number => {
    const total = up + down
    if (total === 0) return 0
    return Math.round((up / total) * 100)
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-white">Learning Progress</h3>
        </div>
        <p className="text-white/60 text-sm">Loading your learning progress...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-white">Learning Progress</h3>
        </div>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const confidence = calculateConfidence(stats.totalFeedback)
  const overallSuccessRate = calculateSuccessRate(stats.upvotes, stats.downvotes)

  // Get top performing post type and tone
  const postTypes = Object.entries(stats.byPostType).map(([type, data]) => ({
    type,
    successRate: calculateSuccessRate(data.up, data.down),
    total: data.up + data.down
  })).sort((a, b) => b.successRate - a.successRate)

  const tones = Object.entries(stats.byTone).map(([tone, data]) => ({
    tone,
    successRate: calculateSuccessRate(data.up, data.down),
    total: data.up + data.down
  })).sort((a, b) => b.successRate - a.successRate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">📊</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-white">Learning Progress</h3>
              {confidence >= 30 && (
                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-medium">
                  🔄 Learning Active
                </span>
              )}
            </div>
            <p className="text-white/60 text-sm">Your AI is getting smarter with every feedback</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/learning-profile"
            className="text-white/60 hover:text-white transition-colors text-sm underline"
            title="View full learning profile"
          >
            View Details
          </a>
          <button
            onClick={fetchStats}
            className="text-white/60 hover:text-white transition-colors text-sm"
            title="Refresh stats"
          >
            🔄
          </button>
        </div>
      </div>

      {/* No feedback yet */}
      {stats.totalFeedback === 0 && (
        <div className="text-center py-8">
          <p className="text-white/80 text-lg mb-2">No feedback yet!</p>
          <p className="text-white/60 text-sm">
            Start giving feedback on your generated posts to help the AI learn your preferences.
          </p>
          <div className="mt-4 text-white/40 text-xs">
            👍 Click "Good" when you love a post<br />
            👎 Click "Needs Work" to help improve future posts
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats.totalFeedback > 0 && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Feedback */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm mb-1">Total Feedback</div>
              <div className="text-3xl font-bold text-white">{stats.totalFeedback}</div>
              <div className="text-white/40 text-xs mt-1">
                {stats.upvotes} 👍 · {stats.downvotes} 👎
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm mb-1">AI Confidence</div>
              <div className="text-3xl font-bold text-white">{confidence}%</div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm mb-1">Success Rate</div>
              <div className="text-3xl font-bold text-white">{overallSuccessRate}%</div>
              <div className="text-white/40 text-xs mt-1">
                Posts you loved
              </div>
            </div>
          </div>

          {/* Encouragement Message */}
          {stats.totalFeedback < 10 && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
              <p className="text-white/90 text-sm">
                💡 <strong>Keep going!</strong> Provide at least 10 pieces of feedback to unlock more detailed insights and better personalization.
              </p>
            </div>
          )}

          {/* Post Type Performance */}
          {postTypes.length > 0 && stats.totalFeedback >= 5 && (
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <span className="mr-2">📝</span>
                Post Type Performance
              </h4>
              <div className="space-y-2">
                {postTypes.map(({ type, successRate, total }) => (
                  <div key={type} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/90 text-sm capitalize">{type}</span>
                      <span className="text-white/60 text-xs">{total} posts</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            successRate >= 70
                              ? 'bg-green-500'
                              : successRate >= 40
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold text-sm w-12 text-right">
                        {successRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tone Performance */}
          {tones.length > 0 && stats.totalFeedback >= 5 && (
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <span className="mr-2">🎭</span>
                Tone Performance
              </h4>
              <div className="space-y-2">
                {tones.map(({ tone, successRate, total }) => (
                  <div key={tone} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/90 text-sm capitalize">{tone}</span>
                      <span className="text-white/60 text-xs">{total} posts</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            successRate >= 70
                              ? 'bg-green-500'
                              : successRate >= 40
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold text-sm w-12 text-right">
                        {successRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Insights */}
          {stats.totalFeedback >= 10 && (
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <span className="mr-2">💡</span>
                AI Insights
              </h4>
              <ul className="text-white/80 text-sm space-y-1">
                {confidence >= 30 && (
                  <li>✨ <strong>Your feedback is now influencing post generation!</strong> The AI learns from your preferences.</li>
                )}
                {tones.length > 0 && tones[0].successRate > 70 && (
                  <li>🎭 You love <strong>{tones[0].tone}</strong> tone posts! I'll use it more often.</li>
                )}
                {postTypes.length > 0 && postTypes[0].successRate > 70 && (
                  <li>📈 <strong className="capitalize">{postTypes[0].type}</strong> posts are your favorite type!</li>
                )}
                {stats.totalFeedback >= 20 && (
                  <li>🎯 With {stats.totalFeedback} pieces of feedback, I'm getting really good at understanding your style!</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
})

LearningProgress.displayName = 'LearningProgress'
