'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit3, X, Sparkles } from 'lucide-react'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'
import { UserProfile, type PostType } from '../lib/localstore'

interface FineTunePanelProps {
  profile: UserProfile
  currentPostType?: PostType
  onProfileUpdate: (profile: UserProfile) => void
  onApply: (options: {
    postType: 'auto' | PostType
    tone: string
    twist: string
    keywords: string
  }) => void
  onClose: () => void
}

export function FineTunePanel({ 
  profile, 
  currentPostType, 
  onProfileUpdate, 
  onApply, 
  onClose 
}: FineTunePanelProps) {
  const [postType, setPostType] = useState<'auto' | PostType>(currentPostType || 'auto')
  const [tone, setTone] = useState(profile.tone)
  const [twist, setTwist] = useState('')
  const [keywords, setKeywords] = useState('')

  const handleApply = () => {
    // Call onApply with all the customization options
    onApply({
      postType,
      tone,
      twist,
      keywords
    })
    // Modal will be closed by parent after successful generation
  }

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-lg z-10">
        <div className="flex items-center">
          <Edit3 className="h-6 w-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Customise Today's Output</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Post Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Post Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setPostType('auto')}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                postType === 'auto'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Auto (Planner)
            </button>
            {(['informational', 'advice', 'selling', 'news'] as PostType[]).map((type) => (
              <button
                key={type}
                onClick={() => setPostType(type)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  postType === type
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tone
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as UserProfile['tone'])}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="authoritative">Authoritative</option>
            <option value="conversational">Conversational</option>
            <option value="inspirational">Inspirational</option>
          </select>
        </div>

        {/* Twist Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Add a twist for today (optional)
          </label>
          <Textarea
            value={twist}
            onChange={(e) => setTwist(e.target.value)}
            placeholder="e.g., mention coffee, add an egg to the post, seasonal news, trending story"
            rows={3}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            Add specific elements, themes, or topics to include in today's post
          </p>
        </div>

        {/* Optional Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Optional extra keywords (optional)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., innovation, growth, digital transformation"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">
            Comma-separated keywords to emphasize in the post
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Apply & Generate
          </Button>
        </div>
      </div>
    </div>
  )
}
