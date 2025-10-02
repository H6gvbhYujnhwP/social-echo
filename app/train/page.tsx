'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, User, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { TrainForm } from '../../components/TrainForm'
import { UserProfile, getProfile } from '../../lib/localstore'

export default function TrainPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load profile from database API
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
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
  }, [])

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
            className="flex items-center"
          >
            <Link href="/" className="text-2xl font-bold text-white hover:text-purple-300 transition-colors">
              SOCIAL ECHO
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-6 text-sm text-gray-300"
          >
            <Link href="/" className="flex items-center hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
            <span>•</span>
            <a href="#" className="flex items-center hover:text-white transition-colors">
              <User className="h-4 w-4 mr-1" />
              Account
            </a>
            <span>•</span>
            <a href="#" className="flex items-center hover:text-white transition-colors">
              <CreditCard className="h-4 w-4 mr-1" />
              Billing
            </a>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-6">
              Train Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                ECHO
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              These details shape your daily content. You can change them anytime.
              Set up your business profile once and let AI generate personalized LinkedIn posts that sound exactly like you.
            </p>
          </motion.div>

          {/* Training Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 border-b border-white/10">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">Business Profile Setup</h2>
                  <p className="text-purple-200">
                    Tell us about your business so we can create content that resonates with your audience
                  </p>
                </div>
              </div>
              
              <div className="p-8">
                <TrainForm initialProfile={profile || undefined} />
              </div>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid md:grid-cols-3 gap-8"
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
                Create professional LinkedIn posts in your voice with just one click
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Post & Grow</h3>
              <p className="text-gray-300">
                Copy, paste, and watch your LinkedIn engagement soar
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
