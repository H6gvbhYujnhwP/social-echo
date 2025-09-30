'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Image, Download, RefreshCw, Palette } from 'lucide-react'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
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
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center">
          <Image className="h-6 w-6 text-green-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Create Image</h2>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Style
          </label>
          <Select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value as typeof selectedStyle)}
            options={styleOptions}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <Button
          onClick={handleGenerateImage}
          disabled={isGenerating || !visualPrompt}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Generating image...
            </>
          ) : (
            <>
              <Image className="mr-2 h-5 w-5" />
              Generate Image
            </>
          )}
        </Button>

        {!visualPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <p className="text-blue-700 text-center">
              Generate text content first to create an image
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-600 mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateImage}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Try again
            </Button>
          </motion.div>
        )}

        {generatedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={generatedImage}
                alt="Generated social media image"
                className="w-full h-auto"
              />
            </div>
            <Button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 rounded-xl font-semibold"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
