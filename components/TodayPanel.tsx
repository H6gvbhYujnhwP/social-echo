'use client'

import React, { useState } from 'react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Copyable } from './Copyable'
import { UserProfile } from '@/lib/localstore'
import { TextGenerationResponse } from '@/lib/contract'

interface TodayPanelProps {
  profile: UserProfile
  twist?: string
  onFineTuneClick: () => void
}

export function TodayPanel({ profile, twist, onFineTuneClick }: TodayPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<TextGenerationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateText = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const requestData = {
        business_name: profile.business_name,
        industry: profile.industry,
        tone: profile.tone,
        products_services: profile.products_services,
        target_audience: profile.target_audience,
        keywords: profile.keywords.join(', ') + (twist ? `, ${twist}` : ''),
        rotation: profile.rotation,
      }

      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      setGeneratedContent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Today's Text</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGenerateText}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Creating today\'s draft...' : 'Create today\'s draft'}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateText}
              className="mt-2"
            >
              Try again
            </Button>
          </div>
        )}

        {generatedContent && (
          <div className="space-y-6">
            {/* Headlines */}
            <div>
              <h3 className="font-semibold mb-3">Headline Options</h3>
              <div className="space-y-2">
                {generatedContent.headline_options.map((headline, index) => (
                  <Copyable key={index} text={headline} className="block">
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <p className="font-medium">{headline}</p>
                    </div>
                  </Copyable>
                ))}
              </div>
            </div>

            {/* Post Text */}
            <div>
              <h3 className="font-semibold mb-3">Post Draft</h3>
              <Copyable text={generatedContent.post_text}>
                <div className="p-4 bg-gray-50 rounded-md border min-h-[200px]">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {generatedContent.post_text}
                  </p>
                </div>
              </Copyable>
            </div>

            {/* Hashtags */}
            <div>
              <h3 className="font-semibold mb-3">Hashtags</h3>
              <Copyable text={generatedContent.hashtags.join(' ')}>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="secondary">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Copyable>
            </div>

            {/* Best Time */}
            <div>
              <h3 className="font-semibold mb-3">Best Time (UK)</h3>
              <Badge variant="success" className="text-lg px-4 py-2">
                {generatedContent.best_time_uk}
              </Badge>
            </div>

            {/* Visual Concept */}
            <div>
              <h3 className="font-semibold mb-3">Visual Concept</h3>
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-gray-700">{generatedContent.visual_prompt}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={onFineTuneClick}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Not quite right? Adjust inputs
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
