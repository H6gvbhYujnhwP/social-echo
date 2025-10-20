'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { BackButton } from '@/components/ui/BackButton'
import './styles.css'

interface AgencyBranding {
  name: string
  logoUrl: string | null
  primaryColor: string | null
  subdomain: string | null
}

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [branding, setBranding] = useState<AgencyBranding | null>(null)
  const [loadingBranding, setLoadingBranding] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needs2FA, setNeeds2FA] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Check for password reset success
    const resetSuccess = searchParams.get('reset')
    const cancelled = searchParams.get('cancelled')
    
    if (resetSuccess === 'success') {
      setSuccessMessage('Password reset successful! You can now sign in with your new password.');
    } else if (cancelled === 'true') {
      setSuccessMessage('Your subscription has been cancelled.');
    }

    async function loadBranding() {
      try {
        // Check for agency branding from query parameter
        const brandParam = searchParams.get('brand')
        
        // Check for subdomain (extract from window.location.host)
        const host = window.location.host
        const hostParts = host.split('.')
        let subdomain: string | null = null
        
        // If host is like: acme.socialecho.ai or acme.localhost:3000
        if (hostParts.length >= 3 || (hostParts.length === 2 && host.includes('localhost'))) {
          const potentialSubdomain = hostParts[0]
          // Ignore www and common subdomains
          if (potentialSubdomain && potentialSubdomain !== 'www' && potentialSubdomain !== 'api' && potentialSubdomain !== 'admin') {
            subdomain = potentialSubdomain
          }
        }

        const identifier = brandParam || subdomain

        if (identifier) {
          const response = await fetch(`/api/branding?identifier=${encodeURIComponent(identifier)}`)
          if (response.ok) {
            const data = await response.json()
            setBranding(data)
          }
        }
      } catch (error) {
        console.error('Failed to load branding:', error)
      } finally {
        setLoadingBranding(false)
      }
    }

    loadBranding()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        totpCode: totpCode || undefined,
        redirect: false,
        callbackUrl: '/dashboard'
      })

      if (result?.error) {
        if (result.error === '2FA code required') {
          setNeeds2FA(true)
          setError('Please enter your 2FA code')
        } else {
          setError(result.error)
        }
      } else if (result?.ok) {
        // Sign in successful - check role and redirect accordingly
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        
        const userRole = session?.user?.role
        
        if (userRole === 'MASTER_ADMIN') {
          // MASTER_ADMIN should use admin signin, but redirect to admin anyway
          router.push('/admin')
        } else if (userRole === 'AGENCY_ADMIN' || userRole === 'AGENCY_STAFF') {
          // Agency users go to agency dashboard
          router.push('/agency')
        } else {
          // Regular users and customers go to dashboard
          router.push('/dashboard')
        }
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const primaryColor = branding?.primaryColor || '#3B82F6'

  if (loadingBranding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton label="Back" fallbackUrl="/" />
        </div>
        
        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          {/* Agency Logo or Default Branding */}
          {branding?.logoUrl ? (
            <div className="flex justify-center mb-4">
              <img
                src={branding.logoUrl}
                alt={branding.name}
                className="max-w-[200px] max-h-[80px] object-contain"
              />
            </div>
          ) : (
            <h1 className="text-3xl md:text-3xl font-bold text-blue-600 mb-2">SOCIAL ECHO</h1>
          )}
          <p className="text-gray-800 text-base md:text-base">Sign in to your account</p>
          {branding && (
            <p className="mt-2 text-sm text-gray-500">
              Powered by <span className="font-semibold">{branding.name}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              style={{ 
                outlineColor: primaryColor,
                borderColor: error && !needs2FA ? '#ef4444' : undefined
              }}
              placeholder="you@company.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm md:text-sm font-medium text-gray-900">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium hover:underline"
                style={{ color: primaryColor }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 transition-colors"
              style={{ 
                outlineColor: primaryColor,
                borderColor: error && !needs2FA ? '#ef4444' : undefined
              }}
              placeholder="••••••••"
            />
          </div>

          {needs2FA && (
            <div>
              <label htmlFor="totpCode" className="block text-sm md:text-sm font-medium text-gray-900 mb-1.5">
                2FA Code
              </label>
              <input
                id="totpCode"
                type="text"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                required
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 transition-colors"
                style={{ outlineColor: primaryColor }}
                placeholder="123456"
                maxLength={6}
              />
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">✅ {successMessage}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-3 text-base font-semibold"
            disabled={loading}
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <a 
            href="/forgot-password" 
            className="text-sm hover:underline block"
            style={{ color: primaryColor }}
          >
            Forgot password?
          </a>
          <p className="text-sm text-gray-800">
            Don't have an account?{' '}
            <a 
              href="/signup" 
              className="font-medium hover:underline"
              style={{ color: primaryColor }}
            >
              Sign up
            </a>
          </p>
        </div>

        {/* Powered by Social Echo footer for branded logins */}
        {branding && (
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Powered by{' '}
              <a
                href="https://socialecho.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:text-blue-500"
              >
                Social Echo
              </a>
            </p>
          </div>
        )}
        </div>
        {/* End Form Card */}
      </div>

      {/* Custom CSS for focus rings */}
      <style jsx>{`
        input:focus {
          outline-color: ${primaryColor};
          ring-color: ${primaryColor};
        }
      `}</style>
    </div>
  )
}


// Loading fallback for Suspense
function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

// Main export with Suspense boundary
export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInForm />
    </Suspense>
  )
}
