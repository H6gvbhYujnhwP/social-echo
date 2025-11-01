'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useOnboarding } from '../OnboardingProvider'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { skipOnboarding } = useOnboarding()

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] text-center px-4">
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl font-bold text-white mb-6"
      >
        Welcome to{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Social Echo
        </span>
        !
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-gray-300 max-w-2xl mb-4"
      >
        You're about to train your personal AI assistant to create professional LinkedIn posts in your unique voice.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-purple-300 max-w-2xl mb-12"
      >
        This will take about <strong>5 minutes</strong>, and you only need to do it once.
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={onNext}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          Start Training
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={skipOnboarding}
          className="px-8 py-4 bg-white/10 text-white text-lg font-semibold rounded-lg hover:bg-white/20 transition-all"
        >
          Skip for Now
        </button>
      </motion.div>

      {/* Footer Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-gray-500 mt-8"
      >
        You can skip this anytime and come back later
      </motion.p>
    </div>
  )
}
