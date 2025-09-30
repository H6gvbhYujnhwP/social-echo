'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { TrainForm } from '@/components/TrainForm'
import { UserProfile, getProfile } from '@/lib/localstore'

export default function TrainPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const existingProfile = getProfile()
    setProfile(existingProfile)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Train your ECHO
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              These details shape your daily content. You can change them anytime.
            </p>
          </CardHeader>
          <CardContent>
            <TrainForm initialProfile={profile || undefined} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
