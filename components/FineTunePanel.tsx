'use client'

import React, { useState } from 'react'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { UserProfile, setProfile } from '@/lib/localstore'

interface FineTunePanelProps {
  profile: UserProfile
  onProfileUpdate: (profile: UserProfile) => void
  onRegenerate: (twist: string) => void
}

export function FineTunePanel({ profile, onProfileUpdate, onRegenerate }: FineTunePanelProps) {
  const [twist, setTwist] = useState('')
  const [currentRotation, setCurrentRotation] = useState(profile.rotation)

  const handleRotationChange = (newRotation: 'serious' | 'quirky') => {
    setCurrentRotation(newRotation)
    const updatedProfile = { ...profile, rotation: newRotation }
    setProfile(updatedProfile)
    onProfileUpdate(updatedProfile)
    // Automatically regenerate content with new tone
    onRegenerate(twist)
  }

  const handleRegenerate = () => {
    onRegenerate(twist)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fine-tune</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          label="Add a twist for today (optional)"
          value={twist}
          onChange={(e) => setTwist(e.target.value)}
          placeholder="e.g., focus on recent industry news, seasonal trends..."
          rows={3}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tone rotation: Serious / Quirky
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="rotation"
                value="serious"
                checked={currentRotation === 'serious'}
                onChange={(e) => handleRotationChange(e.target.value as 'serious')}
                className="mr-2"
              />
              Serious
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="rotation"
                value="quirky"
                checked={currentRotation === 'quirky'}
                onChange={(e) => handleRotationChange(e.target.value as 'quirky')}
                className="mr-2"
              />
              Quirky
            </label>
          </div>
        </div>

        <Button
          onClick={handleRegenerate}
          variant="outline"
          className="w-full"
        >
          Re-generate text
        </Button>
      </CardContent>
    </Card>
  )
}
