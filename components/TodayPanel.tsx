'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Sparkles, Copy, Clock, Eye, RefreshCw, Settings } from 'lucide-react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Copyable } from './Copyable'
import { UserProfile, getTodayPostType, type PostType } from '../lib/localstore'
import { TextGenerationResponse } from '../lib/contract'

interface TodayPanelProps {
  profile: UserProfile
  twist?: string
  onFineTuneClick: () => void
  onVisualPromptChange?: (visualPrompt: string) => void
  regenerateTrigger?: number
}

type PostTypeMode = 'auto' | PostType

export function TodayPanel({ profile, twist, onFineTuneClick, onVisualPromptChange, regenerateTrigger }: TodayPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<TextGenerationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastRotation, setLastRotation] = useState(profile.rotation)
  const [postTypeMode, setPostTypeMode] = useState<PostTypeMode>('auto')
  const [todayPlan, setTodayPlan] = useState<{ type: PostType; enabled: boolean } | null>(null)

  // Get today's plan from planner
  useEffect(() => {
    const plan = getTodayPostType()
    setTodayPlan(plan)
  }, [])

  // Get the effective post type (from planner or manual override)
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

  const handleGenerateText = useCallback(async () => {
    // Check if today is disabled in planner
    if (postTypeMode === 'auto' && todayPlan && !todayPlan.enabled) {
      setError('No post scheduled for today. Switch to manual mode to generate anyway.')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      const requestData = {
        business_name: profile.business_name,
        industry: profile.industry,
        tone: profile.tone,
        products_services: profile.products_services,
        target_audience: profile.target_audience,
        keywords: [
          ...profile.keywords,
          ...(twist ? [twist] : [])
        ].filter(Boolean).join(', '),
        rotation: profile.rotation,
        post_type: getEffectivePostType(),
        platform: 'linkedin' as const,
      }

      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      setGeneratedContent(data)
      
      // Pass visual prompt to parent component for image generation
      if (data.visual_prompt && onVisualPromptChange) {
        onVisualPromptChange(data.visual_prompt)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }, [profile, twist, postTypeMode, todayPlan, getEffectivePostType])

  // Auto-regenerate when rotation changes and we have existing content
  useEffect(() => {
    if (generatedContent && lastRotation !== profile.rotation) {
      setLastRotation(profile.rotation)
      handleGenerateText()
    }
  }, [profile.rotation, generatedContent, lastRotation, handleGenerateText])

  // Manual regeneration trigger (when user clicks "Re-generate Draft")
  useEffect(() => {
    if (regenerateTrigger && regenerateTrigger > 0) {
      handleGenerateText()
    }
  }, [regenerateTrigger, handleGenerateText])

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center">
          <Calendar className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Generate Today's Text</h2>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Post Type Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Content Type</h3>
            <a 
              href="/planner" 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Settings className="h-4 w-4 mr-1" />
              Edit Planner
            </a>
          </div>
          
          {/* Segmented Control */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['auto', 'informational', 'advice', 'selling'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPostTypeMode(mode)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  postTypeMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode === 'auto' ? 'Auto' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-center">
            {postTypeMode === 'auto' ? (
              todayPlan ? (
                todayPlan.enabled ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Today's plan: {todayPlan.type.charAt(0).toUpperCase() + todayPlan.type.slice(1)} ({getTodayDayName()})
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    No post scheduled today
                  </Badge>
                )
              ) : (
                <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                  Loading planner...
                </Badge>
              )
            ) : (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Manual override: {postTypeMode.charAt(0).toUpperCase() + postTypeMode.slice(1)}
              </Badge>
            )}
          </div>
        </div>

        <Button
          onClick={handleGenerateText}
          disabled={isGenerating || (postTypeMode === 'auto' && todayPlan && !todayPlan.enabled) || false}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Creating today's draft...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Create today's draft
            </>
          )}
        </Button>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-600 mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateText}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Try again
            </Button>
          </motion.div>
        )}

        {generatedContent && (
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
                {generatedContent.headline_options.map((headline, index) => (
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
              <Copyable text={generatedContent.post_text}>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200/50 min-h-[200px] hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">LinkedIn Post</span>
                    <Copy className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-900">
                    {generatedContent.post_text}
                  </p>
                </div>
              </Copyable>
            </div>

            {/* Hashtags */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hashtags</h3>
              <Copyable text={generatedContent.hashtags.join(' ')}>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Copy all hashtags</span>
                    <Copy className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags.map((hashtag, index) => (
                      <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-200">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Copyable>
            </div>

            {/* Best Time & Visual Concept */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  Best Time (UK)
                </h3>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                  <Badge className="bg-green-100 text-green-800 border-green-200 text-lg px-4 py-2">
                    {generatedContent.best_time_uk}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-5 w-5 text-blue-600 mr-2" />
                  Visual Concept
                </h3>
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200/50">
                  <p className="text-gray-700 italic">{generatedContent.visual_prompt}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200/50">
              <button
                onClick={onFineTuneClick}
                className="text-blue-600 hover:text-blue-800 font-medium underline transition-colors"
              >
                Not quite right? Adjust inputs
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
