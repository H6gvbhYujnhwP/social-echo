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
import { TrialCountdown } from '../../components/TrialCountdown'
import { PLAN_METADATA, getPlanMetadata, isUnlimitedPlan } from '@/lib/billing/plan-metadata'

interface Subscription {
  plan: string
  status: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  // v8.6: Pending downgrade state
  pendingPlan?: string | null
  pendingAt?: string | null
  scheduleId?: string | null
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
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'ultimate'>('starter')
  
  // Upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isTrialing, setIsTrialing] = useState(false)
  
  // Cancellation feedback modal
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelComment, setCancelComment] = useState('')

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
      .then(async (data) => {
        setSubscription(data)
        // Initialize selectedPlan with current plan (starter, pro, or ultimate)
        const currentPlan = data.plan?.toLowerCase() || 'starter'
        setSelectedPlan(currentPlan as 'starter' | 'pro' | 'ultimate')
        // Only show trial banner for real Starter trials ('trialing'), not admin trials ('trial')
        setIsTrialing(data.status === 'trialing')
        
        // v8.6: Reconcile pending downgrade state from Stripe if not in database
        if (!data.pendingPlan && data.plan === 'pro') {
          try {
            const reconcileRes = await fetch('/api/account/billing/reconcile-schedule')
            if (reconcileRes.ok) {
              const reconcileData = await reconcileRes.json()
              if (reconcileData.pendingPlan) {
                setSubscription({ ...data, ...reconcileData })
              }
            }
          } catch (err) {
            console.error('Failed to reconcile schedule:', err)
          }
        }
        
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
    // Show feedback modal instead of browser confirm
    setShowCancelModal(true)
  }
  
  const handleCancelWithFeedback = async () => {
    if (!cancelReason) {
      setMessage({ type: 'error', text: 'Please select a reason for cancellation' })
      return
    }

    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason,
          comment: cancelComment
        })
      })

      const data = await res.json()

      if (res.ok) {
        setShowCancelModal(false)
        
        // Show success message WITHOUT logging out
        setMessage({ 
          type: 'success', 
          text: data.message || (data.immediate 
            ? 'Your subscription has been cancelled immediately.' 
            : 'Your subscription will remain active until the end of your billing period. You can continue using Social Echo until then.')
        })
        
        // Refresh subscription data to show cancelled status
        const subRes = await fetch('/api/subscription', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (subRes.ok) {
          const subData = await subRes.json()
          setSubscription(subData)
        }
        
        // Reset modal state
        setCancelReason('')
        setCancelComment('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to cancel subscription' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel subscription' })
    } finally {
      setActionLoading(false)
    }
  }
  
  const handleReactivateSubscription = async () => {
    if (!confirm('Reactivate your subscription? You will continue to be charged at the end of your billing period.')) {
      return
    }

    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/billing/reactivate', {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'Your subscription has been reactivated successfully!'
        })
        
        // Refresh subscription data
        const subRes = await fetch('/api/subscription', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (subRes.ok) {
          const subData = await subRes.json()
          setSubscription(subData)
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reactivate subscription' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reactivate subscription' })
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
    const currentPlanId = subscription?.plan?.toLowerCase() || 'starter'
    const targetPlanId = selectedPlan
    
    // Get plan metadata
    const currentMeta = getPlanMetadata(currentPlanId)
    const targetMeta = getPlanMetadata(targetPlanId)
    
    // Special case: Free trial users need to go to checkout even for same plan
    if (subscription?.status === 'free_trial') {
      setActionLoading(true)
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: targetPlanId })
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error('Failed to create checkout session')
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to start checkout' })
        setActionLoading(false)
      }
      return
    }
    
    // Determine if this is an upgrade or downgrade
    const isUpgrade = targetMeta.priceValue > currentMeta.priceValue
    const isDowngrade = targetMeta.priceValue < currentMeta.priceValue
    
    if (!isUpgrade && !isDowngrade) {
      setMessage({ type: 'error', text: 'Invalid plan change' })
      return
    }
    
    // Handle upgrades (immediate)
    if (isUpgrade) {
      setActionLoading(true)
      setMessage(null)
      
      try {
        const res = await fetch('/api/account/billing/change-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetPlan: targetPlanId })
        })
        
        const data = await res.json()
        
        // Handle SCA (3D Secure) if required
        if (data.requiresAction && data.paymentIntentClientSecret) {
          const { loadStripe } = await import('@stripe/stripe-js')
          const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
          if (!stripe) {
            throw new Error('Failed to load Stripe')
          }
          const { error } = await stripe.confirmCardPayment(data.paymentIntentClientSecret)
          if (error) {
            setMessage({ type: 'error', text: 'Card authentication failed. Please try again.' })
            setActionLoading(false)
            return
          }
        }
        
        if (!res.ok) {
          throw new Error(data.error || 'Upgrade failed')
        }
        
        setMessage({ type: 'success', text: `Upgraded to ${targetMeta.name}! ${targetMeta.price} charged today.` })
        setTimeout(() => window.location.reload(), 1500)
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to upgrade plan' })
        setActionLoading(false)
      }
      return
    }
    
    // Handle downgrades (scheduled at period end)
    if (isDowngrade) {
      setActionLoading(true)
      setMessage(null)
      
      try {
        const res = await fetch('/api/account/billing/downgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetPlan: targetPlanId })
        })
        
        const data = await res.json()
        
        if (res.ok) {
          const effectiveDate = new Date(data.effectiveAt).toLocaleDateString('en-GB')
          setMessage({ 
            type: 'success', 
            text: `Downgrade scheduled. Your plan will switch to ${targetMeta.name} on ${effectiveDate}. Next bill will be ${targetMeta.price}.` 
          })
          window.location.reload()
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to schedule downgrade' })
          setActionLoading(false)
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to schedule downgrade' })
        setActionLoading(false)
      }
      return
    }
  }

  const handleCancelDowngrade = async () => {
    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/billing/cancel-downgrade', {
        method: 'POST'
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Scheduled downgrade cancelled. You will remain on Pro plan.' 
        })
        // Refresh subscription data
        window.location.reload()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to cancel downgrade' })
        setActionLoading(false)
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel downgrade' })
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

        // Handle SCA (3D Secure) if required
        if (data.requiresAction && data.paymentIntentClientSecret) {
          const { loadStripe } = await import('@stripe/stripe-js')
          const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
          if (!stripe) {
            throw new Error('Failed to load Stripe')
          }
          const { error } = await stripe.confirmCardPayment(data.paymentIntentClientSecret)
          if (error) {
            setMessage({ type: 'error', text: 'Card authentication failed. Please try again.' })
            return
          } else {
            setMessage({ type: 'success', text: 'Payment confirmed. You\'re on Pro!' })
            // Refresh to show updated subscription
            setTimeout(() => window.location.reload(), 1500)
            return
          }
        }

        if (!res.ok) {
          throw new Error(data.error || 'Upgrade failed')
        }

        // Success - redirect to account page with success message
        setMessage({ type: 'success', text: 'You\'re on Pro! £49.99 charged today.' })
        setTimeout(() => window.location.href = '/account?tab=billing&upgraded=pro', 1500)
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

  const currentPlan = subscription?.plan?.toLowerCase() || 'starter'
  const planMeta = getPlanMetadata(currentPlan)
  const isPro = currentPlan === 'pro'
  const isUltimate = currentPlan === 'ultimate'
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
                  Free trial active — Ends in: <TrialCountdown trialEnd={trialEndDate} className="text-white" />
                </p>
                <p className="text-white/80 text-xs sm:text-sm mt-1">
                  You'll be billed on {trialEndDate.toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
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
                      {planMeta.name} Plan
                    </h2>
                    <p className="text-white/70">
                      {subscription?.status === 'free_trial' ? 'Free Trial' : planMeta.price}
                    </p>
                    {isUltimate && (
                      <p className="text-purple-300 text-sm mt-1 font-medium">
                        ✨ Unlimited Posts
                      </p>
                    )}
                    {subscription?.status !== 'free_trial' && renewalDate && (
                      <p className="text-white/60 text-sm mt-2">
                        {subscription?.pendingPlan && subscription?.pendingAt
                          ? `Scheduled downgrade to ${getPlanMetadata(subscription.pendingPlan).name} from ${new Date(subscription.pendingAt).toLocaleDateString('en-GB')}`
                          : subscription?.cancelAtPeriodEnd 
                          ? `Cancels on ${renewalDate.toLocaleDateString('en-GB')}`
                          : `Renews on ${renewalDate.toLocaleDateString('en-GB')}`
                        }
                      </p>
                    )}
                    {subscription?.status === 'free_trial' && (
                      <p className="text-purple-300 text-sm mt-2 font-medium">
                        🎉 30 posts included - No payment required yet
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscription?.status === 'active' 
                        ? 'bg-green-500/20 text-green-300'
                        : subscription?.status === 'trialing' || subscription?.status === 'free_trial'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {subscription?.status === 'trialing' || subscription?.status === 'free_trial' ? 'free_trial' : subscription?.status || 'Active'}
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
              {/* Pending Downgrade Banner (v8.6) */}
              {subscription?.pendingPlan && subscription?.pendingAt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-yellow-500/20 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Downgrade Scheduled</p>
                        <p className="text-white/80 text-sm mt-1">
                          Your plan will switch to {getPlanMetadata(subscription.pendingPlan).name} on {new Date(subscription.pendingAt).toLocaleDateString('en-GB')}. You'll keep {planMeta.name} benefits until then.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCancelDowngrade}
                      disabled={actionLoading}
                      className="bg-white/20 hover:bg-white/30 text-white font-medium py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap ml-4"
                    >
                      {actionLoading ? 'Cancelling...' : 'Cancel Downgrade'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Plan Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-bold text-white mb-4">Manage Plan</h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    {/* Render all three plans */}
                    {Object.values(PLAN_METADATA).map((plan) => {
                      const isCurrent = currentPlan === plan.id
                      const isPending = subscription?.pendingPlan === plan.id
                      
                      return (
                        <label 
                          key={plan.id}
                          className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <input
                            type="radio"
                            name="plan"
                            value={plan.id}
                            checked={selectedPlan === plan.id}
                            onChange={(e) => setSelectedPlan(e.target.value as 'starter' | 'pro' | 'ultimate')}
                            disabled={!!subscription?.pendingPlan}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              {plan.name} Plan
                              {isCurrent && (
                                <span className="ml-2 text-green-400 text-sm">(current)</span>
                              )}
                              {isPending && subscription?.pendingAt && (
                                <span className="ml-2 text-yellow-400 text-sm">(scheduled at renewal)</span>
                              )}
                            </p>
                            <p className="text-white/60 text-sm">{plan.price} • {plan.features}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                 {!subscription?.pendingPlan && (
                   <button
                      onClick={handleChangePlan}
                      disabled={actionLoading || (selectedPlan === subscription?.plan && subscription?.status !== 'free_trial')}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {actionLoading ? (subscription?.status === 'free_trial' ? 'Redirecting to checkout...' : 'Changing...') : (subscription?.status === 'free_trial' ? 'Upgrade to Paid Plan' : 'Change Plan')}
                    </button>
                 )}
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

              {/* Cancel/Reactivate Subscription */}
              {/* Always show - users can cancel even with scheduled downgrades */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`backdrop-blur-lg rounded-xl p-6 border ${
                    subscription?.cancelAtPeriodEnd && !subscription?.pendingPlan
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <h3 className="text-xl font-bold text-white mb-2">
                    {subscription?.cancelAtPeriodEnd && !subscription?.pendingPlan ? 'Subscription Cancelled' : 'Cancel Subscription'}
                  </h3>
                  
                  {subscription?.cancelAtPeriodEnd && !subscription?.pendingPlan ? (
                  <>
                    <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-4 mb-4">
                      <p className="text-yellow-300 font-medium mb-2">
                        Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-white/70 text-sm">
                        You can continue using Social Echo until then. Changed your mind?
                      </p>
                    </div>
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {actionLoading ? 'Reactivating...' : 'Reactivate Subscription'}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-white/70 mb-4">
                      {subscription?.status === 'trialing'
                        ? 'Cancelling will end your trial immediately.'
                        : 'You will retain access until the end of your billing period.'}
                    </p>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={actionLoading}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {actionLoading ? 'Processing...' : 'Cancel Subscription'}
                    </button>
                  </>                  )}
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
      
      {/* Cancellation Feedback Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full border border-white/10 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white mb-2">We're Sorry to See You Go</h3>
            <p className="text-white/70 mb-6">Before you cancel, please help us improve by sharing why you're leaving:</p>
            
            <div className="space-y-3 mb-6">
              {[
                { value: 'too_expensive', label: '💰 Too expensive' },
                { value: 'not_using', label: '⏰ Not using it enough' },
                { value: 'missing_features', label: '🔧 Missing features I need' },
                { value: 'switching', label: '🔄 Switching to another service' },
                { value: 'other', label: '📝 Other reason' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCancelReason(option.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    cancelReason === option.value
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <textarea
              placeholder="Any additional feedback? (optional)"
              value={cancelComment}
              onChange={(e) => setCancelComment(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-white/40 mb-6 focus:outline-none focus:border-purple-500 resize-none"
              rows={3}
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                  setCancelComment('')
                }}
                disabled={actionLoading}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelWithFeedback}
                disabled={!cancelReason || actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
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

