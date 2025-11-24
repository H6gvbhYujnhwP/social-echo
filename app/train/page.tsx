'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import Container from '../../components/layout/Container'
import { TrainForm } from '../../components/TrainForm'
import { RssFeedManager } from '../../components/RssFeedManager'
import { UserProfile, getProfile } from '../../lib/localstore'
import { OnboardingToggle } from '../../components/onboarding/OnboardingToggle'
import { OnboardingOrchestrator } from '../../components/onboarding/OnboardingOrchestrator'

function TrainPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewingClientId = searchParams?.get('viewingClientId')
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication - redirect to signin if not logged in
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/signin?callbackUrl=/train')
    }
  }, [session, status, router])

  useEffect(() => {
    // Load profile from database API
    const loadProfile = async () => {
      try {
        // Build URL with viewingClientId if present
        const url = viewingClientId 
          ? `/api/profile?viewingClientId=${viewingClientId}`
          : '/api/profile'
        
        const response = await fetch(url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          console.log('Profile loaded for editing:', data.business_name)
        } else if (response.status === 404) {
          // No profile yet - that's OK
          setProfile(null)
        } else {
          // Fallback to localStorage if API fails
          const existingProfile = getProfile()
          setProfile(existingProfile)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        // Fallback to localStorage
        const existingProfile = getProfile()
        setProfile(existingProfile)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProfile()
  }, [viewingClientId])

  // Show loading spinner while checking authentication or loading profile
  if (status === 'loading' || isLoading || !session) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Onboarding Trainer */}
      <OnboardingOrchestrator />
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-4 sm:py-6 border-b border-white/10 backdrop-blur-lg bg-white/5">
        <Container className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link href="/" className="text-xl sm:text-2xl font-bold text-white hover:text-purple-300 transition-colors break-words min-w-0">
              SOCIAL ECHO
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm text-gray-300"
          >
            <OnboardingToggle />
            <span>•</span>
            <Link href="/dashboard" className="flex items-center hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <span>•</span>
            <Link href="/account" className="flex items-center hover:text-white transition-colors">
              <User className="h-4 w-4 mr-1" />
              Account
            </Link>
          </motion.div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-8 sm:py-12">
        <Container className="max-w-4xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 break-words min-w-0 px-4">
              Train Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                ECHO
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed break-words px-4">
              These details shape your daily content. You can change them anytime.
              Set up your business profile once and let AI generate personalized social posts that sound exactly like you.
            </p>
          </motion.div>

          {/* Training Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden min-w-0">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 sm:p-6 lg:p-8 border-b border-white/10">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 break-words">Business Profile Setup</h2>
                  <p className="text-sm sm:text-base text-purple-200 break-words">
                    Tell us about your business so we can create content that resonates with your audience
                  </p>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 lg:p-8">
                <TrainForm initialProfile={profile || undefined} />
              </div>
            </div>
          </motion.div>

          {/* RSS Feed Manager */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8"
          >
            <RssFeedManager />
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-8"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <button
                onClick={() => {
                  // Trigger form submission by finding and clicking the form's submit button
                  const form = document.querySelector('form')
                  if (form) {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                    form.dispatchEvent(submitEvent)
                  }
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Save & Start Creating Content
              </button>
              <p className="text-center text-sm text-white/60 mt-4">
                You can update these details anytime from your dashboard
              </p>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Train Once</h3>
              <p className="text-gray-300">
                Set up your business profile with your industry, tone, and target audience
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Generate Daily</h3>
              <p className="text-gray-300">
                Create professional social media posts in your voice with just one click
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Post & Grow</h3>
              <p className="text-gray-300">
                Copy, paste, and watch your social media engagement soar
              </p>
            </div>
          </motion.div>
        </Container>
      </main>
    </div>
  )
}

// Wrapper component with Suspense boundary for useSearchParams
export default function TrainPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <TrainPageContent />
    </Suspense>
  )
}
