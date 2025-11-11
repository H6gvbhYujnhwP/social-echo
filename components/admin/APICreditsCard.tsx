'use client'

import { useEffect, useState } from 'react'
import { formatUSD, getSpendingStatusColor, type APICreditsStatus } from '@/lib/api-credits-service'

export default function APICreditsCard() {
  const [credits, setCredits] = useState<APICreditsStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/api-credits')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch credits: ${response.statusText}`)
      }
      
      const data = await response.json()
      setCredits(data)
    } catch (err: any) {
      console.error('[APICreditsCard] Error:', err)
      setError(err.message || 'Failed to load API credits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredits()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchCredits, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusBadgeColor = (color: 'green' | 'yellow' | 'red') => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800'
      case 'red':
        return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <button
          onClick={fetchCredits}
          disabled={loading}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          title="Refresh"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words min-w-0">
        API Credits
      </h3>
      <p className="text-gray-600 text-sm break-words min-w-0 mb-4">
        Monitor API spending and status
      </p>

      {/* Loading State */}
      {loading && !credits && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Credits Display */}
      {credits && !loading && (
        <div className="space-y-4">
          {/* OpenAI */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">OpenAI</h4>
              {credits.openai.status === 'success' && 
               credits.openai.last_7_days_spending !== undefined && 
               credits.openai.last_30_days_spending !== undefined && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                  getSpendingStatusColor(credits.openai.last_7_days_spending, credits.openai.last_30_days_spending)
                )}`}>
                  Tracking
                </span>
              )}
            </div>
            
            {credits.openai.status === 'success' ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 7 days:</span>
                  <span className="font-medium text-gray-900">
                    {credits.openai.last_7_days_spending !== undefined 
                      ? formatUSD(credits.openai.last_7_days_spending)
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last 30 days:</span>
                  <span className="font-medium text-gray-900">
                    {credits.openai.last_30_days_spending !== undefined 
                      ? formatUSD(credits.openai.last_30_days_spending)
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily average:</span>
                  <span className="font-medium text-gray-900">
                    {credits.openai.last_7_days_spending !== undefined 
                      ? formatUSD(credits.openai.last_7_days_spending / 7)
                      : 'N/A'}
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
                  <p className="text-xs text-blue-800">
                    💡 <a href="https://platform.openai.com/settings/organization/billing/overview" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                      View detailed billing →
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-600">
                {credits.openai.error || 'Failed to load OpenAI costs'}
              </div>
            )}
          </div>

          {/* Replicate */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Replicate</h4>
              {credits.replicate.status === 'success' && credits.replicate.api_active && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Active
                </span>
              )}
            </div>
            
            {credits.replicate.status === 'success' ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-medium text-gray-900">
                    {credits.replicate.account_name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {credits.replicate.account_type || 'N/A'}
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
                  <p className="text-xs text-blue-800">
                    💡 <a href="https://replicate.com/account" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                      View balance & billing →
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-600">
                {credits.replicate.error || 'Failed to check Replicate API'}
              </div>
            )}
          </div>

          {/* Last Updated */}
          <div className="border-t pt-3 text-xs text-gray-500">
            Last updated: {new Date(credits.last_updated).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}
