'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TodayPanel } from '@/components/TodayPanel'
import { ImagePanel } from '@/components/ImagePanel'
import { FineTunePanel } from '@/components/FineTunePanel'
import { UserProfile, getProfile } from '@/lib/localstore'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFineTune, setShowFineTune] = useState(false)
  const [twist, setTwist] = useState('')
  const [visualPrompt, setVisualPrompt] = useState<string>()
  const [regenerateKey, setRegenerateKey] = useState(0)

  useEffect(() => {
    const existingProfile = getProfile()
    if (!existingProfile) {
      router.push('/train')
      return
    }
    setProfile(existingProfile)
    setIsLoading(false)
  }, [router])

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
  }

  const handleRegenerate = (newTwist: string) => {
    setTwist(newTwist)
    setRegenerateKey(prev => prev + 1)
    setShowFineTune(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Today's Pack</h1>
          <p className="text-gray-600 mt-2">
            Generate your daily LinkedIn content for {profile.business_name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Content Generation */}
          <div className="lg:col-span-2 space-y-8">
            <TodayPanel
              key={regenerateKey}
              profile={profile}
              twist={twist}
              onFineTuneClick={() => setShowFineTune(true)}
            />
            
            <ImagePanel
              profile={profile}
              visualPrompt={visualPrompt}
            />
          </div>

          {/* Right Column - Fine-tune Panel */}
          <div className="lg:col-span-1">
            {showFineTune && (
              <div className="mb-4">
                <button
                  onClick={() => setShowFineTune(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Back to content
                </button>
              </div>
            )}
            
            <FineTunePanel
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
              onRegenerate={handleRegenerate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
