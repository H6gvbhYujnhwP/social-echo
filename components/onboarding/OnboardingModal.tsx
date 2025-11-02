'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useOnboarding } from './OnboardingProvider'
import { ProgressIndicator } from './ProgressIndicator'

interface OnboardingModalProps {
  children: React.ReactNode
  showProgress?: boolean
  fullScreen?: boolean
  onClose?: () => void
}

export function OnboardingModal({
  children,
  showProgress = true,
  fullScreen = false,
  onClose,
}: OnboardingModalProps) {
  const { currentStep, totalSteps, skipOnboarding } = useOnboarding()

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      skipOnboarding()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`
            relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 
            rounded-2xl shadow-2xl border border-white/20 overflow-y-auto
            ${fullScreen ? 'w-full h-full m-4' : 'max-w-2xl w-full mx-4 max-h-[90vh]'}
          `}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            aria-label="Close onboarding"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Progress Indicator */}
          {showProgress && (
            <div className="p-6 border-b border-white/10">
              <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
