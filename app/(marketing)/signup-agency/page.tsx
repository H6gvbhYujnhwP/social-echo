'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Users, Lock, CheckCircle } from 'lucide-react'

export default function AgencySignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Agency details
  const [agencyName, setAgencyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // First client details (immutable)
  const [clientCompanyName, setClientCompanyName] = useState('')
  const [clientWebsite, setClientWebsite] = useState('')
  const [clientBusinessSector, setClientBusinessSector] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!agencyName.trim()) {
      setError('Agency name is required')
      return
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Valid email is required')
      return
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (!clientCompanyName.trim()) {
      setError('First client company name is required')
      return
    }
    
    if (!clientWebsite.trim()) {
      setError('First client website is required')
      return
    }
    
    if (!clientBusinessSector.trim()) {
      setError('First client business sector is required')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup-agency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyName: agencyName.trim(),
          email: email.trim().toLowerCase(),
          password,
          firstClient: {
            companyName: clientCompanyName.trim(),
            website: clientWebsite.trim(),
            businessSector: clientBusinessSector.trim(),
          }
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // Success - redirect to signin
      alert('Agency created successfully! You can now sign in with your credentials.')
      router.push('/signin')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Start Your Agency Account
          </h1>
          <p className="text-xl text-gray-300">
            Get started with 8 free trial posts for your first client. No credit card required.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">What You Get:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">8 free trial posts for your first client</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">£39/month per client after trial</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Manage multiple clients from one dashboard</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Add payment details only after trial ends</span>
            </li>
          </ul>
        </div>

        {/* Signup Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Agency Details Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Your Agency Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Agency Name
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Acme Marketing Agency"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@agency.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="At least 8 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* First Client Details Section */}
            <div className="pt-6 border-t border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Your First Client</h3>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Lock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-200 mb-1">Important: These details cannot be changed</p>
                    <p className="text-xs text-yellow-300/80">
                      To prevent abuse, client company details are locked at creation and cannot be modified later.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client Company Name
                  </label>
                  <input
                    type="text"
                    value={clientCompanyName}
                    onChange={(e) => setClientCompanyName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Smith & Co Ltd"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client Website
                  </label>
                  <input
                    type="url"
                    value={clientWebsite}
                    onChange={(e) => setClientWebsite(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client Business Sector
                  </label>
                  <input
                    type="text"
                    value={clientBusinessSector}
                    onChange={(e) => setClientBusinessSector(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Accounting, Legal Services, IT Consulting"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Your Agency...' : 'Create Agency Account'}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-400 text-center">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-blue-400 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>
            </p>
          </form>
        </div>

        {/* Already have account */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{' '}
            <a href="/signin" className="text-blue-400 hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
