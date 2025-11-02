'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, X, Check } from 'lucide-react'

interface SpotlightTooltipProps {
  targetSelector: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  title: string
  content: React.ReactNode
  onNext: () => void
  onBack?: () => void
  onSkip?: () => void
  showSkip?: boolean
  stepNumber?: number
  totalSteps?: number
}

export function SpotlightTooltip({
  targetSelector,
  position = 'bottom',
  title,
  content,
  onNext,
  onBack,
  onSkip,
  showSkip = true,
  stepNumber,
  totalSteps,
}: SpotlightTooltipProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const updatePosition = () => {
      const element = document.querySelector(targetSelector)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)

        // Calculate tooltip position based on target element
        const tooltipOffset = 20
        let top = 0
        let left = 0

        switch (position) {
          case 'top':
            top = rect.top - tooltipOffset
            left = rect.left + rect.width / 2
            break
          case 'bottom':
            top = rect.bottom + tooltipOffset
            left = rect.left + rect.width / 2
            break
          case 'left':
            top = rect.top + rect.height / 2
            left = rect.left - tooltipOffset
            break
          case 'right':
            top = rect.top + rect.height / 2
            left = rect.right + tooltipOffset
            break
        }

        setTooltipPosition({ top, left })
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [targetSelector, position])

  if (!targetRect) return null

  return (
    <AnimatePresence>
      {/* Dark Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/80"
        onClick={onSkip}
      />

      {/* Spotlight Highlight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed z-50 pointer-events-none"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: '0 0 0 4px rgba(168, 85, 247, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.8)',
          borderRadius: '12px',
        }}
      />

      {/* Pulsing Ring */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="fixed z-50 pointer-events-none border-4 border-purple-400 rounded-xl"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
        }}
      />

      {/* Tooltip */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: position === 'top' ? 10 : -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="fixed z-50 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 max-w-md"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform:
            position === 'left' || position === 'right'
              ? 'translateY(-50%)'
              : 'translateX(-50%)',
        }}
      >
        {/* Close Button */}
        {showSkip && (
          <button
            onClick={onSkip}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Skip step"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Step Counter */}
        {stepNumber && totalSteps && (
          <div className="text-xs text-purple-200 mb-2 font-medium">
            Step {stepNumber} of {totalSteps}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>

        {/* Content */}
        <div className="text-white/90 text-sm mb-4 leading-relaxed">{content}</div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <button
            onClick={onNext}
            className="px-6 py-2 rounded-lg bg-white text-purple-600 hover:bg-purple-50 font-bold transition-colors flex items-center gap-2 shadow-lg"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
