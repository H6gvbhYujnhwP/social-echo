'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { CreditCard, Mail, Lock, User, Calendar, AlertCircle, Shield, FileText, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Container from '../../components/layout/Container'
import UpgradeModal from '../../components/UpgradeModal'

interface Subscription {
  plan: string
  status: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
}

interface Invoice {
  id: string
  date: string
  amount: number
  currency: string
  status: string
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
  number: string | null
}

type TabType = 'overview' | 'security' | 'billing'

function AccountPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [show2FASetup, setShow2FASetup] = useState(false)
  
  // Plan change
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>('starter')
  
  // Upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isTrialing, setIsTrialing] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/signin')
      return
    }

    // Redirect agency users to their billing page
    const user = session.user as any
    if (user.role === 'AGENCY_ADMIN' || user.role === 'AGENCY_STAFF') {
      router.push('/agency')
      return
    }

    // Get tab from URL
    const tab = searchParams?.get('tab') as TabType
    if (tab && ['overview', 'security', 'billing'].includes(tab)) {
      setActiveTab(tab)
    }

    // Check for upgrade success
    const upgraded = searchParams?.get('upgraded')
    if (upgraded === 'pro') {
      setMessage({ type: 'success', text: 'You\'re now on Pro! £49.99 charged today. Check your email for details.' })
    }

    // Fetch subscription data
    fetch('/api/subscription', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    })
      .then(res => res.json())
      .then(data => {
        setSubscription(data)
        setSelectedPlan(data.plan === 'pro' ? 'pro' : 'starter')
        // Check for both Stripe trials ('trialing') and admin trials ('trial')
        setIsTrialing(data.status === 'trialing' || data.status === 'trial')
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch subscription:', err)
        setLoading(false)
      })
    
    // Fetch invoices if on billing tab
    if (activeTab === 'billing') {
      fetchInvoices()
    }
  }, [session, status, router, searchParams, activeTab])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/account/billing/invoices')
      const data = await res.json()
      if (data.invoices) {
        setInvoices(data.invoices)
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to change password' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/2fa/initiate', {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setShow2FASetup(true)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to initiate 2FA' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to initiate 2FA' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken, secret })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: '2FA enabled successfully' })
        setTwoFactorEnabled(true)
        setShow2FASetup(false)
        setVerifyToken('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid verification code' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to verify 2FA' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return
    }

    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/2fa/disable', {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: '2FA disabled successfully' })
        setTwoFactorEnabled(false)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to disable 2FA' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to disable 2FA' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of your billing period.')) {
      return
    }

    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/billing/cancel', {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok) {
        // Show success message
        setMessage({ 
          type: 'success', 
          text: data.immediate 
            ? 'Your plan has been cancelled. You\'ve been logged out.' 
            : 'Your plan will cancel at the end of your billing period. You\'ve been logged out.'
        })
        
        // Wait 2 seconds for user to see the message, then logout
        setTimeout(async () => {
          await signOut({ callbackUrl: '/signin?cancelled=true' })
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to cancel subscription' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel subscription' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubscribe = async () => {
    // For trial users, create a checkout session
    setActionLoading(true)
    setMessage(null)

    try {
      // Convert plan name to Stripe format (starter -> SocialEcho_Starter)
      const stripePlan = `SocialEcho_${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`
      
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: stripePlan })
      })

      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to create checkout session')
        setMessage({ type: 'error', text: errorMsg })
        setActionLoading(false)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create checkout session' })
      setActionLoading(false)
    }
  }

  const handleChangePlan = async () => {
    // Check if this is an upgrade from Starter to Pro
    if (subscription?.plan === 'starter' && selectedPlan === 'pro') {
      // Show upgrade modal for custom upgrade flow
      setShowUpgradeModal(true)
      return
    }

    // For other plan changes (downgrades), use the portal
    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/billing/portal', {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: 'Failed to open billing portal' })
        setActionLoading(false)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to open billing portal' })
      setActionLoading(false)
    }
  }

  const handleUpgradeConfirm = async () => {
    try {
      // If user has an active subscription, use change-plan for proration
      if (subscription && ['active', 'trialing'].includes(subscription.status)) {
        const res = await fetch('/api/account/billing/change-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetPlan: 'pro' })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Upgrade failed')
        }

        // Success - redirect to account page with success message
        window.location.href = '/account?tab=billing&upgraded=pro'
      } else {
        // No active subscription - redirect to Stripe Checkout
        const res = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: 'SocialEcho_Pro' })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Checkout failed')
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url
        }
      }
    } catch (error) {
      throw error
    }
  }

  const handleUpdatePaymentMethod = async () => {
    setActionLoading(true)

    try {
      const res = await fetch('/api/account/billing/portal', {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: 'Failed to open billing portal' })
        setActionLoading(false)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to open billing portal' })
      setActionLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  const isPro = subscription?.plan?.toLowerCase().includes('pro')
  const trialEndDate = subscription?.trialEnd ? new Date(subscription.trialEnd) : null
  const renewalDate = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 sm:py-6 border-b border-white/10 backdrop-blur-lg bg-white/5">
        <Container className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Link href="/" className="text-xl sm:text-2xl font-bold text-white hover:text-purple-300 transition-colors break-words min-w-0">
              SOCIAL ECHO
            </Link>
            <div className="hidden md:block w-px h-6 bg-white/30"></div>
            <span className="hidden md:block text-white/80 break-words">Account Settings</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 sm:space-x-6 text-sm sm:text-base"
          >
            <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/planner" className="text-white/80 hover:text-white transition-colors">
              Planner
            </Link>
          </motion.div>
        </Container>
      </header>

      {/* Trial Banner */}
      {isTrialing && trialEndDate && (
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500">
          <Container className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-white font-semibold text-sm sm:text-base break-words min-w-0">
                  Free trial active — You'll be billed on {trialEndDate.toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} unless you cancel.
                </p>
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* Message Banner */}
      {message && (
        <div className={`px-4 sm:px-6 py-3 ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <Container className="flex items-center justify-between gap-4">
            <p className="text-white font-medium text-sm sm:text-base break-words min-w-0 flex-1">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="text-white hover:text-white/80"
            >
              ✕
            </button>
          </Container>
        </div>
      )}

      {/* Main Content */}
      <main className="py-6 sm:py-8">
        <Container>
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-white/5 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm sm:text-base ${
                activeTab === 'overview'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm sm:text-base ${
                activeTab === 'security'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-md font-medium transition-colors text-sm sm:text-base ${
                activeTab === 'billing'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Billing
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Plan Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {subscription?.plan ? (subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)) : 'Starter'} Plan
                    </h2>
                    <p className="text-white/70">
                      {isPro ? '£49.99/month' : '£29.99/month'}
                    </p>
                    {renewalDate && (
                      <p className="text-white/60 text-sm mt-2">
                        {subscription?.cancelAtPeriodEnd 
                          ? `Cancels on ${renewalDate.toLocaleDateString('en-GB')}`
                          : `Renews on ${renewalDate.toLocaleDateString('en-GB')}`
                        }
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscription?.status === 'active' 
                        ? 'bg-green-500/20 text-green-300'
                        : subscription?.status === 'trialing'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {subscription?.status === 'trialing' ? 'Trial' : subscription?.status || 'Active'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Account Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center break-words min-w-0">
                  <User className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="break-words min-w-0">Account Details</span>
                </h3>
                <div className="space-y-4">
                  <div className="min-w-0">
                    <label className="text-white/60 text-sm">Email</label>
                    <p className="text-white break-all">{session?.user?.email}</p>
                  </div>
                  <div className="min-w-0">
                    <label className="text-white/60 text-sm">Name</label>
                    <p className="text-white break-words">{session?.user?.name}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Change */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="text-white/80 text-sm block mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-white/80 text-sm block mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="text-white/80 text-sm block mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                      minLength={8}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </motion.div>

              {/* 2FA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Two-Factor Authentication (2FA)
                </h3>
                
                {!twoFactorEnabled && !show2FASetup && (
                  <div>
                    <p className="text-white/70 mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button
                      onClick={handleEnable2FA}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Setting up...' : 'Enable 2FA'}
                    </button>
                  </div>
                )}

                {show2FASetup && (
                  <div className="space-y-4">
                    <p className="text-white/70">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                    {qrCode && (
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
                      </div>
                    )}
                    <form onSubmit={handleVerify2FA} className="space-y-4">
                      <div>
                        <label className="text-white/80 text-sm block mb-2">Enter 6-digit code</label>
                        <input
                          type="text"
                          value={verifyToken}
                          onChange={(e) => setVerifyToken(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="000000"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading ? 'Verifying...' : 'Verify & Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShow2FASetup(false)}
                          className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {twoFactorEnabled && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-green-400 font-medium">2FA is enabled</p>
                    </div>
                    <p className="text-white/70 mb-4">
                      Your account is protected with two-factor authentication.
                    </p>
                    <button
                      onClick={handleDisable2FA}
                      disabled={actionLoading}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Plan Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-bold text-white mb-4">Manage Plan</h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/20 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="plan"
                        value="starter"
                        checked={selectedPlan === 'starter'}
                        onChange={(e) => setSelectedPlan(e.target.value as 'starter' | 'pro')}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">Starter Plan</p>
                        <p className="text-white/60 text-sm">£29.99/month • 8 posts per month</p>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/20 cursor-pointer hover:bg-white/10 transition-colors">
                      <input
                        type="radio"
                        name="plan"
                        value="pro"
                        checked={selectedPlan === 'pro'}
                        onChange={(e) => setSelectedPlan(e.target.value as 'starter' | 'pro')}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">Pro Plan</p>
                        <p className="text-white/60 text-sm">£49.99/month • 20 posts per month</p>
                      </div>
                    </label>
                  </div>
                 <button
                   onClick={isTrialing ? handleSubscribe : handleChangePlan}
                   disabled={actionLoading || (!isTrialing && selectedPlan === subscription?.plan)}
                   className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                   >
                     {actionLoading ? (isTrialing ? 'Loading...' : 'Changing...') : (isTrialing ? 'Subscribe' : 'Change Plan')}
                   </button>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-bold text-white mb-4">Payment Method</h3>
                <button
                  onClick={handleUpdatePaymentMethod}
                  disabled={actionLoading}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {actionLoading ? 'Loading...' : 'Update Payment Method'}
                </button>
              </motion.div>

              {/* Invoices */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center break-words min-w-0">
                  <FileText className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="break-words min-w-0">Invoices</span>
                </h3>
                {invoices.length > 0 ? (
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/60 text-xs sm:text-sm py-2 px-2">Date</th>
                          <th className="text-left text-white/60 text-xs sm:text-sm py-2 px-2">Amount</th>
                          <th className="text-left text-white/60 text-xs sm:text-sm py-2 px-2">Status</th>
                          <th className="text-right text-white/60 text-xs sm:text-sm py-2 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b border-white/5">
                            <td className="text-white py-3 px-2 text-xs sm:text-sm whitespace-nowrap">
                              {new Date(invoice.date).toLocaleDateString('en-GB')}
                            </td>
                            <td className="text-white py-3 px-2 text-xs sm:text-sm whitespace-nowrap">
                              {invoice.currency} {invoice.amount.toFixed(2)}
                            </td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
                                invoice.status === 'paid'
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {invoice.status}
                              </span>
                            </td>
                            <td className="text-right py-3 px-2 space-x-2 whitespace-nowrap">
                              {invoice.hostedInvoiceUrl && (
                                <a
                                  href={invoice.hostedInvoiceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm"
                                >
                                  View
                                </a>
                              )}
                              {invoice.invoicePdf && (
                                <a
                                  href={invoice.invoicePdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm"
                                >
                                  PDF
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-white/60">No invoices found</p>
                )}
              </motion.div>

              {/* Cancel Subscription */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-red-500/10 backdrop-blur-lg rounded-xl p-6 border border-red-500/30"
              >
                <h3 className="text-xl font-bold text-white mb-2">Cancel Subscription</h3>
                <p className="text-white/70 mb-4">
                  {subscription?.status === 'trialing'
                    ? 'Cancelling will end your trial immediately.'
                    : 'You will retain access until the end of your billing period.'}
                </p>
                <button
                  onClick={handleCancelSubscription}
                  disabled={actionLoading || subscription?.cancelAtPeriodEnd}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {subscription?.cancelAtPeriodEnd 
                    ? 'Already Cancelled' 
                    : actionLoading 
                    ? 'Cancelling...' 
                    : 'Cancel Subscription'}
                </button>
              </motion.div>
            </div>
          )}
        </Container>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onConfirm={handleUpgradeConfirm}
        isTrialing={isTrialing}
      />
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
        />
      </div>
    }>
      <AccountPageInner />
    </Suspense>
  )
}

