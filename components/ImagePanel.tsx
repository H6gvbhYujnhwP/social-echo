'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Image, Download, RefreshCw, Palette, Info, Clock, Sparkles } from 'lucide-react'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
import { getAvailableImageTypes } from '../lib/ai/image-service'
import CustomPhotoUpload from './CustomPhotoUpload'

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
  
  // Logo controls for re-applying logo to existing image
  const [logoPosition, setLogoPosition] = useState('bottom-right')
  const [logoSize, setLogoSize] = useState('medium')
  const [logoEnabled, setLogoEnabled] = useState(true)
  const [logoOffsetX, setLogoOffsetX] = useState(0) // Horizontal offset in pixels (-200 to +200)
  const [logoOffsetY, setLogoOffsetY] = useState(0) // Vertical offset in pixels (-200 to +200)
  const [isReapplyingLogo, setIsReapplyingLogo] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null) // Store original image without logo
  const [backdropOnly, setBackdropOnly] = useState<string | null>(null) // Store backdrop without photo/logo for recompositing
  const [hasUploadedLogo, setHasUploadedLogo] = useState<boolean | null>(null) // null = loading, true/false = has logo or not
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'ai' | 'custom'>('ai')
  
  // Custom photo backdrop states
  const [selectedPhotoId, setSelectedPhotoId] = useState('')
  const [backdropDescription, setBackdropDescription] = useState('')
  const [photoPosition, setPhotoPosition] = useState<'left' | 'center' | 'right'>('center')
  const [photoSize, setPhotoSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [photoRotation, setPhotoRotation] = useState<0 | 90 | 180 | 270>(0)
  const [removeBackground, setRemoveBackground] = useState(true) // Default to true for better results
  const [isGeneratingBackdrop, setIsGeneratingBackdrop] = useState(false)
  const [isReapplyingPhoto, setIsReapplyingPhoto] = useState(false)

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

  // Check if user has uploaded a logo
  React.useEffect(() => {
    const checkLogo = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const profile = await response.json()
          setHasUploadedLogo(!!profile.logoUrl)
        }
      } catch (error) {
        console.error('[ImagePanel] Error checking logo:', error)
      }
    }
    checkLogo()
  }, [])

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
      
      // Store original image (without logo) if logo was applied
      if (applyLogo && data.original_image_base64) {
        console.log('[ImagePanel] Setting originalImage (without logo), length:', data.original_image_base64.length)
        setOriginalImage(data.original_image_base64)
      } else {
        console.log('[ImagePanel] Setting originalImage (same as final), length:', data.image_base64.length)
        setOriginalImage(data.image_base64) // If no logo, original = final
      }
      
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

  const handleReapplyLogo = async (newPosition?: string, newSize?: string, newEnabled?: boolean) => {
    if (!generatedImage) {
      setError('No image available to apply logo')
      return
    }

    // Use provided values or fall back to state
    const position = newPosition !== undefined ? newPosition : logoPosition
    const size = newSize !== undefined ? newSize : logoSize
    const enabled = newEnabled !== undefined ? newEnabled : logoEnabled

    console.log('[handleReapplyLogo] originalImage exists:', !!originalImage, 'length:', originalImage?.length)
    console.log('[handleReapplyLogo] generatedImage exists:', !!generatedImage, 'length:', generatedImage?.length)
    console.log('[handleReapplyLogo] Using:', originalImage ? 'originalImage' : 'generatedImage')
    console.log('[handleReapplyLogo] Position:', position, 'Size:', size, 'Enabled:', enabled)
    console.log('[handleReapplyLogo] usedImageType:', usedImageType)

    setIsReapplyingLogo(true)
    setError(null)

    try {
      // For custom backdrops, use reapply-photo endpoint to avoid logo duplication
      // because it recomposes from backdropOnly
      if (usedImageType === 'custom-backdrop' && backdropOnly) {
        console.log('[handleReapplyLogo] Using reapply-photo for custom backdrop')
        const response = await fetch('/api/reapply-photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            photoId: selectedPhotoId,
            backdropDescription: backdropDescription,
            position: photoPosition,
            size: photoSize,
            rotation: photoRotation,
            removeBackground: removeBackground,
            applyLogo: enabled,
            logoPosition: position,
            logoSize: size,
            logoOffsetX: logoOffsetX,
            logoOffsetY: logoOffsetY,
            existingImageUrl: backdropOnly
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to reapply logo')
        }

        const data = await response.json()
        setGeneratedImage(data.imageUrl)
        setOriginalImage(data.imageUrl)
        console.log('[ImagePanel] Logo reapplied successfully via reapply-photo')
        
        // Update parent component with new image
        if (onImageGenerated && data.imageUrl) {
          onImageGenerated(data.imageUrl, 'custom-backdrop')
        }
      } else {
        // For AI generated images, use reapply-logo endpoint
        console.log('[handleReapplyLogo] Using reapply-logo for AI image')
        const response = await fetch('/api/reapply-logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: originalImage || generatedImage,
            logoPosition: position,
            logoSize: size,
            logoEnabled: enabled,
            logoOffsetX: logoOffsetX,
            logoOffsetY: logoOffsetY
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to reapply logo')
        }

        const data = await response.json()
        setGeneratedImage(data.imageUrl)
        console.log('[ImagePanel] Logo reapplied successfully')
        
        // Update parent component with new image
        if (onImageGenerated && data.imageUrl) {
          onImageGenerated(data.imageUrl, usedImageType || selectedStyle)
        }
      }
    } catch (err) {
      console.error('[ImagePanel] Error reapplying logo:', err)
      setError(err instanceof Error ? err.message : 'Failed to reapply logo')
    } finally {
      setIsReapplyingLogo(false)
    }
  }

  const handleGenerateBackdrop = async () => {
    if (!selectedPhotoId) {
      setError('Please select a photo first')
      return
    }
    
    if (!backdropDescription.trim()) {
      setError('Please describe the backdrop you want')
      return
    }
    
    setIsGeneratingBackdrop(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate-backdrop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoId: selectedPhotoId,
          backdropDescription,
          photoPosition,
          photoSize,
          photoRotation,
          removeBackground,
          photoPlacement: 'foreground',
          includeLogo: applyLogo
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate backdrop')
      }
      
      const data = await response.json()
      setGeneratedImage(data.imageUrl)
      setUsedImageType('custom-backdrop')
      setOriginalImage(data.imageUrl) // Store for logo adjustments
      setBackdropOnly(data.backdropUrl) // Store backdrop-only for recompositing
      
      // Notify parent component
      if (onImageGenerated) {
        onImageGenerated(data.imageUrl, 'custom-backdrop')
      }
      
      console.log('[ImagePanel] Backdrop generated successfully')
    } catch (err) {
      console.error('[ImagePanel] Error generating backdrop:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate backdrop')
    } finally {
      setIsGeneratingBackdrop(false)
    }
  }

  const handleReapplyPhoto = async () => {
    if (!generatedImage || !selectedPhotoId) {
      setError('No existing image to modify')
      return
    }
    
    setIsReapplyingPhoto(true)
    setError(null)
    
    try {
      const response = await fetch('/api/reapply-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          existingImageUrl: backdropOnly || originalImage || generatedImage,
          photoId: selectedPhotoId,
          photoPosition,
          photoSize,
          photoRotation,
          removeBackgroundEnabled: removeBackground,
          applyLogo
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to apply photo changes')
      }
      
      const data = await response.json()
      setGeneratedImage(data.imageUrl)
      setOriginalImage(data.imageUrl) // Update original so logo changes work on this version
      
      // Notify parent component
      if (onImageGenerated) {
        onImageGenerated(data.imageUrl, 'custom-backdrop')
      }
      
      console.log('[ImagePanel] Photo changes applied successfully')
    } catch (err) {
      console.error('[ImagePanel] Error applying photo changes:', err)
      setError(err instanceof Error ? err.message : 'Failed to apply photo changes')
    } finally {
      setIsReapplyingPhoto(false)
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
      
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex gap-1 px-2 pt-2">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg ${
              activeTab === 'ai'
                ? 'bg-white text-green-600 border-t-2 border-x border-green-500 border-b-0 shadow-sm'
                : 'bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>AI Image</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg ${
              activeTab === 'custom'
                ? 'bg-white text-purple-600 border-t-2 border-x border-purple-500 border-b-0 shadow-sm'
                : 'bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Image className="h-4 w-4" />
              <span>Custom Photo</span>
            </div>
          </button>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* AI Image Tab Content */}
        {activeTab === 'ai' && (
          <>
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

        {/* Logo Overlay Toggle */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex-1">
            <label htmlFor="apply-logo" className="text-sm font-medium text-gray-700 cursor-pointer">
              Apply company logo
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {hasUploadedLogo === false ? (
                <span>
                  Please upload your logo by clicking <a href="/account" className="text-blue-600 hover:underline font-medium">Account</a>
                </span>
              ) : (
                'Overlay your logo on the generated image'
              )}
            </p>
          </div>
          <input
            id="apply-logo"
            type="checkbox"
            checked={applyLogo}
            onChange={(e) => setApplyLogo(e.target.checked)}
            disabled={hasUploadedLogo === false}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        </>
        )}
        
        {/* Custom Photo Tab Content */}
        {activeTab === 'custom' && (
          <>
            <CustomPhotoUpload
              onPhotoSelect={setSelectedPhotoId}
              selectedPhotoId={selectedPhotoId}
            />
            
            {selectedPhotoId && (
              <>
                <div>
                  <label htmlFor="backdrop-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Backdrop Description
                  </label>
                  <textarea
                    id="backdrop-description"
                    value={backdropDescription}
                    onChange={(e) => setBackdropDescription(e.target.value)}
                    placeholder="Describe the backdrop you want... e.g., 'modern office with glass windows', 'outdoor nature scene with mountains', 'luxury showroom with spotlights'"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo Position</label>
                    <select
                      value={photoPosition}
                      onChange={(e) => setPhotoPosition(e.target.value as 'left' | 'center' | 'right')}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo Size</label>
                    <select
                      value={photoSize}
                      onChange={(e) => setPhotoSize(e.target.value as 'small' | 'medium' | 'large')}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="small">Small (25%)</option>
                      <option value="medium">Medium (40%)</option>
                      <option value="large">Large (60%)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo Rotation</label>
                    <select
                      value={photoRotation}
                      onChange={(e) => setPhotoRotation(Number(e.target.value) as 0 | 90 | 180 | 270)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="0">0° (No rotation)</option>
                      <option value="90">90° (Clockwise)</option>
                      <option value="180">180° (Upside down)</option>
                      <option value="270">270° (Counter-clockwise)</option>
                    </select>
                  </div>
                </div>
                
                {/* Background Removal Toggle */}
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex-1">
                    <label htmlFor="remove-background" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Remove background
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Isolate people/objects from photo background. Best for photos with clear subjects.
                    </p>
                  </div>
                  <input
                    id="remove-background"
                    type="checkbox"
                    checked={removeBackground}
                    onChange={(e) => setRemoveBackground(e.target.checked)}
                    className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                
                {/* Apply Photo Changes Button - Only show when image exists */}
                {generatedImage && usedImageType === 'custom-backdrop' && (
                  <div className="space-y-2">
                    <Button
                      onClick={handleReapplyPhoto}
                      disabled={isReapplyingPhoto}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 text-base font-semibold rounded-xl shadow-md transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isReapplyingPhoto ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Applying Changes...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Apply Photo Changes
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-gray-600">
                      ✨ Keeps the backdrop, only adjusts your photo settings
                    </p>
                  </div>
                )}
                
                {/* Generate New Backdrop Button */}
                <div className="space-y-2">
                  <Button
                    onClick={handleGenerateBackdrop}
                    disabled={isGeneratingBackdrop}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isGeneratingBackdrop ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Generating Backdrop...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate New Backdrop
                      </>
                    )}
                  </Button>
                  {generatedImage && usedImageType === 'custom-backdrop' && (
                    <p className="text-xs text-center text-gray-600">
                      🎨 Creates a completely new AI backdrop
                    </p>
                  )}
                </div>
              </>
            )}
            
            {!selectedPhotoId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-purple-50 border border-purple-200 rounded-xl"
              >
                <p className="text-purple-700 text-center text-sm">
                  📸 Upload and select a photo to get started
                </p>
              </motion.div>
            )}
          </>
        )}
        
        {/* Error and Generated Image (shared between tabs) */}
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
              onClick={activeTab === 'ai' ? handleGenerateImage : handleGenerateBackdrop}
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
            
            {/* Logo Settings - Always visible */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Logo Settings</h3>
                
                {/* Logo Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Show Logo</label>
                  <button
                    type="button"
                    onClick={async () => {
                      const newEnabled = !logoEnabled
                      console.log('[Logo Toggle] Clicked, new state:', newEnabled, 'generatedImage exists:', !!generatedImage)
                      setLogoEnabled(newEnabled)
                      // Auto-apply if image exists
                      if (generatedImage) {
                        console.log('[Logo Toggle] Calling handleReapplyLogo with newEnabled:', newEnabled)
                        setTimeout(() => handleReapplyLogo(undefined, undefined, newEnabled), 0)
                      } else {
                        console.log('[Logo Toggle] No generatedImage, skipping reapply')
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      logoEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        logoEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Logo Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <select
                    value={logoPosition}
                    onChange={(e) => {
                      const newPosition = e.target.value
                      console.log('[Logo Position] Changed to:', newPosition, 'generatedImage exists:', !!generatedImage)
                      setLogoPosition(newPosition)
                      // Auto-apply if image exists
                      if (generatedImage) {
                        console.log('[Logo Position] Calling handleReapplyLogo with newPosition:', newPosition)
                        setTimeout(() => handleReapplyLogo(newPosition, undefined, undefined), 100)
                      } else {
                        console.log('[Logo Position] No generatedImage, skipping reapply')
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                
                {/* Logo Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <select
                    value={logoSize}
                    onChange={(e) => {
                      const newSize = e.target.value
                      console.log('[Logo Size] Changed to:', newSize, 'generatedImage exists:', !!generatedImage)
                      setLogoSize(newSize)
                      // Auto-apply if image exists
                      if (generatedImage) {
                        console.log('[Logo Size] Calling handleReapplyLogo with newSize:', newSize)
                        setTimeout(() => handleReapplyLogo(undefined, newSize, undefined), 100)
                      } else {
                        console.log('[Logo Size] No generatedImage, skipping reapply')
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="small">Small (15%)</option>
                    <option value="medium">Medium (25%)</option>
                    <option value="large">Large (35%)</option>
                  </select>
                </div>
                
                {/* Logo Offset Controls */}
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Fine-tune position (optional)</p>
                  
                  {!originalImage && (
                    <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 mb-3">
                      ⚠️ Offset controls are disabled for saved images. Generate a new image to use fine positioning.
                    </div>
                  )}
                  
                  {/* Horizontal Offset */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horizontal Offset</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newOffset = Math.max(-200, logoOffsetX - 10)
                          setLogoOffsetX(newOffset)
                          if (generatedImage) {
                            setTimeout(() => handleReapplyLogo(undefined, undefined, undefined), 100)
                          }
                        }}
                        disabled={!originalImage}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move left"
                      >
                        ←
                      </button>
                      <input
                        type="number"
                        value={logoOffsetX}
                        onChange={(e) => {
                          const value = Math.max(-200, Math.min(200, parseInt(e.target.value) || 0))
                          setLogoOffsetX(value)
                        }}
                        onBlur={() => {
                          if (generatedImage) {
                            setTimeout(() => handleReapplyLogo(undefined, undefined, undefined), 100)
                          }
                        }}
                        disabled={!originalImage}
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        min="-200"
                        max="200"
                      />
                      <span className="text-xs text-gray-500 w-8">px</span>
                      <button
                        onClick={() => {
                          const newOffset = Math.min(200, logoOffsetX + 10)
                          setLogoOffsetX(newOffset)
                          if (generatedImage) {
                            setTimeout(() => handleReapplyLogo(undefined, undefined, undefined), 100)
                          }
                        }}
                        disabled={!originalImage}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move right"
                      >
                        →
                      </button>
                    </div>
                  </div>
                  
                  {/* Vertical Offset */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vertical Offset</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newOffset = Math.max(-200, logoOffsetY - 10)
                          setLogoOffsetY(newOffset)
                          if (generatedImage) {
                            setTimeout(() => handleReapplyLogo(undefined, undefined, undefined), 100)
                          }
                        }}
                        disabled={!originalImage}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <input
                        type="number"
                        value={logoOffsetY}
                        onChange={(e) => {
                          const value = Math.max(-200, Math.min(200, parseInt(e.target.value) || 0))
                          setLogoOffsetY(value)
                        }}
                        onBlur={() => {
                          if (generatedImage) {
                            setTimeout(() => handleReapplyLogo(undefined, undefined, undefined), 100)
                          }
                        }}
                        disabled={!originalImage}
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        min="-200"
                        max="200"
                      />
                      <span className="text-xs text-gray-500 w-8">px</span>
                      <button
                        onClick={() => {
                          const newOffset = Math.min(200, logoOffsetY + 10)
                          setLogoOffsetY(newOffset)
                          if (generatedImage) {
                            setTimeout(() => handleReapplyLogo(undefined, undefined, undefined), 100)
                          }
                        }}
                        disabled={!originalImage}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                  
                  {/* Reset Button */}
                  {(logoOffsetX !== 0 || logoOffsetY !== 0) && (
                    <button
                      onClick={() => {
                        setLogoOffsetX(0)
                        setLogoOffsetY(0)
                        if (generatedImage) {
                          setTimeout(() => handleReapplyLogo(undefined, undefined, undefined), 100)
                        }
                      }}
                      className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      Reset to Default Position
                    </button>
                  )}
                </div>

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
