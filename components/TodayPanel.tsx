'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Copy, RefreshCw, Edit3, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from './ui/Button'
import { Copyable } from './Copyable'
import { Badge } from './ui/Badge'
import { FeedbackButtons } from './FeedbackButtons'
import { UserProfile, getTodayPostType, type PostType } from '../lib/localstore'
import { GeneratedDraft } from '../app/dashboard/page'
import UsageCounter from './UsageCounter'

interface TodayPanelProps {
  profile: UserProfile
  todayDraft: GeneratedDraft | null
  currentPostId: string | null
  postTypeMode: 'auto' | PostType
  isGenerating: boolean
  onGenerate: (options?: { regenerate?: boolean; customPrompt?: string }) => void
  onRegenerate: (customInstructions: string) => void
  onPostTypeChange: (postType: PostType) => void
  userPrompt?: string
  onUserPromptChange?: (value: string) => void
  onFeedbackSubmitted?: () => void
  feedbackResetKey?: number | string
  usage?: any
  customisationsLeft?: number
}

export function TodayPanel({ 
  profile, 
  todayDraft, 
  currentPostId,
  postTypeMode, 
  isGenerating,
  onGenerate,
  onRegenerate,
  onPostTypeChange,
  userPrompt = '',
  onUserPromptChange,
  onFeedbackSubmitted,
  feedbackResetKey,
  usage,
  customisationsLeft = 2
}: TodayPanelProps) {
  const [customPrompt, setCustomPrompt] = useState('')
  const todayPlan = getTodayPostType()

  // Get the effective post type
  const getEffectivePostType = (): PostType => {
    if (postTypeMode === 'auto') {
      return todayPlan?.type || 'informational'
    }
    return postTypeMode
  }

  // Get day name for display
  const getTodayDayName = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
  }

  const handleGenerate = () => {
    onGenerate({ regenerate: false, customPrompt: customPrompt || undefined })
    setCustomPrompt('') // Clear after generating
  }

  const handleRegenerate = () => {
    onGenerate({ regenerate: true, customPrompt: customPrompt || undefined })
    setCustomPrompt('') // Clear after regenerating
  }

  const effectivePostType = getEffectivePostType()

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Today's Content</h2>
              <p className="text-sm text-gray-600">{getTodayDayName()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <UsageCounter usage={usage} />
            <div className="flex items-center space-x-2">
            <Badge className={`${
              effectivePostType === 'selling' ? 'bg-green-100 text-green-800 border-green-200' :
              effectivePostType === 'informational' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              effectivePostType === 'advice' ? 'bg-purple-100 text-purple-800 border-purple-200' :
              'bg-orange-100 text-orange-800 border-orange-200'
            }`}>
              {effectivePostType.charAt(0).toUpperCase() + effectivePostType.slice(1)}
            </Badge>
            {postTypeMode === 'auto' && todayPlan && (
              <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                <CalendarIcon className="h-3 w-3 mr-1" />
                From Planner
              </Badge>
            )}
          </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Post Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Post Type
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onPostTypeChange('auto' as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                postTypeMode === 'auto'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Auto (Planner)
            </button>
            {(['informational', 'advice', 'selling', 'news'] as PostType[]).map((type) => (
              <button
                key={type}
                onClick={() => onPostTypeChange(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  postTypeMode === type
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Field with inline Regenerate button */}
        <section aria-labelledby="custom-instructions" className="w-full">
          <label id="custom-instructions" htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Instructions (Optional)
          </label>
          
          <div className="w-full">
            <textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Add specific instructions for this post... e.g., 'Focus on sustainability', 'Include a customer success story', 'Make it more casual'"
              className="w-full min-h-[120px] rounded-xl border border-gray-300 bg-white/70 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400 resize-none text-gray-900 placeholder-gray-400 dark:bg-gray-900/60"
              disabled={isGenerating}
            />
            <p className="mt-1 text-xs text-gray-500">
              These instructions will be added to the AI prompt for this generation only.
            </p>

            {todayDraft && (
              <div className="mt-3 flex">
                <Button
                  type="button"
                  onClick={() => onRegenerate(customPrompt)}
                  disabled={isGenerating || customisationsLeft === 0}
                  size="sm"
                  variant="outline"
                  className="ml-auto inline-flex items-center justify-center rounded-xl border border-purple-600 px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto w-full"
                  aria-live="polite"
                  title={customisationsLeft === 0 ? "No regenerations left today" : `Updates this draft using your instructions (${customisationsLeft}/2 left)`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Apply & Regenerate ({customisationsLeft}/2 left)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Feedback Buttons - Always show when draft exists, even if postId is missing */}
        {todayDraft && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
            <FeedbackButtons 
              postId={currentPostId || ''} 
              resetKey={feedbackResetKey}
              onFeedbackSubmitted={onFeedbackSubmitted}
            />
          </div>
        )}

        {/* User Brief Input */}
        {!todayDraft && (
          <div className="mb-4">
            <label htmlFor="user-brief" className="block text-sm font-medium text-gray-300 mb-2">
              Brief the AI (optional)
            </label>
            <textarea
              id="user-brief"
              value={userPrompt}
              onChange={(e) => onUserPromptChange?.(e.target.value)}
              placeholder="e.g., 'Talk about our new product launch' or 'Focus on cost savings for SMEs'"
              rows={2}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        )}



        {/* Main Generate Button (always visible) */}
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate New Post
            </>
          )}
        </Button>

        {/* Generated Content Display */}
        {todayDraft && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Headlines */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                Headline Options
              </h3>
              <div className="space-y-3">
                {todayDraft.headline_options.map((headline, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Copyable text={headline} className="block">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200 cursor-pointer group">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 flex-1">{headline}</p>
                          <Copy className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </Copyable>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Post Text */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Copy className="h-5 w-5 text-blue-600 mr-2" />
                Post Draft
              </h3>
              <Copyable text={todayDraft.post_text}>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200/50 min-h-[200px] hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">LinkedIn Post</span>
                    <Copy className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-900">
                    {todayDraft.post_text}
                  </p>
                </div>
              </Copyable>
            </div>

            {/* Hashtags */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hashtags</h3>
              <Copyable text={todayDraft.hashtags.join(' ')}>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Copy all hashtags</span>
                    <Copy className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {todayDraft.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/60 rounded-full text-sm text-purple-700 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Copyable>
            </div>

            {/* Best Time */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Best time to post</p>
                  <p className="text-lg font-semibold text-gray-900">{todayDraft.best_time_uk}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
