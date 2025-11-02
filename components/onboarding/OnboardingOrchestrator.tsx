'use client'

import React, { useEffect } from 'react'
import { useOnboarding } from './OnboardingProvider'
import { OnboardingModal } from './OnboardingModal'
import { WelcomeStep } from './steps/WelcomeStep'
import { HowItWorksStep } from './steps/HowItWorksStep'
import { CompleteStep } from './steps/CompleteStep'

export function OnboardingOrchestrator() {
  const { isActive, currentStep, goToStep, nextStep, completeOnboarding } = useOnboarding()

  // Auto-advance through empty steps (3-17) to create smooth flow
  useEffect(() => {
    if (currentStep >= 3 && currentStep <= 17) {
      // Skip directly to completion
      const timer = setTimeout(() => {
        goToStep(18)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentStep, goToStep])

  if (!isActive) return null

  // Step 1: Welcome
  if (currentStep === 1) {
    return (
      <OnboardingModal showProgress={false} fullScreen>
        <WelcomeStep onNext={nextStep} />
      </OnboardingModal>
    )
  }

  // Step 2: How It Works
  if (currentStep === 2) {
    return (
      <OnboardingModal showProgress={false} fullScreen>
        <HowItWorksStep onNext={nextStep} />
      </OnboardingModal>
    )
  }

  // Step 18: Final Completion
  if (currentStep === 18) {
    return (
      <OnboardingModal showProgress={false} fullScreen>
        <CompleteStep onComplete={completeOnboarding} />
      </OnboardingModal>
    )
  }

  return null
}
