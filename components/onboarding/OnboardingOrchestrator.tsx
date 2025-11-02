'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useOnboarding } from './OnboardingProvider'
import { OnboardingModal } from './OnboardingModal'
import { WelcomeStep } from './steps/WelcomeStep'
import { HowItWorksStep } from './steps/HowItWorksStep'
import { CelebrationScreen } from './CelebrationScreen'
import { ProfileCompleteCelebration } from './ProfileCompleteCelebration'
import { DashboardTrainingSteps } from './DashboardTrainingSteps'

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
    hideModal,
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
            <WelcomeStep onNext={nextStep} />
          </OnboardingModal>
        )

      case 2:
        // How It Works
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <HowItWorksStep 
              onNext={() => {
                // Advance to step 3, which returns null
                // This closes the modal but keeps onboarding active
                nextStep()
              }} 
            />
          </OnboardingModal>
        )

      case 3:
        // Step 3: Prompt user to fill profile
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Now, Train Your Echo!</h2>
              <p className="text-gray-300 mb-6">
                Fill out the form below to teach your AI about your business.
                This takes about 5 minutes.
              </p>
              <button
                onClick={() => nextStep()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90"
              >
                Got It!
              </button>
            </div>
          </OnboardingModal>
        )

      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
        // Steps 4-10: User is filling out profile
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
        return (
          <DashboardTrainingSteps
            step={currentStep}
            onNext={nextStep}
            onSkip={() => goToStep(18)}
          />
        )

      case 18:
      default:
        // Final Celebration
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <CelebrationScreen 
              title="You're All Set!"
              message="You've completed the Social Echo training! Time to start creating amazing content."
              achievements={[
                'Generate unlimited posts (within your plan)',
                'Create images in 3 styles',
                'Plan your content for the week',
                'Access all your past posts'
              ]}
              onContinue={completeOnboarding}
              buttonText="Start Creating"
            />
          </OnboardingModal>
        )
    }
  }

  return <>{renderStep()}</>
}
