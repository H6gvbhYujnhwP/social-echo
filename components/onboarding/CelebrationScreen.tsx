'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface CelebrationScreenProps {
  title: string
  message: string
  achievements?: string[]
  onContinue: () => void
  buttonText?: string
}

export function CelebrationScreen({
  title,
  message,
  achievements = [],
  onContinue,
  buttonText = 'Continue',
}: CelebrationScreenProps) {
  return (
    <div className="text-center">
      {/* Animated Emoji */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8, bounce: 0.5 }}
        className="text-8xl mb-6"
      >
        🎉
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-bold text-white mb-4"
      >
        {title}
      </motion.h2>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-gray-300 mb-8"
      >
        {message}
      </motion.p>

      {/* Achievements */}
      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 rounded-lg p-6 mb-8 text-left max-w-md mx-auto"
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-3 mb-3 last:mb-0"
            >
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-white">{achievement}</span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
      >
        {buttonText}
      </motion.button>
    </div>
  )
}
