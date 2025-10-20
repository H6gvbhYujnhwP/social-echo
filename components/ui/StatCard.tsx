import React from 'react'
import { motion } from 'framer-motion'
import { GradientText } from './GradientText'

interface StatCardProps {
  value: string
  title: string
  description: string
  gradient?: 'purple-pink' | 'blue-cyan' | 'green-emerald'
  delay?: number
}

export function StatCard({
  value,
  title,
  description,
  gradient = 'purple-pink',
  delay = 0
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="text-center"
    >
      <div className="text-6xl font-bold mb-4">
        <GradientText gradient={gradient}>
          {value}
        </GradientText>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  )
}
