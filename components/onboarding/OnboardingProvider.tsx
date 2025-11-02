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
  toggleOnboarding: () => void
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
          // This ensures existing users don't see the trainer by default
          if (data.hasProfile && data.hasPostHistory && !data.hasCompletedOnboarding) {
            await fetch('/api/onboarding/complete', { method: 'POST' })
            setHasCompleted(true)
            setIsActive(false) // Ensure it's not active for existing users
            return
          }
          
          setHasCompleted(data.hasCompletedOnboarding)
          
          // Only auto-start for brand new users (no profile, no posts, not completed, not skipped)
          const isNewUser = !data.hasProfile && !data.hasPostHistory && !data.hasCompletedOnboarding && !data.onboardingSkipped
          
          if (isNewUser) {
            // Brand new user - auto-start onboarding
            const step = data.onboardingStep === 0 ? 1 : data.onboardingStep
            setCurrentStep(step)
            setIsActive(true)
            
            // If brand new user (step 0), initialize to step 1
            if (data.onboardingStep === 0) {
              await fetch('/api/onboarding/start', { method: 'POST' })
            }
          } else {
            // Existing user or user who skipped - don't auto-start
            setCurrentStep(data.onboardingStep)
            setIsActive(false)
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

  const toggleOnboarding = () => {
    if (isActive) {
      // Turn off
      setIsActive(false)
    } else {
      // Turn on - restart from step 1
      setIsActive(true)
      setCurrentStep(1)
      startOnboarding()
    }
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
        toggleOnboarding,
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
