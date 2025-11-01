'use client'

import { SessionProvider } from 'next-auth/react'
import { OnboardingProvider } from './onboarding/OnboardingProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OnboardingProvider>
        {children}
      </OnboardingProvider>
    </SessionProvider>
  )
}
