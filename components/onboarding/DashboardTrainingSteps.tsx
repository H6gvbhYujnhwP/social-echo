'use client'

import React from 'react'
import { SpotlightTooltip } from './SpotlightTooltip'
import { OnboardingModal } from './OnboardingModal'
import { Sparkles, RefreshCw, ThumbsUp, ThumbsDown, Image as ImageIcon, Palette } from 'lucide-react'

interface DashboardTrainingStepsProps {
  step: number
  onNext: () => void
  onSkip: () => void
}

export function DashboardTrainingSteps({ step, onNext, onSkip }: DashboardTrainingStepsProps) {
  switch (step) {
    case 12:
      // Dashboard Introduction
      return (
        <SpotlightTooltip
          targetSelector="button:has(> svg.lucide-sparkles)"
          title="Generate Your First Post!"
          content={
            <p className="text-gray-300">
              This is where the magic happens! Click this button to generate a LinkedIn post based on your training. Your AI will create content that matches your voice and industry.
            </p>
          }
          position="bottom"
          onNext={onNext}
          onSkip={onSkip}
        />
      )

    case 13:
      // Post Types
      return (
        <SpotlightTooltip
          targetSelector="div:has(> button:contains('Auto (Planner)'))"
          title="Choose Your Post Type"
          content={
            <p className="text-gray-300">
              You can let the AI choose the best post type for today (Auto), or manually select from different types like Information & Advice, Personal Stories, or Industry Insights.
            </p>
          }
          position="top"
          onNext={onNext}
          onSkip={onSkip}
        />
      )

    case 14:
      // Customize Post
      return (
        <OnboardingModal showProgress={false} fullScreen={false}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center mx-auto">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Customize Your Post</h2>
            <p className="text-gray-300 max-w-md">
              After generating a post, you'll see a text box where you can provide instructions to refine it. 
              For example: "Make it more casual" or "Add a call-to-action at the end".
            </p>
            <p className="text-gray-400 text-sm">
              You get 2 customizations per post to perfect your content!
            </p>
            <button
              onClick={onNext}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90"
            >
              Got It!
            </button>
          </div>
        </OnboardingModal>
      )

    case 15:
      // Feedback System
      return (
        <OnboardingModal showProgress={false} fullScreen={false}>
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-white" />
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <ThumbsDown className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">Train Your Echo</h2>
            <p className="text-gray-300 max-w-md">
              After each post, give it a thumbs up 👍 or thumbs down 👎. 
            </p>
            <p className="text-gray-300 max-w-md">
              If you give a thumbs down, you'll be asked what was wrong. This feedback helps your Echo learn and improve over time!
            </p>
            <button
              onClick={onNext}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90"
            >
              Continue
            </button>
          </div>
        </OnboardingModal>
      )

    case 16:
      // Image Generation
      return (
        <OnboardingModal showProgress={false} fullScreen={false}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-orange-600 flex items-center justify-center mx-auto">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Generate Images</h2>
            <p className="text-gray-300 max-w-md">
              Scroll down after generating a post to find the Image Generator. 
              Your AI will suggest a visual based on your post content.
            </p>
            <p className="text-gray-300 max-w-md">
              You can choose from 3 different styles:
            </p>
            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto text-sm">
              <div className="bg-white/10 rounded-lg p-2">
                <p className="font-semibold text-white">📸 Photo-Real</p>
                <p className="text-gray-400 text-xs">Professional photos</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <p className="font-semibold text-white">😄 Meme</p>
                <p className="text-gray-400 text-xs">Fun & engaging</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <p className="font-semibold text-white">🎨 Minimalist</p>
                <p className="text-gray-400 text-xs">Clean & simple</p>
              </div>
            </div>
            <button
              onClick={onNext}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90"
            >
              Awesome!
            </button>
          </div>
        </OnboardingModal>
      )

    case 17:
      // Learning Progress
      return (
        <OnboardingModal showProgress={false} fullScreen={false}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Your Echo Learns With You</h2>
            <p className="text-gray-300 max-w-md">
              Every time you give feedback, customize a post, or generate new content, your Echo gets smarter.
            </p>
            <p className="text-gray-300 max-w-md">
              You'll see a "Learning Progress" panel on the right showing how much your Echo has learned about your preferences.
            </p>
            <p className="text-gray-400 text-sm">
              The more you use it, the better it gets!
            </p>
            <button
              onClick={onNext}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90"
            >
              Let's Start Creating!
            </button>
          </div>
        </OnboardingModal>
      )

    default:
      return null
  }
}
