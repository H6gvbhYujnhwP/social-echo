import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { GlassCard } from './GlassCard'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  price: string
  features: string[]
  buttonText: string
  onButtonClick?: () => void
  gradient?: 'purple' | 'blue' | 'pink' | 'green'
  delay?: number
}

export function FeatureCard({
  icon: Icon,
  title,
  price,
  features,
  buttonText,
  onButtonClick,
  gradient = 'purple',
  delay = 0
}: FeatureCardProps) {
  const buttonGradients = {
    purple: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    blue: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
    pink: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700',
    green: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: gradient === 'purple' ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay }}
    >
      <GlassCard gradient={gradient} className="p-8 h-full">
        <div className="flex items-center mb-6">
          <div className={`${buttonGradients[gradient]} p-3 rounded-lg mr-4`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className={`font-semibold ${
              gradient === 'purple' ? 'text-purple-300' : 
              gradient === 'blue' ? 'text-blue-300' : 
              gradient === 'pink' ? 'text-pink-300' : 
              'text-green-300'
            }`}>
              {price}
            </p>
          </div>
        </div>
        
        <ul className="space-y-3 text-gray-300 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                gradient === 'purple' ? 'bg-purple-400' : 
                gradient === 'blue' ? 'bg-blue-400' : 
                gradient === 'pink' ? 'bg-pink-400' : 
                'bg-green-400'
              }`}></div>
              {feature}
            </li>
          ))}
        </ul>
        
        <button
          onClick={onButtonClick}
          className={`w-full ${buttonGradients[gradient]} text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02]`}
        >
          {buttonText}
        </button>
      </GlassCard>
    </motion.div>
  )
}
