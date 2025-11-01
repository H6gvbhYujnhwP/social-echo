'use client'

import React from 'react'
import { CelebrationScreen } from '../CelebrationScreen'

interface CompleteStepProps {
  onComplete: () => void
}

export function CompleteStep({ onComplete }: CompleteStepProps) {
  return (
    <CelebrationScreen
      title="You're All Set!"
      message="You've completed the Social Echo training! Time to start creating amazing content."
      achievements={[
        'Generate unlimited posts (within your plan)',
        'Create images in 3 styles',
        'Plan your content for the week',
        'Access all your past posts',
      ]}
      onContinue={onComplete}
      buttonText="Start Creating"
    />
  )
}
