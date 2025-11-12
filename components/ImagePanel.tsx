'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Image, Download, RefreshCw, Palette, Info, Clock } from 'lucide-react'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
import { getAvailableImageTypes } from '../lib/ai/image-service'

interface ImagePanelProps {
  visualPrompt?: string
  industry: string
  tone: string
  postType?: string
  postHeadline?: string
  postText?: string
  autoSelectedType?: string
  savedImageUrl?: string | null
  savedImageStyle?: string | null
  onImageGenerated?: (imageUrl: string, imageStyle: string) => void
  onHistoryClick?: () => void
}

export function ImagePanel({ 
  visualPrompt, 
  industry, 
  tone,
  postType,
  postHeadline,
  postText,
  autoSelectedType,
  savedImageUrl,
  savedImageStyle,
  onImageGenerated,
  onHistoryClick
}: ImagePanelProps) {
  const imageTypes = getAvailableImageTypes()
  
  // Use auto-selected type as default, or fallback to 'illustration'
  const [selectedStyle, setSelectedStyle] = useState<string>(autoSelectedType || 'illustration')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(savedImageUrl || null)
  const [error, setError] = useState<string | null>(null)
  const [usedImageType, setUsedImageType] = useState<string | null>(savedImageStyle || null)
  const [allowText, setAllowText] = useState(false)
  const [userHasSelectedStyle, setUserHasSelectedStyle] = useState(false)
  const [customDescription, setCustomDescription] = useState('')
  const [applyLogo, setApplyLogo] = useState(true) // Apply logo by default

  // Update selected style when auto-selected type changes, but only if user hasn't manually selected a style
  React.useEffect(() => {
    if (autoSelectedType && !userHasSelectedStyle) {
      setSelectedStyle(autoSelectedType)
      console.log('[ImagePanel] Auto-selected image type:', autoSelectedType)
    }
  }, [autoSelectedType, userHasSelectedStyle])

  // Restore saved image when props change (e.g., when loading a saved post)
  React.useEffect(() => {
    if (savedImageUrl) {
      setGeneratedImage(savedImageUrl)
      setUsedImageType(savedImageStyle || null)
      console.log('[ImagePanel] Restored saved image, style:', savedImageStyle)
    }
  }, [savedImageUrl, savedImageStyle])

  // Debug: Log visual prompt changes
  React.useEffect(() => {
    console.log('[ImagePanel] Visual prompt:', visualPrompt)
    console.log('[ImagePanel] Post type:', postType)
    console.log('[ImagePanel] Post headline:', postHeadline?.substring(0, 50))
  }, [visualPrompt, postType, postHeadline])

  const handleGenerateImage = async () => {
    console.log('[ImagePanel] Generate Image clicked!')
    console.log('[ImagePanel] Selected style:', selectedStyle)
    console.log('[ImagePanel] Visual prompt:', visualPrompt)
    
    if (!visualPrompt) {
      setError('Please generate text content first to get a visual concept')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      // Use custom description if provided, otherwise use AI-generated prompt
      const finalPrompt = customDescription.trim() || visualPrompt
      
      const requestData = {
        visual_prompt: finalPrompt,
        industry: industry,
        tone: tone,
        style: selectedStyle,
        // Include post content for context-aware generation
        post_type: postType,
        post_headline: postHeadline,
        post_text: postText,
        // Text inclusion option
        allow_text: allowText,
        // Custom description flag
        is_custom_description: customDescription.trim().length > 0,
        // Logo overlay option
        apply_logo: applyLogo,
      }

      console.log('[ImagePanel] Sending request:', {
        ...requestData,
        post_text: requestData.post_text?.substring(0, 100) + '...'
      })

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      const data = await response.json()
      setGeneratedImage(data.image_base64)
      setUsedImageType(data.image_type || selectedStyle)
      console.log('[ImagePanel] Image generated successfully, type:', data.image_type)
      
      // Call callback to notify parent component
      if (onImageGenerated && data.image_base64) {
        onImageGenerated(data.image_base64, data.image_type || selectedStyle)
      }
    } catch (err) {
      console.error('[ImagePanel] Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return

    // Detect if user is on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (isMobile) {
      // For mobile: Try direct download first, fallback to showing image inline
      try {
        // Create a temporary link element
        const link = document.createElement('a')
        link.href = generatedImage
        link.download = `social-echo-${usedImageType || 'image'}-${Date.now()}.png`
        
        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Show success message
        alert('Image ready to save! Long-press the image above and select "Save Image" or "Download Image"')
      } catch (error) {
        console.error('Mobile download failed:', error)
        // Fallback: Show instructions
        alert('To save this image: Long-press the image above and select "Save Image" or "Download Image" from the menu.')
      }
    } else {
      // For desktop: Try to download directly
      try {
        // Convert base64 to blob for better compatibility
        const base64Data = generatedImage.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'image/png' })
        
        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `social-echo-${usedImageType || 'image'}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100)
      } catch (error) {
        console.error('Download failed:', error)
        // Fallback: open in new tab
        window.open(generatedImage, '_blank')
      }
    }
  }

  // Find the selected image type info
  const selectedTypeInfo = imageTypes.find(t => t.value === selectedStyle)

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20">
      <div className="p-4 sm:p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create Image</h2>
          </div>
          <div className="flex items-center gap-2">
            {onHistoryClick && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2 text-gray-700 border-gray-400 hover:bg-gray-100 hover:border-gray-500"
                onClick={onHistoryClick}
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            )}
            {autoSelectedType && (
              <div className="flex items-center text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Info className="h-3 w-3 mr-1" />
                Auto-selected
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Visual Style
          </label>
          <Select
            value={selectedStyle}
            onChange={(e) => {
              setSelectedStyle(e.target.value)
              setUserHasSelectedStyle(true)
            }}
            options={imageTypes.map(t => ({ value: t.value, label: t.label }))}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {selectedTypeInfo && (
            <p className="mt-2 text-xs text-gray-500 italic">
              {selectedTypeInfo.description}
            </p>
          )}
        </div>

        {/* Text Inclusion Toggle - Moved after Visual Style */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-1">
            <label htmlFor="allow-text" className="text-sm font-medium text-gray-700 cursor-pointer">
              Include text in image
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Allow short English text (≤5 words) in the generated image
            </p>
          </div>
          <input
            id="allow-text"
            type="checkbox"
            checked={allowText}
            onChange={(e) => setAllowText(e.target.checked)}
            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
          />
        </div>

        {/* Logo Overlay Toggle */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex-1">
            <label htmlFor="apply-logo" className="text-sm font-medium text-gray-700 cursor-pointer">
              Apply company logo
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Overlay your logo on the generated image
            </p>
          </div>
          <input
            id="apply-logo"
            type="checkbox"
            checked={applyLogo}
            onChange={(e) => setApplyLogo(e.target.checked)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
        </div>

        {/* Custom Image Description - Always visible */}
        <div>
          <label htmlFor="custom-description" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Image Description (Optional)
            <span className="ml-2 text-xs font-normal text-blue-600">→ For NEW image generation</span>
          </label>
          <textarea
            id="custom-description"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="Describe what you want to see in the image... e.g., 'A professional businesswoman working on a laptop in a modern office with plants in the background'"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            💡 Leave blank to use AI-generated description from your post content
          </p>
        </div>

        {/* Generate Button - Moved directly after Custom Description */}
        <Button
          onClick={handleGenerateImage}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Generating {selectedTypeInfo?.label || 'image'}...
            </>
          ) : (
            <>
              <Image className="mr-2 h-5 w-5" />
              Generate {selectedTypeInfo?.label || 'Image'}
            </>
          )}
        </Button>

        {!visualPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <p className="text-blue-700 text-center text-sm">
              💡 Generate text content first to create a contextually relevant image
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-600 mb-3 text-sm">{error}</p>
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
            {/* Generated Image */}
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={generatedImage}
                alt={`Generated ${usedImageType || 'social media'} image`}
                className="w-full h-auto"
              />
            </div>
            
            {usedImageType && (
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Style: {imageTypes.find(t => t.value === usedImageType)?.label || usedImageType}
                </span>
              </div>
            )}
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
