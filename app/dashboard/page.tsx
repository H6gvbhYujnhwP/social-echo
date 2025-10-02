'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Calendar, User } from 'lucide-react'
import { TodayPanel } from '../../components/TodayPanel'
import { ImagePanel } from '../../components/ImagePanel'
import { FineTunePanel } from '../../components/FineTunePanel'
import { LearningProgress } from '../../components/LearningProgress'
import { UserProfile, getProfile, getOrCreatePlanner, savePostHistory, type Planner, type PostType } from '../../lib/localstore'
import Link from 'next/link'

// Type for generated draft
export interface GeneratedDraft {
  headline_options: string[]
  post_text: string
  hashtags: string[]
  visual_prompt: string
  best_time_uk: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [planner, setPlanner] = useState<Planner | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [todayDraft, setTodayDraft] = useState<GeneratedDraft | null>(null)
  const [currentPostId, setCurrentPostId] = useState<string | null>(null)
  const [postTypeMode, setPostTypeMode] = useState<'auto' | PostType>('auto')
  const [showCustomiseModal, setShowCustomiseModal] = useState(false)

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/signin')
    }
  }, [session, status, router])

  // Get today's date as a key for localStorage
  const getTodayKey = () => {
    const today = new Date()
    return `social-echo-draft-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  }

  // On mount: Load profile, planner, and today's post from database
  useEffect(() => {
    if (status === 'loading' || !session) return
    
    const loadData = async () => {
      try {
        // Load profile from database
        const profileResponse = await fetch('/api/profile')
        if (!profileResponse.ok) {
          // No profile - redirect to train
          router.push('/train')
          return
        }
        const profileData = await profileResponse.json()
        setProfile(profileData)
        
        // Load planner from database
        const plannerResponse = await fetch('/api/planner')
        if (plannerResponse.ok) {
          const plannerData = await plannerResponse.json()
          setPlanner({ version: 1, days: plannerData.days })
        } else {
          // Fallback to localStorage planner
          setPlanner(getOrCreatePlanner())
        }
        
        // Load today's post from database
        const today = new Date().toISOString().split('T')[0]
        const postResponse = await fetch(`/api/posts?date=${today}`)
        if (postResponse.ok) {
          const postData = await postResponse.json()
          setTodayDraft(postData)
          setCurrentPostId(postData.id)
        }
        // If no post for today, that's OK - user hasn't generated yet
        
      } catch (error) {
        console.error('Failed to load data:', error)
        // Fallback to localStorage
        const existingProfile = getProfile()
        if (!existingProfile) {
          router.push('/train')
          return
        }
        setProfile(existingProfile)
        setPlanner(getOrCreatePlanner())
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [status, session, router])

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
    // Note: Profile changes do NOT trigger automatic regeneration
  }

  const handlePostTypeChange = (newPostType: PostType) => {
    setPostTypeMode(newPostType)
  }

  // Generate or regenerate post
  const handleGeneratePost = async (options?: {
    twist?: string
    tone?: string
    keywords?: string
    postType?: PostType
    regenerate?: boolean
  }) => {
    // Console log to track trigger source
    console.log('[generatePost] Triggered by: USER', options)
    
    if (!profile) return

    // Set generating state to show spinner
    setIsGenerating(true)

    // Get effective post type
    const effectivePostType = options?.postType || postTypeMode

    try {
      // Build request payload
      const requestData = {
        business_name: profile.business_name,
        website: profile.website || '',
        industry: profile.industry,
        tone: options?.tone || profile.tone,
        products_services: profile.products_services,
        target_audience: profile.target_audience,
        usp: profile.usp || '',
        keywords: [
          profile.keywords,
          options?.keywords || '',
          options?.twist || ''
        ].filter(Boolean).join(', '),
        rotation: profile.rotation,
        post_type: effectivePostType === 'auto' ? 'informational' : effectivePostType,
        platform: 'linkedin' as const,
        force: options?.regenerate || false,
      }

      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`Failed to generate content (HTTP ${response.status})`)
      }

      const data = await response.json()
      
      // Save as today's draft (API already saved to database)
      setTodayDraft(data)
      
      // Get the post ID from the response (API returns it as postId)
      if (data.postId) {
        setCurrentPostId(data.postId)
      }
      
      // Also save to localStorage for backward compatibility (temporary)
      const todayKey = getTodayKey()
      localStorage.setItem(todayKey, JSON.stringify(data))
      
      savePostHistory({
        date: new Date().toISOString().split('T')[0],
        postType: effectivePostType === 'auto' ? 'informational' : effectivePostType,
        tone: (options?.tone as UserProfile['tone']) || profile.tone,
        headlineOptions: data.headline_options,
        postText: data.post_text,
        hashtags: data.hashtags,
        visualPrompt: data.visual_prompt
      })
      
      // Close modal if open (already closed by handleCustomiseApply)
      setShowCustomiseModal(false)
      
      // Clear generating state
      setIsGenerating(false)
      
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate content. Please try again.')
      setIsGenerating(false)
    }
  }

  const handleCustomiseApply = (options: {
    postType: 'auto' | PostType
    tone: string
    twist: string
    keywords: string
  }) => {
    // Close modal immediately for better UX
    setShowCustomiseModal(false)
    
    // Update post type mode
    setPostTypeMode(options.postType)
    
    // Generate with custom options (will show loading spinner)
    handleGeneratePost({
      postType: options.postType === 'auto' ? undefined : options.postType,
      tone: options.tone,
      twist: options.twist,
      keywords: options.keywords,
      regenerate: true
    })
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
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 border-b border-white/10 backdrop-blur-lg bg-white/5 pointer-events-auto">
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
            <Link href="/planner" className="flex items-center text-white/80 hover:text-white transition-colors">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:block">Planner</span>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8 pointer-events-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Today's Content */}
            <TodayPanel
              profile={profile}
              todayDraft={todayDraft}
              currentPostId={currentPostId}
              postTypeMode={postTypeMode}
              isGenerating={isGenerating}
              onGenerate={handleGeneratePost}
              onPostTypeChange={handlePostTypeChange}
              onOpenCustomise={() => setShowCustomiseModal(true)}
            />

            {/* Right Column: Image Generation */}
            <ImagePanel
              visualPrompt={todayDraft?.visual_prompt}
              industry={profile.industry}
              tone={profile.tone}
            />
          </div>

          {/* Learning Progress Section */}
          <div className="mt-8">
            <LearningProgress />
          </div>
        </div>
      </main>

      {/* Customise Modal */}
      {showCustomiseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full"
          >
            <FineTunePanel
              profile={profile}
              currentPostType={postTypeMode === 'auto' ? undefined : postTypeMode}
              onProfileUpdate={handleProfileUpdate}
              onApply={handleCustomiseApply}
              onClose={() => setShowCustomiseModal(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  )
}
