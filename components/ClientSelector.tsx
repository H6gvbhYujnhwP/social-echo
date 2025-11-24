'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email: string
}

export function ClientSelector() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const viewingClientId = searchParams?.get('viewingClientId')
  const [clientInfo, setClientInfo] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check if user is agency admin
  const isAgency = session?.user && (
    (session.user as any).role === 'AGENCY_ADMIN' || 
    (session.user as any).role === 'AGENCY_STAFF'
  )

  useEffect(() => {
    // Only load client info if we're viewing a specific client
    if (!isAgency || !viewingClientId) {
      setClientInfo(null)
      return
    }

    async function loadClientInfo() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/agency/clients')
        if (res.ok) {
          const data = await res.json()
          const client = data.clients?.find((c: Client) => c.id === viewingClientId)
          setClientInfo(client || null)
        }
      } catch (error) {
        console.error('Failed to load client info:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadClientInfo()
  }, [isAgency, viewingClientId])

  // Don't show anything if not agency user
  if (!isAgency) return null

  // Don't show if not viewing a client
  if (!viewingClientId) return null

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <span className="text-sm text-blue-700">Loading client information...</span>
        </div>
      </div>
    )
  }

  // Show banner with client info
  return (
    <div className="bg-blue-600 border-b border-blue-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">
            👤 Managing Client:
          </span>
          {clientInfo ? (
            <div className="text-sm text-blue-100">
              <span className="font-semibold text-white">{clientInfo.name}</span>
              <span className="mx-2">•</span>
              <span>{clientInfo.email}</span>
            </div>
          ) : (
            <span className="text-sm text-blue-100">Client ID: {viewingClientId}</span>
          )}
        </div>
        
        <Link
          href="/agency"
          className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
        >
          ← Back to Client Management
        </Link>
      </div>
    </div>
  )
}

// Hook to get the selected client ID from URL params
export function useSelectedClient() {
  const searchParams = useSearchParams()
  return searchParams?.get('viewingClientId')
}
