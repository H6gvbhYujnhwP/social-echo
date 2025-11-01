'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface OnboardingContextType {
  isActive: boolean
  currentStep: number
  totalSteps: number
  hasCompleted: boolean
  startOnboarding: () => void
  nextStep: () => void
  prevStep: () => void
  skipOnboarding: () => void
  completeOnboarding: () => void
  goToStep: (step: number) => void
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)
  const totalSteps = 18

  // Load onboarding state from API
  useEffect(() => {
    if (!session?.user) return
    
    const loadState = async () => {
      try {
        const res = await fetch('/api/onboarding/status')
        if (res.ok) {
          const data = await res.json()
          
          // Auto-complete onboarding for existing users who have already used the platform
          if (data.hasProfile && data.hasPostHistory && !data.hasCompletedOnboarding) {
            await fetch('/api/onboarding/complete', { method: 'POST' })
            setHasCompleted(true)
            return
          }
          
          setHasCompleted(data.hasCompletedOnboarding)
          
          // Auto-start onboarding for new users (step 0) or resume for in-progress users
          if (!data.hasCompletedOnboarding && !data.onboardingSkipped) {
            const step = data.onboardingStep === 0 ? 1 : data.onboardingStep
            setCurrentStep(step)
            setIsActive(true)
            
            // If brand new user (step 0), initialize to step 1
            if (data.onboardingStep === 0) {
              await fetch('/api/onboarding/start', { method: 'POST' })
            }
          } else {
            setCurrentStep(data.onboardingStep)
          }
        }
      } catch (error) {
        console.error('Failed to load onboarding state:', error)
      }
    }
    
    loadState()
  }, [session])

  const startOnboarding = async () => {
    setIsActive(true)
    setCurrentStep(1)
    await fetch('/api/onboarding/start', { method: 'POST' })
  }

  const nextStep = async () => {
    const newStep = currentStep + 1
    setCurrentStep(newStep)
    await fetch('/api/onboarding/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: newStep })
    })
  }

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1))
  }

  const skipOnboarding = async () => {
    setIsActive(false)
    await fetch('/api/onboarding/skip', { method: 'POST' })
  }

  const completeOnboarding = async () => {
    setIsActive(false)
    setHasCompleted(true)
    await fetch('/api/onboarding/complete', { method: 'POST' })
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps,
        hasCompleted,
        startOnboarding,
        nextStep,
        prevStep,
        skipOnboarding,
        completeOnboarding,
        goToStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}
