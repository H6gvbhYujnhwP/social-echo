import React from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  gradient?: 'purple' | 'blue' | 'pink' | 'green'
  hover?: boolean
}

export function GlassCard({ 
  children, 
  className = '', 
  gradient = 'purple',
  hover = true 
}: GlassCardProps) {
  const gradientClasses = {
    purple: 'bg-gradient-to-br from-purple-600/20 to-purple-800/30',
    blue: 'bg-gradient-to-br from-blue-600/20 to-blue-800/30',
    pink: 'bg-gradient-to-br from-pink-600/20 to-pink-800/30',
    green: 'bg-gradient-to-br from-green-600/20 to-green-800/30'
  }

  const hoverClasses = hover 
    ? 'hover:bg-white/10 hover:border-white/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300' 
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl
        ${gradientClasses[gradient]}
        ${hoverClasses}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
