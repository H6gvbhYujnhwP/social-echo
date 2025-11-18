'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AgencyBillingTab } from '@/components/AgencyBillingTab'

type Client = {
  id: string
  email: string
  name: string
  status: 'active' | 'paused'
  lastLogin: string | null
  createdAt: string
  clientCompanyName?: string | null
  clientWebsite?: string | null
  clientBusinessSector?: string | null
}

type AgencyData = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  primaryColor: string
  subdomain: string | null
  activeClientCount: number
  stripeCustomerId: string | null
  clients: Client[]
}

export default function AgencyDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [agency, setAgency] = useState<AgencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'clients' | 'billing'>('clients')
  const [showAddClient, setShowAddClient] = useState(false)
  const [showBranding, setShowBranding] = useState(false)
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientName, setNewClientName] = useState('')
  const [newClientCompanyName, setNewClientCompanyName] = useState('')
  const [newClientWebsite, setNewClientWebsite] = useState('')
  const [newClientBusinessSector, setNewClientBusinessSector] = useState('')

  // Check authorization
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/signin')
      return
    }

    const user = session.user as any
    if (user.role !== 'AGENCY_ADMIN' && user.role !== 'AGENCY_STAFF') {
      router.push('/dashboard')
      return
    }

    loadAgencyData()
  }, [session, status])

  async function loadAgencyData() {
    try {
      const res = await fetch('/api/agency')
      if (!res.ok) throw new Error('Failed to load agency data')
      const data = await res.json()
      setAgency(data)
    } catch (error) {
      console.error('Error loading agency:', error)
      alert('Failed to load agency data')
    } finally {
      setLoading(false)
    }
  }

  async function addClient() {
    if (!newClientEmail.trim()) {
      alert('Email is required')
      return
    }
    
    if (!newClientCompanyName.trim()) {
      alert('Company name is required')
      return
    }
    
    if (!newClientWebsite.trim()) {
      alert('Website is required')
      return
    }
    
    if (!newClientBusinessSector.trim()) {
      alert('Business sector is required')
      return
    }

    try {
      const res = await fetch('/api/agency/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newClientEmail.trim(),
          name: newClientName.trim() || newClientEmail.split('@')[0],
          companyName: newClientCompanyName.trim(),
          website: newClientWebsite.trim(),
          businessSector: newClientBusinessSector.trim()
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to add client')
      }

      const result = await res.json()
      alert(`Client added successfully! New monthly total: £${result.newMonthlyTotal}`)
      
      setNewClientEmail('')
      setNewClientName('')
      setNewClientCompanyName('')
      setNewClientWebsite('')
      setNewClientBusinessSector('')
      setShowAddClient(false)
      loadAgencyData()
    } catch (error: any) {
      console.error('Error adding client:', error)
      alert(error.message || 'Failed to add client')
    }
  }

  async function pauseClient(clientId: string) {
    if (!confirm('Pausing this client will reduce your bill from the next cycle. Continue?')) {
      return
    }

    try {
      const res = await fetch(`/api/agency/clients/${clientId}/pause`, {
        method: 'POST'
      })

      if (!res.ok) throw new Error('Failed to pause client')
      
      alert('Client paused successfully')
      loadAgencyData()
    } catch (error) {
      console.error('Error pausing client:', error)
      alert('Failed to pause client')
    }
  }

  async function resumeClient(clientId: string) {
    try {
      const res = await fetch(`/api/agency/clients/${clientId}/resume`, {
        method: 'POST'
      })

      if (!res.ok) throw new Error('Failed to resume client')
      
      alert('Client resumed successfully')
      loadAgencyData()
    } catch (error) {
      console.error('Error resuming client:', error)
      alert('Failed to resume client')
    }
  }

  async function deleteClient(clientId: string) {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/agency/clients/${clientId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete client')
      
      alert('Client deleted successfully')
      loadAgencyData()
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client')
    }
  }

  async function resetPassword(clientId: string) {
    if (!confirm('Send password reset email to this client?')) {
      return
    }

    try {
      const res = await fetch(`/api/agency/clients/${clientId}/reset-password`, {
        method: 'POST'
      })

      if (!res.ok) throw new Error('Failed to send reset email')
      
      alert('Password reset email sent successfully')
    } catch (error) {
      console.error('Error sending reset email:', error)
      alert('Failed to send reset email')
    }
  }

  async function reset2FA(clientId: string) {
    if (!confirm('This action will remove the customer\'s 2FA security. Proceed only if they\'ve lost access. An email will be sent with re-setup steps.')) {
      return
    }

    try {
      const res = await fetch(`/api/agency/clients/${clientId}/reset-2fa`, {
        method: 'POST'
      })

      if (!res.ok) throw new Error('Failed to reset 2FA')
      
      alert('2FA reset successfully. Client will receive setup instructions via email.')
    } catch (error) {
      console.error('Error resetting 2FA:', error)
      alert('Failed to reset 2FA')
    }
  }

  async function impersonateClient(clientId: string) {
    try {
      const res = await fetch(`/api/agency/clients/${clientId}/impersonate`, {
        method: 'POST',
        credentials: 'include' // Ensure cookies are sent and received
      })

      if (!res.ok) throw new Error('Failed to start impersonation')
      
      const data = await res.json()
      
      // Cookie is now set server-side, but add a small delay to ensure it's processed
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirect to client dashboard
      window.location.href = data.redirectUrl || '/dashboard'
    } catch (error) {
      console.error('Error starting impersonation:', error)
      alert('Failed to start impersonation')
    }
  }

  async function openStripePortal() {
    try {
      const res = await fetch('/api/agency/portal', {
        method: 'POST'
      })

      if (!res.ok) throw new Error('Failed to open billing portal')
      
      const { url } = await res.json()
      window.location.href = url
    } catch (error) {
      console.error('Error opening portal:', error)
      alert('Failed to open billing portal')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading agency dashboard...</p>
        </div>
      </div>
    )
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load agency data</p>
          <button
            onClick={() => loadAgencyData()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const unitPrice = 39 // £39 per client per month
  const monthlyTotal = agency.activeClientCount * unitPrice

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {agency.logoUrl ? (
                <img src={agency.logoUrl} alt={agency.name} className="h-10 w-auto" />
              ) : (
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {agency.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{agency.name}</h1>
                <p className="text-sm text-gray-500">Agency Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Branding Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Branding</h3>
            <div className="flex items-center space-x-3 mb-4">
              {agency.logoUrl ? (
                <img src={agency.logoUrl} alt="Logo" className="h-12 w-12 object-contain" />
              ) : (
                <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                  No Logo
                </div>
              )}
              <div>
                <div className="w-8 h-8 rounded" style={{ backgroundColor: agency.primaryColor }}></div>
              </div>
            </div>
            <button
              onClick={() => setShowBranding(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Branding
            </button>
          </div>

          {/* Clients Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Clients</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{agency.activeClientCount}</p>
            <p className="text-sm text-gray-600">Unlimited capacity</p>
            <button
              onClick={() => setShowAddClient(true)}
              className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Add Client
            </button>
          </div>

          {/* Billing Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Monthly Billing</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">£{monthlyTotal}</p>
            <p className="text-sm text-gray-600">{agency.activeClientCount} clients × £{unitPrice}</p>
            <button
              onClick={openStripePortal}
              className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Manage Billing
            </button>
          </div>
        </div>

        {/* Subdomain Info */}
        {agency.subdomain && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Your branded login:</strong> https://{agency.subdomain}.socialecho.ai/login
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'clients'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Client Management
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'billing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Billing & Subscription
              </button>
            </nav>
          </div>
        </div>

        {/* Clients Table */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Client Management</h2>
            </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agency.clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No clients yet. Click "Add Client" to get started.
                    </td>
                  </tr>
                ) : (
                  agency.clients.map((client) => (
                    <tr key={client.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600">
                          {client.clientCompanyName && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">🏢 {client.clientCompanyName}</span>
                            </div>
                          )}
                          {client.clientWebsite && (
                            <div className="text-gray-500 truncate max-w-xs">
                              🌐 {client.clientWebsite}
                            </div>
                          )}
                          {client.clientBusinessSector && (
                            <div className="text-gray-500">
                              📊 {client.clientBusinessSector}
                            </div>
                          )}
                          {!client.clientCompanyName && (
                            <span className="text-gray-400 italic">Not set</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          client.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {client.lastLogin ? new Date(client.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => impersonateClient(client.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View as
                        </button>
                        <button
                          onClick={() => resetPassword(client.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Reset PW
                        </button>
                        <button
                          onClick={() => reset2FA(client.id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Reset 2FA
                        </button>
                        {client.status === 'active' ? (
                          <button
                            onClick={() => pauseClient(client.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Pause
                          </button>
                        ) : (
                          <button
                            onClick={() => resumeClient(client.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Resume
                          </button>
                        )}
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <AgencyBillingTab />
        )}
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Client</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Client Name"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs font-medium text-yellow-800 mb-2">⚠️ The following details cannot be changed after creation</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newClientCompanyName}
                  onChange={(e) => setNewClientCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Smith & Co Ltd"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website *
                </label>
                <input
                  type="url"
                  value={newClientWebsite}
                  onChange={(e) => setNewClientWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Sector *
                </label>
                <input
                  type="text"
                  value={newClientBusinessSector}
                  onChange={(e) => setNewClientBusinessSector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Accounting, Legal, IT Consulting"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  This adds 1 active client and updates your Stripe subscription quantity. 
                  You'll see a prorated change this billing cycle.
                </p>
                <p className="text-sm text-blue-900 font-medium mt-2">
                  New monthly total: £{(agency.activeClientCount + 1) * unitPrice}
                </p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowAddClient(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addClient}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branding Modal */}
      {showBranding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Branding</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your logo to a hosting service and paste the URL here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <input
                  type="color"
                  defaultValue={agency.primaryColor}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subdomain (optional)
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    defaultValue={agency.subdomain || ''}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="acmeco"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">
                    .socialecho.ai
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Letters and numbers only. Leave blank to use ?brand= parameter instead.
                </p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowBranding(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Branding update functionality coming soon')
                  setShowBranding(false)
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
