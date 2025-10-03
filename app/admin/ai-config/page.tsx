'use client'

/**
 * AI Configuration Admin Page
 * 
 * Allows MASTER_ADMIN to edit AI generation settings.
 */

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AiGlobalConfig } from '@/lib/ai/ai-config'

export default function AiConfigPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [config, setConfig] = useState<AiGlobalConfig | null>(null)
  const [originalConfig, setOriginalConfig] = useState<AiGlobalConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [reason, setReason] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/admin/ai-config')
    }
  }, [status, router])
  
  useEffect(() => {
    if (status === 'authenticated') {
      loadConfig()
    }
  }, [status])
  
  useEffect(() => {
    if (config && originalConfig) {
      setHasChanges(JSON.stringify(config) !== JSON.stringify(originalConfig))
    }
  }, [config, originalConfig])
  
  async function loadConfig() {
    try {
      const res = await fetch('/api/admin/ai-config')
      if (!res.ok) {
        if (res.status === 403) {
          setError('You do not have permission to access this page')
          return
        }
        throw new Error('Failed to load configuration')
      }
      
      const data = await res.json()
      setConfig(data.config)
      setOriginalConfig(data.config)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  async function saveConfig() {
    if (!config) return
    
    setSaving(true)
    setError(null)
    setSuccess(false)
    
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, reason })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save configuration')
      }
      
      const data = await res.json()
      setConfig(data.config)
      setOriginalConfig(data.config)
      setSuccess(true)
      setReason('')
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  
  function resetChanges() {
    setConfig(originalConfig)
    setReason('')
  }
  
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading configuration...</p>
        </div>
      </div>
    )
  }
  
  if (error && !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Link href="/admin" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }
  
  if (!config) return null
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">AI Configuration</h1>
          <p className="mt-2 text-gray-600">
            Configure AI generation settings for all users
          </p>
        </div>
        
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">Configuration saved successfully!</p>
          </div>
        )}
        
        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Model Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Model
                </label>
                <select
                  value={config.textModel}
                  onChange={(e) => setConfig({ ...config, textModel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gpt-4.1-mini">GPT-4.1 Mini (Fast, Cost-effective)</option>
                  <option value="gpt-4.1-nano">GPT-4.1 Nano (Fastest, Budget)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Alternative)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {config.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower = more consistent, Higher = more creative
                </p>
              </div>
            </div>
          </div>
          
          <hr className="border-gray-200" />
          
          {/* Generation Defaults */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generation Defaults</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Hashtag Count
                </label>
                <input
                  type="number"
                  min="3"
                  max="12"
                  value={config.hashtagCountDefault}
                  onChange={(e) => setConfig({ ...config, hashtagCountDefault: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Post Types
                </label>
                <div className="space-y-2">
                  {(['selling', 'informational', 'advice', 'news'] as const).map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.allowedPostTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConfig({
                              ...config,
                              allowedPostTypes: [...config.allowedPostTypes, type]
                            })
                          } else {
                            setConfig({
                              ...config,
                              allowedPostTypes: config.allowedPostTypes.filter(t => t !== type)
                            })
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <hr className="border-gray-200" />
          
          {/* Feature Toggles */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Toggles</h2>
            
            <div className="space-y-3">
              {[
                { key: 'includeHeadlineOptions', label: 'Generate Headline Options' },
                { key: 'includeVisualPrompt', label: 'Generate Visual Prompts' },
                { key: 'includeHashtags', label: 'Generate Hashtags' },
                { key: 'ukPostingTimeHint', label: 'Include UK Posting Time Hint' },
                { key: 'enableNewsMode', label: 'Enable News Mode' },
                { key: 'newsFallbackToInsight', label: 'News Fallback to Insight' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config[key as keyof AiGlobalConfig] as boolean}
                    onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <hr className="border-gray-200" />
          
          {/* Learning Weights */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning System Weights</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Terms Weight: {config.weightPreferredTerms}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.weightPreferredTerms}
                  onChange={(e) => setConfig({ ...config, weightPreferredTerms: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Downvoted Tones Weight: {config.weightDownvotedTones}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.weightDownvotedTones}
                  onChange={(e) => setConfig({ ...config, weightDownvotedTones: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <hr className="border-gray-200" />
          
          {/* Change Reason */}
          {hasChanges && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Change (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe why you're making these changes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={saveConfig}
              disabled={!hasChanges || saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
            
            {hasChanges && (
              <button
                onClick={resetChanges}
                disabled={saving}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Reset Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
