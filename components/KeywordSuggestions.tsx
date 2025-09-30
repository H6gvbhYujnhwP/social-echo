'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'

interface KeywordSuggestionsProps {
  businessName: string
  website: string
  industry: string
  onSelectKeywords: (keywords: string[]) => void
  existingKeywords: string[]
}

export function KeywordSuggestions({ 
  businessName, 
  website, 
  industry, 
  onSelectKeywords, 
  existingKeywords 
}: KeywordSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Generate keyword suggestions based on business info
  useEffect(() => {
    if (!businessName && !website && !industry) {
      setSuggestions([])
      return
    }

    const generateSuggestions = () => {
      const keywordSet = new Set<string>()
      
      // Industry-based keywords
      const industryKeywords: Record<string, string[]> = {
        'IT Support': ['technology', 'IT services', 'tech support', 'cybersecurity', 'cloud computing', 'network management'],
        'Financial Services': ['finance', 'investment', 'banking', 'financial planning', 'wealth management', 'insurance'],
        'Marketing': ['digital marketing', 'social media', 'SEO', 'content marketing', 'advertising', 'branding'],
        'Healthcare': ['healthcare', 'medical services', 'patient care', 'health technology', 'wellness', 'telemedicine'],
        'Education': ['education', 'learning', 'training', 'e-learning', 'professional development', 'skills'],
        'Real Estate': ['real estate', 'property', 'investment', 'housing', 'commercial property', 'property management'],
        'Legal': ['legal services', 'law', 'compliance', 'legal advice', 'litigation', 'corporate law'],
        'Consulting': ['consulting', 'business strategy', 'management', 'advisory', 'expertise', 'solutions'],
        'Manufacturing': ['manufacturing', 'production', 'quality control', 'supply chain', 'automation', 'industrial'],
        'Retail': ['retail', 'e-commerce', 'customer service', 'sales', 'shopping', 'consumer goods']
      }

      // Add industry-specific keywords
      const industryLower = industry.toLowerCase()
      Object.entries(industryKeywords).forEach(([key, keywords]) => {
        if (industryLower.includes(key.toLowerCase()) || key.toLowerCase().includes(industryLower)) {
          keywords.forEach(keyword => keywordSet.add(keyword))
        }
      })

      // Extract keywords from business name
      if (businessName) {
        const businessWords = businessName.toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 2 && !['ltd', 'llc', 'inc', 'corp', 'company', 'the', 'and', 'for', 'with'].includes(word))
        
        businessWords.forEach(word => {
          if (word.length > 3) {
            keywordSet.add(word)
          }
        })
      }

      // Extract domain-based keywords from website
      if (website) {
        const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
        const domainParts = domain.split('.')[0].split(/[-_]/)
        domainParts.forEach(part => {
          if (part.length > 3 && !['com', 'net', 'org', 'co', 'uk'].includes(part)) {
            keywordSet.add(part)
          }
        })
      }

      // Add common business keywords
      const commonKeywords = [
        'business growth', 'professional services', 'customer satisfaction', 'innovation', 'expertise',
        'quality service', 'trusted partner', 'industry leader', 'best practices', 'client success'
      ]
      
      // Add a few common keywords if we don't have many suggestions
      if (keywordSet.size < 5) {
        commonKeywords.slice(0, 3).forEach(keyword => keywordSet.add(keyword))
      }

      // Filter out existing keywords
      const filteredSuggestions = Array.from(keywordSet)
        .filter(keyword => !existingKeywords.includes(keyword))
        .slice(0, 12) // Limit to 12 suggestions

      setSuggestions(filteredSuggestions)
    }

    generateSuggestions()
  }, [businessName, website, industry, existingKeywords])

  const toggleSuggestion = (keyword: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    )
  }

  const addSelectedKeywords = () => {
    if (selectedSuggestions.length > 0) {
      onSelectKeywords(selectedSuggestions)
      setSelectedSuggestions([])
      setIsOpen(false)
    }
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left justify-between"
      >
        <span>💡 Suggested Keywords ({suggestions.length})</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </Button>
      
      {isOpen && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <p className="text-sm text-gray-600">
            Based on your business info, here are some relevant keywords:
          </p>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* Quick action buttons */}
            <div className="flex gap-2 mb-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onSelectKeywords(suggestions)
                  setIsOpen(false)
                }}
                className="text-xs"
              >
                Add All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedSuggestions([])}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
            
            {/* Mobile-friendly suggestion buttons */}
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  className={`w-full text-left px-3 py-3 rounded-md border transition-colors ${
                    selectedSuggestions.includes(keyword)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-white border-gray-200 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                  onClick={() => toggleSuggestion(keyword)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{keyword}</span>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedSuggestions.includes(keyword)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedSuggestions.includes(keyword) && (
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {selectedSuggestions.length > 0 && (
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">
                {selectedSuggestions.length} selected
              </span>
              <Button
                type="button"
                size="sm"
                onClick={addSelectedKeywords}
              >
                Add Selected Keywords
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
