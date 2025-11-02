'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  completedSteps?: number[]
}

const phases = [
  { name: 'Welcome', steps: [1, 2] },
  { name: 'Profile Setup', steps: [3, 4, 5, 6, 7, 8, 9, 10] },
  { name: 'Profile Complete', steps: [11] },
  { name: 'Dashboard Training', steps: [12, 13, 14, 15, 16, 17] },
  { name: 'Complete', steps: [18] },
]

export function ProgressIndicator({
  currentStep,
  totalSteps,
  completedSteps = [],
}: ProgressIndicatorProps) {
  const currentPhaseIndex = phases.findIndex((phase) =>
    phase.steps.includes(currentStep)
  )

  return (
    <div className="w-full">
      {/* Phase Progress Bar */}
      <div className="flex items-center justify-between mb-6">
        {phases.map((phase, index) => {
          const isActive = index === currentPhaseIndex
          const isCompleted = index < currentPhaseIndex
          const phaseSteps = phase.steps
          const completedInPhase = phaseSteps.filter((s) =>
            completedSteps.includes(s)
          ).length

          return (
            <div key={phase.name} className="flex-1 flex items-center">
              {/* Phase Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isCompleted
                      ? '#10B981'
                      : isActive
                      ? '#A855F7'
                      : '#4B5563',
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center relative"
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  )}

                  {/* Pulsing ring for active phase */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 rounded-full bg-purple-400"
                    />
                  )}
                </motion.div>

                {/* Phase Name */}
                <div
                  className={`mt-2 text-xs font-medium text-center ${
                    isActive
                      ? 'text-purple-400'
                      : isCompleted
                      ? 'text-green-400'
                      : 'text-gray-500'
                  }`}
                >
                  {phase.name}
                </div>

                {/* Mini progress for phase */}
                {phaseSteps.length > 1 && (
                  <div className="mt-1 text-xs text-gray-400">
                    {completedInPhase}/{phaseSteps.length}
                  </div>
                )}
              </div>

              {/* Connecting Line */}
              {index < phases.length - 1 && (
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted ? '#10B981' : '#4B5563',
                  }}
                  className="flex-1 h-1 mx-2"
                  style={{ minWidth: '20px' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Detailed Step Progress */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-purple-400">
            {completedSteps.length}/{totalSteps} steps completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(completedSteps.length / totalSteps) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>

        {/* Step Dots */}
        <div className="flex items-center justify-between mt-3">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const isCompleted = completedSteps.includes(step)
            const isCurrent = step === currentStep

            return (
              <motion.div
                key={step}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isCompleted
                    ? '#10B981'
                    : isCurrent
                    ? '#A855F7'
                    : '#4B5563',
                }}
                className="w-2 h-2 rounded-full"
                title={`Step ${step}${isCompleted ? ' (completed)' : ''}${
                  isCurrent ? ' (current)' : ''
                }`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
