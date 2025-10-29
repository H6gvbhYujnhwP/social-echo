'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import { Select } from './ui/Select'
import { TagsInput } from './TagsInput'
import { KeywordSuggestions } from './KeywordSuggestions'
import { DocumentUpload } from './DocumentUpload'
import { UserProfile, setProfile } from '../lib/localstore'
import { HelpCircle } from 'lucide-react'

// URL validation helper - accepts domain.com, www.domain.com, https://domain.com
const cleanUrl = (v: string) => {
  const trimmed = v.trim()
  // If empty, return empty (optional field)
  if (!trimmed) return ''
  // If already has protocol, return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  // Otherwise add https://
  return `https://${trimmed}`
}

const isValidUrl = (url: string): boolean => {
  const u = url.trim()
  if (!u) return true // optional field
  
  try {
    // Clean the URL (add https:// if needed)
    const withProto = cleanUrl(u)
    const urlObj = new URL(withProto)
    
    // Check it's http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false
    }
    
    // Check it has a valid hostname (e.g., sweetbyte.co.uk, www.example.com)
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return false
    }
    
    // Check hostname has at least one dot (e.g., example.com)
    if (!urlObj.hostname.includes('.')) {
      return false
    }
    
    return true
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

// Target audience options for multi-select
const targetAudienceOptions = [
  { value: 'SME Owners', label: 'SME Owners', description: 'Small–medium business owners and entrepreneurs' },
  { value: 'Startups & Founders', label: 'Startups & Founders', description: 'Early-stage companies and innovators' },
  { value: 'C-Suite Executives', label: 'C-Suite Executives', description: 'CEOs, CFOs, senior leaders' },
  { value: 'Marketing Professionals', label: 'Marketing Professionals', description: 'Managers, strategists, content creators' },
  { value: 'Sales & Business Development', label: 'Sales & Business Development', description: 'Reps, BDMs, growth specialists' },
  { value: 'Consultants & Advisors', label: 'Consultants & Advisors', description: 'Business and management consultants' },
  { value: 'Freelancers & Solopreneurs', label: 'Freelancers & Solopreneurs', description: 'Independent professionals and creatives' },
  { value: 'Retail Businesses', label: 'Retail Businesses', description: 'Shops, boutiques, eCommerce, local traders' },
  { value: 'Hospitality & Leisure', label: 'Hospitality & Leisure', description: 'Restaurants, cafes, hotels, venues' },
  { value: 'Health & Wellness Providers', label: 'Health & Wellness Providers', description: 'Gyms, salons, therapists, clinics' },
  { value: 'Public Services & Community', label: 'Public Services & Community', description: 'Charities, councils, NGOs' },
  { value: 'Education & Training', label: 'Education & Training', description: 'Schools, tutors, learning centers' },
  { value: 'Content Creators & Influencers', label: 'Content Creators & Influencers', description: 'YouTubers, bloggers, social creators' },
  { value: 'Creative Agencies', label: 'Creative Agencies', description: 'Marketing, branding, design studios' },
  { value: 'Tech & IT Professionals', label: 'Tech & IT Professionals', description: 'Developers, IT managers, tech startups' },
  { value: 'High Street Customers / The Public', label: 'High Street Customers / The Public', description: 'Everyday consumers and lifestyle brands' },
  { value: 'Entertainment & Events', label: 'Entertainment & Events', description: 'Musicians, event organizers, venues' },
  { value: 'Real Estate & Property', label: 'Real Estate & Property', description: 'Estate agents, developers, brokers' },
  { value: 'Legal & Financial Services', label: 'Legal & Financial Services', description: 'Lawyers, accountants, advisors' },
]

interface TrainFormProps {
  initialProfile?: UserProfile
}

// Helper component for field descriptions
const FieldHelp = ({ text }: { text: string }) => (
  <div className="flex items-start space-x-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
    <p className="text-sm text-blue-900">{text}</p>
  </div>
)

export function TrainForm({ initialProfile }: TrainFormProps) {
  const router = useRouter()
  
  // Initialize selectedAudiences from the saved profile
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(() => {
    if (!initialProfile?.target_audience) return []
    
    // Parse the saved target_audience string to extract selected audiences
    const savedAudiences: string[] = []
    const audienceText = initialProfile.target_audience
    
    // Check each audience option to see if it's in the saved text
    targetAudienceOptions.forEach(option => {
      if (audienceText.includes(option.value)) {
        savedAudiences.push(option.value)
      }
    })
    
    return savedAudiences
  })
  
  // Initialize formData and remove selected audience names from target_audience text
  const [formData, setFormData] = useState<UserProfile>(() => {
    if (!initialProfile) {
      return {
        business_name: '',
        website: '',
        industry: '',
        tone: 'professional',
        products_services: '',
        target_audience: '',
        usp: '',
        keywords: [],
        rotation: 'serious',
      }
    }
    
    // Remove selected audience names from the target_audience text
    let customText = initialProfile.target_audience || ''
    targetAudienceOptions.forEach(option => {
      customText = customText.replace(option.value, '').replace(', , ', ', ').trim()
    })
    // Clean up any leading/trailing commas and periods
    customText = customText.replace(/^[,.\s]+|[,.\s]+$/g, '').trim()
    
    return {
      ...initialProfile,
      target_audience: customText
    }
  })
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {}

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required'
    }
    // Website is optional - no validation needed
    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required'
    }
    if (!formData.products_services.trim()) {
      newErrors.products_services = 'Products/Services description is required'
    }
    // Validate target audience: either select from options or provide custom text
    const customAudience = formData.target_audience.trim()
    if (selectedAudiences.length === 0 && !customAudience) {
      newErrors.target_audience = 'Please select at least one audience or describe your own'
    }
    // If custom audience is provided, validate it has at least 3 alphanumeric characters
    if (customAudience && customAudience.replace(/[^a-zA-Z0-9]/g, '').length < 3) {
      newErrors.target_audience = 'Custom audience must contain at least 3 alphanumeric characters'
    }
    if (!formData.usp.trim()) {
      newErrors.usp = 'USP (Unique Selling Point) is required'
    }

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
      // Combine selected audiences with custom text
      const audienceText = selectedAudiences.length > 0
        ? `${selectedAudiences.join(', ')}${formData.target_audience ? '. ' + formData.target_audience : ''}`
        : formData.target_audience

      // Save to database via API
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          website: cleanUrl(formData.website),
          target_audience: audienceText
        })
      })

      if (!response.ok) {
        const error = await response.json()
        const errorMessage = error.error || 'Failed to save profile'
        const errorDetails = error.details ? JSON.stringify(error.details) : ''
        throw new Error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`)
      }

      const result = await response.json()
      console.log('Profile saved successfully:', result)

      // Also save to localStorage for backward compatibility (temporary)
      setProfile({
        ...formData,
        website: cleanUrl(formData.website),
        target_audience: audienceText,
      })

      // Show success message
      alert('✅ Profile saved successfully! Your AI is now trained with your latest business information.')

      // Navigate to dashboard
      router.replace('/dashboard')
    } catch (err: any) {
      console.error('save failed', err)
      const errorMessage = err.message || 'Failed to save profile. Please try again.'
      alert(`❌ Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const toggleAudience = (value: string) => {
    setSelectedAudiences(prev => 
      prev.includes(value)
        ? prev.filter(a => a !== value)
        : [...prev, value]
    )
    // Clear error when user selects an audience
    if (errors.target_audience) {
      setErrors(prev => ({ ...prev, target_audience: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Business Name */}
      <div>
        <Input
          label="Business Name"
          value={formData.business_name}
          onChange={(e) => updateField('business_name', e.target.value)}
          error={errors.business_name}
          placeholder="e.g., Smith & Associates, Acme Solutions Ltd"
          required
        />
        <FieldHelp text="Your official business name for your social profiles. This helps personalize your posts and build brand recognition." />
      </div>

      {/* Website */}
      <div>
        <Input
          label="Company Website"
          value={formData.website}
          onChange={(e) => updateField('website', e.target.value)}
          error={errors.website}
          placeholder="e.g., socialecho.ai or www.yourcompany.com"
          type="text"
        />
        <FieldHelp text="Your company website URL (optional). You can enter it as: domain.com, www.domain.com, or https://domain.com - all formats work! This helps the AI understand your business better by analyzing your online presence and services." />
      </div>

      {/* Industry */}
      <div>
        <Input
          label="Industry/Sector"
          value={formData.industry}
          onChange={(e) => updateField('industry', e.target.value)}
          error={errors.industry}
          placeholder="e.g., Financial Services, Legal Services, Digital Marketing, Healthcare"
          required
        />
        <FieldHelp text="Your primary industry or sector. Be specific (e.g., 'Corporate Law' instead of just 'Legal'). This ensures content is relevant to your field." />
      </div>

      {/* Tone */}
      <div>
        <Select
          label="Tone"
          value={formData.tone}
          onChange={(e) => updateField('tone', e.target.value as UserProfile['tone'])}
          options={toneOptions}
          required
        />
        <FieldHelp text="How you want to sound in your posts. Professional = formal and authoritative. Casual = friendly and approachable. Funny = light-hearted with humor. Bold = direct and opinionated." />
      </div>

      {/* Products/Services */}
      <div>
        <Textarea
          label="Products/Services"
          value={formData.products_services}
          onChange={(e) => updateField('products_services', e.target.value)}
          error={errors.products_services}
          placeholder="e.g., We provide AI-powered automation solutions for SMEs, helping businesses streamline operations, reduce admin time, and improve efficiency through smart tools and consulting."
          rows={4}
          required
        />
        <FieldHelp text="Describe what you offer in detail. Include key services, products, and benefits. The more specific you are, the better your posts will resonate with potential clients." />
      </div>

      {/* USP (Unique Selling Point) */}
      <div>
        <Textarea
          label="USP (Unique Selling Point)"
          value={formData.usp}
          onChange={(e) => updateField('usp', e.target.value)}
          error={errors.usp}
          placeholder="e.g., Unlike traditional consultancies that charge £10k+ for automation, we deliver AI solutions in under 2 weeks for a fraction of the cost, with guaranteed ROI or your money back."
          rows={3}
          required
        />
        <FieldHelp text="What makes you different from competitors? This is crucial for your marketing strategy. A strong USP helps you stand out, attracts the right clients, and gives people a clear reason to choose you. Include specific benefits, unique approaches, guarantees, or competitive advantages that only you offer." />
      </div>

      {/* Target Audience - Multi-Select */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Target Audience <span className="text-red-400">*</span>
        </label>
        <p className="text-sm text-gray-300 mb-4">
          Select all that apply (you can choose multiple):
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {targetAudienceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleAudience(option.value)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedAudiences.includes(option.value)
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-white">{option.label}</p>
                  <p className="text-xs text-gray-300 mt-1">{option.description}</p>
                </div>
                {selectedAudiences.includes(option.value) && (
                  <div className="ml-2 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {/* Custom Audience Input */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-white mb-2">
            Or describe your audience in your own words
          </label>
          <Input
            value={formData.target_audience}
            onChange={(e) => updateField('target_audience', e.target.value)}
            error={errors.target_audience}
            placeholder="e.g., Local car detailers, independent bakers, parish councils..."
            maxLength={60}
          />
          <p className="text-xs text-gray-400 mt-1">
            {formData.target_audience.length}/60 characters
          </p>
        </div>
        <FieldHelp text="Who are your ideal clients? Select from the options above and/or add specific details: demographics, company size, pain points, goals. The more specific, the better your content will resonate." />
      </div>

      {/* Keywords */}
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
          placeholder="e.g., automation, AI, efficiency, productivity (press Enter after each)"
        />
        <FieldHelp text="Keywords that represent your business, services, and industry. These will be naturally woven into your posts (not as hashtags). Examples: 'automation', 'compliance', 'growth', 'digital transformation'." />
      </div>

      {/* Rotation */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Content Rotation
        </label>
        <div className="flex items-center space-x-4 mb-3">
          <label className="flex items-center text-white cursor-pointer">
            <input
              type="radio"
              name="rotation"
              value="serious"
              checked={formData.rotation === 'serious'}
              onChange={(e) => updateField('rotation', e.target.value as UserProfile['rotation'])}
              className="mr-2 w-4 h-4"
            />
            Serious
          </label>
          <label className="flex items-center text-white cursor-pointer">
            <input
              type="radio"
              name="rotation"
              value="quirky"
              checked={formData.rotation === 'quirky'}
              onChange={(e) => updateField('rotation', e.target.value as UserProfile['rotation'])}
              className="mr-2 w-4 h-4"
            />
            Quirky
          </label>
        </div>
        <FieldHelp text="Serious = Professional business stories about growth, challenges, and solutions. Quirky = Light-hearted, funny business stories with relatable moments. You can change this anytime in your profile." />
      </div>

      {/* Technical Documents (Optional) */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white mb-3">
          Technical Documents (Optional)
        </label>
        <DocumentUpload />
      </div>

      {/* Country */}
      <div>
        <Select
          label="Country"
          value={formData.country || ''}
          onChange={(e) => updateField('country', e.target.value)}
          options={[
            { value: '', label: 'Not specified (neutral international)' },
            { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
            { value: 'United States', label: '🇺🇸 United States' },
            { value: 'Canada', label: '🇨🇦 Canada' },
            { value: 'Australia', label: '🇦🇺 Australia' },
            { value: 'Ireland', label: '🇮🇪 Ireland' },
            { value: 'New Zealand', label: '🇳🇿 New Zealand' },
            { value: 'India', label: '🇮🇳 India' },
            { value: 'South Africa', label: '🇿🇦 South Africa' },
            { value: 'Other', label: 'Other' },
          ]}
        />
        <FieldHelp text="Your country helps us generate content with the right spelling (colour vs color), currency (£ vs $), holidays, and cultural references. Leave blank for neutral international English." />
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-white/10">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving Your Profile...' : 'Save & Start Creating Content'}
        </Button>
        <p className="text-center text-sm text-gray-400 mt-4">
          You can update these details anytime from your dashboard
        </p>
      </div>
    </form>
  )
}
