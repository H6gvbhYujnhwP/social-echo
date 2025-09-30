import React from 'react'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  gradient?: 'purple-pink' | 'blue-cyan' | 'green-emerald' | 'purple-blue'
}

export function GradientText({ 
  children, 
  className = '', 
  gradient = 'purple-pink' 
}: GradientTextProps) {
  const gradientClasses = {
    'purple-pink': 'bg-gradient-to-r from-purple-400 to-pink-400',
    'blue-cyan': 'bg-gradient-to-r from-blue-400 to-cyan-400',
    'green-emerald': 'bg-gradient-to-r from-green-400 to-emerald-400',
    'purple-blue': 'bg-gradient-to-r from-purple-400 to-blue-400'
  }

  return (
    <span className={`text-transparent bg-clip-text ${gradientClasses[gradient]} ${className}`}>
      {children}
    </span>
  )
}
