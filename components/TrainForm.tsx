'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { Select } from './ui/Select'
import { TagsInput } from './TagsInput'
import { KeywordSuggestions } from './KeywordSuggestions'
import { UserProfile, setProfile } from '../lib/localstore'

// URL validation helper - more forgiving
const cleanUrl = (v: string) => v.trim()
const isValidUrl = (url: string): boolean => {
  try {
    const u = cleanUrl(url)
    if (!u) return true // optional field
    const withProto = u.startsWith('http') ? u : `https://${u}`
    const urlObj = new URL(withProto)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch { 
    return false 
  }
}

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'funny', label: 'Funny' },
  { value: 'bold', label: 'Bold' },
]

interface TrainFormProps {
  initialProfile?: UserProfile
}

export function TrainForm({ initialProfile }: TrainFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<UserProfile>(
    initialProfile || {
      business_name: '',
      website: '',
      industry: '',
      tone: 'professional',
      products_services: '',
      target_audience: '',
      keywords: [],
      rotation: 'serious',
    }
  )
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {}

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required'
    }
    const website = formData.website.trim()
    if (website && !isValidUrl(website)) {
      newErrors.website = 'Please enter a valid website URL'
    }
    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required'
    }
    if (!formData.products_services.trim()) {
      newErrors.products_services = 'Products/Services description is required'
    }
    if (!formData.target_audience.trim()) {
      newErrors.target_audience = 'Target audience description is required'
    }
    // Keywords are optional but recommended
    // if (formData.keywords.length === 0) {
    //   newErrors.keywords = 'At least one keyword is recommended'
    // }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      setProfile({
        ...formData,
        website: cleanUrl(formData.website),
      })
    } catch (err) {
      console.error('save failed', err)
    } finally {
      setIsSubmitting(false)
      // replace avoids back button returning to form half-saved
      router.replace('/dashboard')
    }
  }

  const updateField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Business Name"
        value={formData.business_name}
        onChange={(e) => updateField('business_name', e.target.value)}
        error={errors.business_name}
        placeholder="e.g., Smith & Associates"
        required
      />

      <Input
        label="Company Website"
        value={formData.website}
        onChange={(e) => updateField('website', e.target.value)}
        error={errors.website}
        placeholder="e.g., www.yourcompany.com"
        type="url"
      />

      <Input
        label="Industry/Sector"
        value={formData.industry}
        onChange={(e) => updateField('industry', e.target.value)}
        error={errors.industry}
        placeholder="e.g., Financial Services"
        required
      />

      <Select
        label="Tone"
        value={formData.tone}
        onChange={(e) => updateField('tone', e.target.value as UserProfile['tone'])}
        options={toneOptions}
        required
      />

      <Textarea
        label="Products/Services"
        value={formData.products_services}
        onChange={(e) => updateField('products_services', e.target.value)}
        error={errors.products_services}
        placeholder="Describe what your business offers..."
        rows={4}
        required
      />

      <Textarea
        label="Target Audience"
        value={formData.target_audience}
        onChange={(e) => updateField('target_audience', e.target.value)}
        error={errors.target_audience}
        placeholder="Describe your ideal customers..."
        rows={4}
        required
      />

      <div className="space-y-3">
        <KeywordSuggestions
          businessName={formData.business_name}
          website={formData.website}
          industry={formData.industry}
          existingKeywords={formData.keywords}
          onSelectKeywords={(selectedKeywords) => {
            updateField('keywords', [...formData.keywords, ...selectedKeywords])
          }}
        />
        
        <TagsInput
          label="Keywords"
          value={formData.keywords}
          onChange={(keywords) => updateField('keywords', keywords)}
          placeholder="Enter keywords and press Enter"
        />
        {errors.keywords && (
          <p className="text-sm text-red-600">{errors.keywords}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Rotation
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="rotation"
              value="serious"
              checked={formData.rotation === 'serious'}
              onChange={(e) => updateField('rotation', e.target.value as UserProfile['rotation'])}
              className="mr-2"
            />
            Serious
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="rotation"
              value="quirky"
              checked={formData.rotation === 'quirky'}
              onChange={(e) => updateField('rotation', e.target.value as UserProfile['rotation'])}
              className="mr-2"
            />
            Quirky
          </label>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save & Continue'}
      </Button>
    </form>
  )
}
