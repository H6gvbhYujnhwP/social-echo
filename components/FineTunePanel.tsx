'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Edit3, RefreshCw, Sparkles, FileText } from 'lucide-react'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'
import { Badge } from './ui/Badge'
import { UserProfile, setProfile, getTodayPostType, type PostType } from '../lib/localstore'

interface FineTunePanelProps {
  profile: UserProfile
  onProfileUpdate: (profile: UserProfile) => void
  onRegenerate: (twist: string) => void
  currentPostType?: PostType
  onPostTypeChange?: (postType: PostType) => void
}

export function FineTunePanel({ profile, onProfileUpdate, onRegenerate, currentPostType, onPostTypeChange }: FineTunePanelProps) {
  const [twist, setTwist] = useState('')
  const [currentRotation, setCurrentRotation] = useState(profile.rotation)
  const todayPlan = getTodayPostType()

  const handleRotationChange = (newRotation: 'serious' | 'quirky') => {
    setCurrentRotation(newRotation)
    const updatedProfile = { ...profile, rotation: newRotation }
    setProfile(updatedProfile)
    onProfileUpdate(updatedProfile)
    // Automatically regenerate content with new tone
    onRegenerate(twist)
  }

  const handleRegenerate = () => {
    onRegenerate(twist)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20"
    >
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center">
          <Edit3 className="h-6 w-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Customise Today's Output</h2>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Current Post Type Display */}
        {currentPostType && (
          <div>
            <label className="block text-sm font-medium text-white mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Current Post Type
            </label>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-3">
                <Badge className={`${
                  currentPostType === 'selling' ? 'bg-green-100 text-green-800 border-green-200' :
                  currentPostType === 'informational' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-purple-100 text-purple-800 border-purple-200'
                }`}>
                  {currentPostType.charAt(0).toUpperCase() + currentPostType.slice(1)}
                </Badge>
                {todayPlan && todayPlan.type === currentPostType && (
                  <span className="text-sm text-white/70">
                    (From today's plan)
                  </span>
                )}
              </div>
              {onPostTypeChange && (
                <div className="flex space-x-2">
                  {(['selling', 'informational', 'advice'] as PostType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => onPostTypeChange(type)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                        currentPostType === type
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Add a twist for today (optional)
          </label>
          <Textarea
            value={twist}
            onChange={(e) => setTwist(e.target.value)}
            placeholder="e.g. seasonal news, trending story, new offer"
            rows={3}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-4">
            Tone rotation: Serious / Quirky
          </label>
          <div className="relative bg-gray-100 rounded-full p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleRotationChange('serious')}
                className={`relative px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 ${
                  currentRotation === 'serious'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Serious
              </button>
              <button
                onClick={() => handleRotationChange('quirky')}
                className={`relative px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 ${
                  currentRotation === 'quirky'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Quirky
              </button>
            </div>
          </div>
        </div>

        <Button
          onClick={handleRegenerate}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Re-generate Draft
        </Button>
      </div>
    </motion.div>
  )
}
