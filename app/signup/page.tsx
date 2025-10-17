'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import './styles.css'
import { signIn } from 'next-auth/react'

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') // Get plan from URL
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1: Create account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, businessName })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      // Check if reactivation is required
      if (data.reactivationRequired) {
        // User has a canceled account - redirect to reactivation flow
        setError('');
        
        // Sign in with existing credentials
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false
        });

        if (signInResult?.error) {
          throw new Error('Your account exists but the password is incorrect. Please use the correct password or reset it.');
        }

        // Redirect to checkout to reactivate subscription
        const planToUse = plan || 'SocialEcho_Starter_Monthly';
        const isStarterPlan = planToUse.toLowerCase().includes('starter');
        
        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            planKey: planToUse,
            withTrial: isStarterPlan
          })
        });

        const checkoutData = await checkoutRes.json();

        if (!checkoutRes.ok || checkoutData.error) {
          throw new Error(checkoutData.error || 'Failed to create reactivation checkout');
        }

        // Redirect to Stripe Checkout for reactivation
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
      }

      // Step 2: Auto sign-in
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (signInResult?.error) {
        throw new Error('Account created but sign-in failed. Please sign in manually.')
      }

      // Step 3: Redirect based on plan
      if (plan) {
        // If plan is selected, redirect to Stripe Checkout
        // Enable trial for Starter plan
        const isStarterPlan = plan.toLowerCase().includes('starter');
        
        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            planKey: plan,
            withTrial: isStarterPlan // Enable 1-day trial for Starter
          })
        })

        const checkoutData = await checkoutRes.json()

        if (!checkoutRes.ok || checkoutData.error) {
          throw new Error(checkoutData.error || 'Failed to create checkout session')
        }

        // Redirect to Stripe Checkout
        if (checkoutData.url) {
          window.location.href = checkoutData.url
          return
        }
      }

      // No plan selected, redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-3xl font-bold text-blue-600 mb-2">SOCIAL ECHO</h1>
          <p className="text-gray-800 text-base md:text-base">Create your account</p>
          {plan && (
            <div className={`mt-3 p-3 rounded-md ${
              plan.toLowerCase().includes('starter')
                ? 'bg-green-50 border border-green-200'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm font-semibold ${
                plan.toLowerCase().includes('starter') ? 'text-green-800' : 'text-blue-800'
              }`}>
                Selected Plan: {plan.replace('SocialEcho_', '').replace('_', ' ')}
              </p>
              <p className={`text-xs mt-1 ${
                plan.toLowerCase().includes('starter') ? 'text-green-600' : 'text-blue-600'
              }`}>
                {plan.toLowerCase().includes('starter')
                  ? '🎉 1-day free trial - You\'ll be billed in 24h unless you cancel'
                  : 'You\'ll be redirected to payment after signup'
                }
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm md:text-sm font-medium text-gray-900 mb-1.5">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="businessName" className="block text-sm md:text-sm font-medium text-gray-900 mb-1.5">
              Business name <span className="text-gray-600 text-xs">(optional)</span>
            </label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 transition-colors"
              placeholder="Coffee Shop ABC Ltd (optional)"
            />
            <p className="text-xs text-gray-700 mt-1.5">For invoices and billing</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm md:text-sm font-medium text-gray-900 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 transition-colors"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm md:text-sm font-medium text-gray-900 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 transition-colors"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-700 mt-1.5">At least 8 characters</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-3 text-base font-semibold"
            disabled={loading}
          >
            {loading 
              ? (plan ? 'Creating account & redirecting to payment...' : 'Creating account...') 
              : (plan ? 'Create Account & Continue to Payment' : 'Create Account')
            }
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-800">
            Already have an account?{' '}
            <a href="/signin" className="text-blue-600 font-medium hover:underline">
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-700">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .<br />
            Subscriptions bill monthly until canceled.<br />
            No refunds within the first 30 days.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
}
