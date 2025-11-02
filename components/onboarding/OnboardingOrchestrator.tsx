'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useOnboarding } from './OnboardingProvider'
import { OnboardingModal } from './OnboardingModal'
import { WelcomeStep } from './steps/WelcomeStep'
import { HowItWorksStep } from './steps/HowItWorksStep'
import { CelebrationScreen } from './CelebrationScreen'
import { ProfileCompleteCelebration } from './ProfileCompleteCelebration'

/**
 * Simplified V2 Onboarding - Focus on Dashboard Training
 * 
 * Flow:
 * Step 1: Welcome
 * Step 2: How It Works
 * Step 3: Close modal, let user fill profile
 * [User fills profile and clicks Save]
 * Step 11: Profile Complete Celebration → Redirect to Dashboard
 * Step 18: Final Celebration on Dashboard
 */
export function OnboardingOrchestrator() {
  const {
    isActive,
    currentStep,
    nextStep,
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

  if (!isActive) return null

  // Render step based on current step number
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        // Welcome Screen
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <WelcomeStep onStart={nextStep} onSkip={skipOnboarding} />
          </OnboardingModal>
        )

      case 2:
        // How It Works
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <HowItWorksStep 
              onContinue={() => {
                // Move to step 3 which will close the modal
                nextStep()
              }} 
            />
          </OnboardingModal>
        )

      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
        // Steps 3-10: User is filling out profile
        // Don't show any modal - let them work
        // TrainForm will trigger step 11 when they click Save
        return null

      case 11:
        // Profile Complete Celebration
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <ProfileCompleteCelebration 
              onContinue={() => {
                // Complete onboarding and redirect to dashboard
                completeOnboarding()
                router.push('/dashboard')
              }} 
            />
          </OnboardingModal>
        )

      case 12:
      case 13:
      case 14:
      case 15:
      case 16:
      case 17:
        // Steps 12-17: Dashboard training
        // For now, skip to final celebration
        // TODO: Implement dashboard tooltips
        setTimeout(() => goToStep(18), 100)
        return null

      case 18:
      default:
        // Final Celebration
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <CelebrationScreen onComplete={completeOnboarding} />
          </OnboardingModal>
        )
    }
  }

  return <>{renderStep()}</>
}
