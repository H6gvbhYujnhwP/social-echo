'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, Hash, MessageSquare, Award, Info } from 'lucide-react'
import { analyzeFeedback, shouldAutoUpdateProfile, type LearningInsights } from '../lib/learning-engine'
import { getProfile, setProfile, type UserProfile } from '../lib/localstore'
import { Button } from './ui/Button'

export function LearningProgress() {
  const [insights, setInsights] = useState<LearningInsights | null>(null)
  const [profile, setProfileState] = useState<UserProfile | null>(null)
  const [showAutoUpdateNotice, setShowAutoUpdateNotice] = useState(false)
  const [autoUpdateReason, setAutoUpdateReason] = useState('')

  useEffect(() => {
    const currentProfile = getProfile()
    if (!currentProfile) return

    setProfileState(currentProfile)
    const learningInsights = analyzeFeedback(currentProfile)
    setInsights(learningInsights)

    // Check if profile should be auto-updated
    const autoUpdate = shouldAutoUpdateProfile(learningInsights)
    if (autoUpdate.shouldUpdate) {
      setShowAutoUpdateNotice(true)
      setAutoUpdateReason(autoUpdate.reason)
    }
  }, [])

  const handleApplyAutoUpdate = () => {
    if (!profile || !insights) return

    const autoUpdate = shouldAutoUpdateProfile(insights)
    if (autoUpdate.shouldUpdate) {
      const updatedProfile = { ...profile, ...autoUpdate.updates }
      setProfile(updatedProfile)
      setProfileState(updatedProfile)
      setShowAutoUpdateNotice(false)
      
      // Re-analyze with updated profile
      const newInsights = analyzeFeedback(updatedProfile)
      setInsights(newInsights)
    }
  }

  const handleDismissAutoUpdate = () => {
    setShowAutoUpdateNotice(false)
  }

  if (!insights || !profile) {
    return null
  }

  const getLearningStageColor = (stage: LearningInsights['learningStage']) => {
    switch (stage) {
      case 'cold-start':
        return 'text-gray-600 bg-gray-100'
      case 'learning':
        return 'text-blue-600 bg-blue-100'
      case 'confident':
        return 'text-green-600 bg-green-100'
    }
  }

  const getLearningStageLabel = (stage: LearningInsights['learningStage']) => {
    switch (stage) {
      case 'cold-start':
        return 'Getting Started'
      case 'learning':
        return 'Learning Your Style'
      case 'confident':
        return 'Confident'
    }
  }

  return (
    <div className="space-y-6">
      {/* Auto-Update Notice */}
      {showAutoUpdateNotice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                SOCIAL ECHO has learned your preferences!
              </h4>
              <p className="text-sm text-gray-700 mb-3">{autoUpdateReason}</p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleApplyAutoUpdate}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Apply Update
                </Button>
                <Button
                  onClick={handleDismissAutoUpdate}
                  variant="outline"
                  size="sm"
                >
                  Keep Current
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Learning Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
              <p className="text-sm text-gray-600">
                SOCIAL ECHO is learning from your feedback
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLearningStageColor(insights.learningStage)}`}>
            {getLearningStageLabel(insights.learningStage)}
          </div>
        </div>

        {/* Feedback Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Total Feedback</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{insights.totalFeedback}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Confidence</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {Math.round(insights.tonePreference.confidence * 100)}%
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Hashtags</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              ~{insights.hashtagPreference.preferredCount}
            </p>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-4">
          {/* Tone Preference */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Tone Preference</h4>
                <p className="text-sm text-gray-700">
                  {insights.tonePreference.reason}
                </p>
                {insights.tonePreference.suggested && (
                  <p className="text-sm text-purple-700 font-medium mt-2">
                    Suggestion: Try "{insights.tonePreference.suggested}" tone
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Post Type Performance */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-3">Post Type Performance</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(insights.postTypePerformance).map(([type, perf]) => {
                    const total = perf.upvotes + perf.downvotes
                    if (total === 0) return null
                    
                    return (
                      <div key={type} className="flex items-center justify-between p-2 bg-white rounded-md">
                        <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                        <span className={`text-sm font-bold ${perf.score > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {perf.upvotes}↑ {perf.downvotes}↓
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Learning Tip */}
          {insights.learningStage === 'cold-start' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Keep Providing Feedback!</h4>
                  <p className="text-sm text-blue-700">
                    Give feedback on at least 5 posts to help SOCIAL ECHO learn your preferences and improve content quality.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
