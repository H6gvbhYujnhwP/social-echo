'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'

interface BillingInfo {
  plan: string
  activeClients: number
  monthlyAmount: number
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  nextBillingDate: string | null
  lastInvoiceStatus: string | null
}

export function AgencyBillingTab() {
  const [billing, setBilling] = useState<BillingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBillingInfo()
  }, [])

  async function loadBillingInfo() {
    try {
      const response = await fetch('/api/agency/billing')
      if (!response.ok) {
        throw new Error('Failed to load billing information')
      }
      const data = await response.json()
      setBilling(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing')
    } finally {
      setLoading(false)
    }
  }

  async function openBillingPortal() {
    try {
      const response = await fetch('/api/agency/portal', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to open billing portal')
      }
      
      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to open billing portal')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <GlassCard className="p-6">
        <p className="text-red-600">{error}</p>
      </GlassCard>
    )
  }

  if (!billing) {
    return (
      <GlassCard className="p-6">
        <p className="text-gray-600">No billing information available</p>
      </GlassCard>
    )
  }

  const pricePerClient = 39
  const nextBillAmount = billing.activeClients * pricePerClient

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-bold mb-4">Current Plan</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Plan</span>
            <span className="font-semibold">Agency — Grow as You Go</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Active Clients</span>
            <span className="font-semibold text-2xl">{billing.activeClients}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Price per Client</span>
            <span className="font-semibold">£{pricePerClient}/month</span>
          </div>
          <div className="border-t pt-4 flex justify-between items-center">
            <span className="text-gray-900 font-semibold">Your next bill</span>
            <span className="text-3xl font-bold text-blue-600">£{nextBillAmount}</span>
          </div>
          {billing.nextBillingDate && (
            <div className="text-sm text-gray-500 text-center">
              Next billing date: {new Date(billing.nextBillingDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Billing Info */}
      <GlassCard className="p-6 bg-blue-50 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">How Billing Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• SocialEcho bills your agency directly based on active clients</li>
          <li>• Your clients are billed by you</li>
          <li>• No Stripe invoices are sent to your clients</li>
          <li>• Adding or removing clients automatically prorates your next invoice</li>
        </ul>
      </GlassCard>

      {/* Last Invoice Status */}
      {billing.lastInvoiceStatus && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-2">Last Invoice</h3>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Status:</span>
            <span className={`font-semibold ${
              billing.lastInvoiceStatus === 'paid' ? 'text-green-600' : 
              billing.lastInvoiceStatus === 'open' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {billing.lastInvoiceStatus.toUpperCase()}
            </span>
          </div>
        </GlassCard>
      )}

      {/* Manage Billing Button */}
      <div className="flex justify-center">
        <button
          onClick={openBillingPortal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Manage Billing & Payment Methods
        </button>
      </div>

      {/* Subscription Details */}
      {billing.stripeSubscriptionId && (
        <GlassCard className="p-4 bg-gray-50">
          <p className="text-xs text-gray-500">
            Subscription ID: {billing.stripeSubscriptionId}
          </p>
        </GlassCard>
      )}
    </div>
  )
}
