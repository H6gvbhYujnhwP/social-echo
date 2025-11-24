'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  email: string
}

export function ClientSelector() {
  const { data: session } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is agency admin
  const isAgency = session?.user && (
    (session.user as any).role === 'AGENCY_ADMIN' || 
    (session.user as any).role === 'AGENCY_STAFF'
  )

  useEffect(() => {
    if (!isAgency) return

    // Load clients from API
    async function loadClients() {
      try {
        const res = await fetch('/api/agency/clients')
        if (res.ok) {
          const data = await res.json()
          setClients(data.clients || [])
          
          // Load saved selection from localStorage
          const saved = localStorage.getItem('selectedClientId')
          if (saved && data.clients.some((c: Client) => c.id === saved)) {
            setSelectedClientId(saved)
          }
        }
      } catch (error) {
        console.error('Failed to load clients:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadClients()
  }, [isAgency])

  const handleClientChange = (clientId: string) => {
    if (clientId === 'none') {
      setSelectedClientId(null)
      localStorage.removeItem('selectedClientId')
      // Navigate to agency page when no client selected
      router.push('/agency')
    } else {
      setSelectedClientId(clientId)
      localStorage.setItem('selectedClientId', clientId)
      // Navigate to dashboard with client ID parameter
      router.push(`/dashboard?viewingClientId=${clientId}`)
    }
  }

  // Don't show selector if not agency user
  if (!isAgency) return null

  // Don't show if still loading
  if (isLoading) return null

  // Don't show if no clients
  if (clients.length === 0) return null

  const selectedClient = clients.find(c => c.id === selectedClientId)

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-blue-900">
            Viewing Client:
          </span>
          <select
            value={selectedClientId || 'none'}
            onChange={(e) => handleClientChange(e.target.value)}
            className="px-4 py-2 border border-blue-300 rounded-lg bg-white text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">-- Select a client --</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedClient && (
          <div className="text-sm text-blue-700">
            Managing: <span className="font-semibold">{selectedClient.name}</span> ({selectedClient.email})
          </div>
        )}
      </div>
    </div>
  )
}

// Hook to get the selected client ID
export function useSelectedClient() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('selectedClientId')
    setSelectedClientId(saved)

    // Listen for storage changes (when selection changes in another tab)
    const handleStorageChange = () => {
      const updated = localStorage.getItem('selectedClientId')
      setSelectedClientId(updated)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return selectedClientId
}
