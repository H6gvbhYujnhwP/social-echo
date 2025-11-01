'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  labels,
}: ProgressIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full">
      {/* Step Counter */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-300">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-purple-400 font-semibold">
          {Math.round(progress)}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Phase Labels (Optional) */}
      {labels && labels.length > 0 && (
        <div className="flex justify-between mt-2">
          {labels.map((label, index) => (
            <span
              key={index}
              className={`text-xs ${
                index <= Math.floor((currentStep / totalSteps) * labels.length)
                  ? 'text-purple-400'
                  : 'text-gray-500'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
