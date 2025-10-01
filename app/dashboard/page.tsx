'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, User, CreditCard, ArrowLeft, Sparkles } from 'lucide-react'
import { TodayPanel } from '../../components/TodayPanel'
import { ImagePanel } from '../../components/ImagePanel'
import { FineTunePanel } from '../../components/FineTunePanel'
import { UserProfile, getProfile } from '../../lib/localstore'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFineTune, setShowFineTune] = useState(false)
  const [twist, setTwist] = useState('')
  const [visualPrompt, setVisualPrompt] = useState<string>()

  // Debug: Log visual prompt changes
  useEffect(() => {
    console.log('Dashboard visual prompt updated:', visualPrompt)
  }, [visualPrompt])
  const [regenerateFunction, setRegenerateFunction] = useState<(() => void) | null>(null)

  useEffect(() => {
    const existingProfile = getProfile()
    if (!existingProfile) {
      router.push('/train')
      return
    }
    setProfile(existingProfile)
    setIsLoading(false)
  }, [router])

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
    // Note: Profile changes do NOT trigger automatic regeneration
  }

  const handleRegenerate = (newTwist: string) => {
    setTwist(newTwist)
    // Call regeneration function directly if available
    if (regenerateFunction) {
      regenerateFunction()
    }
    // Don't close the FineTunePanel so users can see the result and make further adjustments
  }

  if (isLoading) {
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

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 border-b border-white/10 backdrop-blur-lg bg-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Link href="/" className="text-2xl font-bold text-white hover:text-purple-300 transition-colors">
              SOCIAL ECHO
            </Link>
            <div className="hidden md:block w-px h-6 bg-white/30"></div>
            <span className="hidden md:block text-white/80">Content Studio</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-6"
          >
            <Link href="/train" className="flex items-center text-white/80 hover:text-white transition-colors">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:block">Train Again</span>
            </Link>
            <button className="flex items-center text-white/80 hover:text-white transition-colors">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:block">Account</span>
            </button>
            <button className="flex items-center text-white/80 hover:text-white transition-colors">
              <CreditCard className="h-4 w-4 mr-2" />
              <span className="hidden sm:block">Billing</span>
            </button>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Today's LinkedIn Pack</h1>
                <p className="text-xl text-purple-200">
                  Generate your daily LinkedIn content for{' '}
                  <span className="font-semibold text-white">{profile.business_name}</span>
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Content Generation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 space-y-8"
            >
              <TodayPanel
                profile={profile}
                twist={twist}
                onFineTuneClick={() => setShowFineTune(true)}
                onVisualPromptChange={setVisualPrompt}
                onRegenerateRequest={setRegenerateFunction}
              />
              
              <ImagePanel
                profile={profile}
                visualPrompt={visualPrompt}
              />
            </motion.div>

            {/* Right Column - Fine-tune Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              {showFineTune && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <button
                    onClick={() => setShowFineTune(false)}
                    className="flex items-center text-white/80 hover:text-white text-sm transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to content
                  </button>
                </motion.div>
              )}
              
              <FineTunePanel
                profile={profile}
                onProfileUpdate={handleProfileUpdate}
                onRegenerate={handleRegenerate}
              />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
