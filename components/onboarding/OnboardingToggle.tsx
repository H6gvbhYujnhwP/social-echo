'use client'

import React from 'react'
import { GraduationCap } from 'lucide-react'
import { useOnboarding } from './OnboardingProvider'

export function OnboardingToggle() {
  const { isActive, toggleOnboarding } = useOnboarding()

  return (
    <button
      onClick={toggleOnboarding}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
        ${isActive 
          ? 'bg-green-500 text-white hover:bg-green-600' 
          : 'bg-purple-600 text-white hover:bg-purple-700'
        }
      `}
      aria-label={isActive ? 'Hide Trainer' : 'Show Trainer'}
    >
      <GraduationCap className="w-5 h-5" />
      <span>{isActive ? 'Hide Trainer' : 'Show Trainer'}</span>
    </button>
  )
}
