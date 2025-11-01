'use client'

import React from 'react'
import { CelebrationScreen } from '../CelebrationScreen'

interface ProfileCompleteStepProps {
  onNext: () => void
}

export function ProfileCompleteStep({ onNext }: ProfileCompleteStepProps) {
  return (
    <CelebrationScreen
      title="Your Echo is Trained!"
      message="Great job! Your AI assistant now knows everything about your business."
      achievements={[
        'Your business and industry',
        'Your unique voice and tone',
        'Your target audience',
        'What makes you special',
      ]}
      onContinue={onNext}
      buttonText="Generate My First Post →"
    />
  )
}
