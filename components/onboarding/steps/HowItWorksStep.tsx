'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Zap, TrendingUp } from 'lucide-react'

interface HowItWorksStepProps {
  onNext: () => void
}

export function HowItWorksStep({ onNext }: HowItWorksStepProps) {
  const steps = [
    {
      icon: Brain,
      title: 'Train Your Echo',
      description: 'Tell us about your business, tone, and audience',
      time: '5 mins',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Generate Daily Posts',
      description: 'AI creates personalized LinkedIn posts + images',
      time: '30 secs',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      title: 'Post & Grow',
      description: 'Copy, paste, and watch your engagement soar',
      time: '1 click',
      color: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] px-4">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-white mb-4 text-center"
      >
        How Social Echo Works
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-lg text-gray-300 mb-12 text-center max-w-2xl"
      >
        Three simple steps to professional LinkedIn content
      </motion.p>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl w-full">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="relative"
          >
            {/* Step Number */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
              <span className="text-2xl font-bold text-white">{index + 1}</span>
            </div>

            {/* Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all h-full">
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-lg flex items-center justify-center mb-4`}>
                <step.icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>

              {/* Description */}
              <p className="text-gray-300 mb-4">{step.description}</p>

              {/* Time Badge */}
              <div className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
                {step.time}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={onNext}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          Let's Go!
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  )
}
