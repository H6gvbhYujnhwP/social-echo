'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useOnboarding } from './OnboardingProvider'
import { OnboardingModal } from './OnboardingModal'
import { WelcomeStep } from './steps/WelcomeStep'
import { HowItWorksStep } from './steps/HowItWorksStep'
import { CelebrationScreen } from './CelebrationScreen'
import { ProfileCompleteCelebration } from './ProfileCompleteCelebration'
import { ProgressIndicator } from './ProgressIndicator'

/**
 * Simplified Onboarding Orchestrator
 * 
 * Flow:
 * 1-2: Welcome steps (shown on signup)
 * 3-10: SKIPPED (user fills profile without tooltips)
 * 11: Profile complete celebration (triggered by TrainForm save)
 * 12-17: SKIPPED (dashboard features are self-explanatory)
 * 18: Final celebration
 */
export function OnboardingOrchestrator() {
  const {
    isActive,
    currentStep,
    totalSteps,
    completedSteps,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding,
    goToStep,
    setCurrentPage,
  } = useOnboarding()

  const pathname = usePathname()
  const router = useRouter()

  // Update current page in context
  useEffect(() => {
    setCurrentPage(pathname)
  }, [pathname, setCurrentPage])

  // Auto-skip steps 3-10 (profile guidance) and 12-17 (dashboard guidance)
  useEffect(() => {
    if (!isActive) return

    // If on step 3-10, skip to step 11 (wait for profile save)
    if (currentStep >= 3 && currentStep <= 10) {
      // Don't auto-advance - wait for user to save profile
      // TrainForm will trigger step 11 when saved
      return
    }

    // If on step 12-17, skip to step 18 (final celebration)
    if (currentStep >= 12 && currentStep <= 17) {
      setTimeout(() => goToStep(18), 100)
      return
    }
  }, [isActive, currentStep, goToStep])

  if (!isActive) return null

  // Render step based on current step number
  const renderStep = () => {
    switch (currentStep) {
      // PHASE 1: WELCOME (Steps 1-2)
      case 1:
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <WelcomeStep onStart={nextStep} onSkip={skipOnboarding} />
          </OnboardingModal>
        )

      case 2:
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <HowItWorksStep onContinue={() => {
              // Close onboarding modal and let user fill profile
              skipOnboarding()
            }} />
          </OnboardingModal>
        )

      // PHASE 2: PROFILE SETUP (Steps 3-10) - SKIPPED
      // User fills out profile without tooltips
      // TrainForm will trigger step 11 when saved

      // PHASE 3: PROFILE COMPLETE CELEBRATION (Step 11)
      case 11:
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <ProfileCompleteCelebration 
              onContinue={() => {
                // Redirect to dashboard and complete onboarding
                completeOnboarding()
                router.push('/dashboard')
              }} 
            />
          </OnboardingModal>
        )

      // PHASE 4: DASHBOARD TRAINING (Steps 12-17) - SKIPPED
      // Dashboard features are self-explanatory

      // PHASE 5: FINAL CELEBRATION (Step 18)
      case 18:
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <CelebrationScreen onComplete={completeOnboarding} />
          </OnboardingModal>
        )

      default:
        // For any other step, skip to next appropriate step
        if (currentStep < 11) {
          // Skip to step 11 (wait for profile save)
          return null
        } else if (currentStep < 18) {
          // Skip to step 18 (final celebration)
          setTimeout(() => goToStep(18), 100)
          return null
        } else {
          // Complete onboarding
          completeOnboarding()
          return null
        }
    }
  }

  return <>{renderStep()}</>
}
