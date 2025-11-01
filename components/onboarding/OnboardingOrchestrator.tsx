'use client'

import React from 'react'
import { useOnboarding } from './OnboardingProvider'
import { OnboardingModal } from './OnboardingModal'
import { CelebrationScreen } from './CelebrationScreen'
import { WelcomeStep } from './steps/WelcomeStep'
import { HowItWorksStep } from './steps/HowItWorksStep'
import { ProfileCompleteStep } from './steps/ProfileCompleteStep'
import { CompleteStep } from './steps/CompleteStep'

export function OnboardingOrchestrator() {
  const { isActive, currentStep, nextStep, completeOnboarding } = useOnboarding()

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

  // Steps 3-10: Profile setup (handled by train page tooltips - skip for now)
  if (currentStep >= 3 && currentStep <= 10) {
    // Auto-advance to step 11 when profile is saved
    // This will be triggered by the train page
    return null
  }

  // Step 11: Profile Complete Celebration
  if (currentStep === 11) {
    return (
      <OnboardingModal showProgress={false} fullScreen>
        <ProfileCompleteStep onNext={nextStep} />
      </OnboardingModal>
    )
  }

  // Steps 12-17: Dashboard features (will implement later)
  if (currentStep >= 12 && currentStep <= 17) {
    // For now, auto-advance to completion
    return null
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
