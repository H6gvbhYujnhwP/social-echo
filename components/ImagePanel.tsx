'use client'

import React, { useState } from 'react'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { UserProfile } from '@/lib/localstore'

interface ImagePanelProps {
  profile: UserProfile
  visualPrompt?: string
}

const styleOptions = [
  { value: 'meme', label: 'Meme' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'photo-real', label: 'Photo-real' },
]

export function ImagePanel({ profile, visualPrompt }: ImagePanelProps) {
  const [selectedStyle, setSelectedStyle] = useState<'meme' | 'illustration' | 'photo-real'>('illustration')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateImage = async () => {
    if (!visualPrompt) {
      setError('Please generate text content first to get a visual concept')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      const requestData = {
        visual_prompt: visualPrompt,
        industry: profile.industry,
        tone: profile.tone,
        style: selectedStyle,
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()
      setGeneratedImage(data.image_base64)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = generatedImage
    link.download = 'social-echo.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          label="Style"
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value as typeof selectedStyle)}
          options={styleOptions}
        />

        <Button
          onClick={handleGenerateImage}
          disabled={isGenerating || !visualPrompt}
          className="w-full"
        >
          {isGenerating ? 'Generating image...' : 'Generate image'}
        </Button>

        {!visualPrompt && (
          <p className="text-sm text-gray-500">
            Generate text content first to create an image
          </p>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateImage}
              className="mt-2"
            >
              Try again
            </Button>
          </div>
        )}

        {generatedImage && (
          <div className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <img
                src={generatedImage}
                alt="Generated social media image"
                className="w-full h-auto"
              />
            </div>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
            >
              Download
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
