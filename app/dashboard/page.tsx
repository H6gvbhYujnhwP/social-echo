'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Calendar, User, Clock } from 'lucide-react'
import { TodayPanel } from '../../components/TodayPanel'
import { ImagePanel } from '../../components/ImagePanel'
import { LearningProgress, type LearningProgressRef } from '../../components/LearningProgress'
import HistoryDrawer from '../../components/HistoryDrawer'
import TrialExhaustedModal from '../../components/TrialExhaustedModal'
import { TrialCountdown } from '../../components/TrialCountdown'
import { UserProfile, getProfile, getOrCreatePlanner, savePostHistory, type Planner, type PostType } from '../../lib/localstore'
import Link from 'next/link'

// Type for generated draft
export interface GeneratedDraft {
  id?: string // Post ID from database (optional for backward compatibility)
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
  const [userPrompt, setUserPrompt] = useState('')
  const [customisationsLeft, setCustomisationsLeft] = useState(2)
  const [feedbackResetKey, setFeedbackResetKey] = useState(0)
  const learningProgressRef = useRef<LearningProgressRef>(null)
  const isRegeneratingRef = useRef(false) // Guard against double clicks
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generatedImageStyle, setGeneratedImageStyle] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [showTrialBanner, setShowTrialBanner] = useState(false)
  const [usage, setUsage] = useState<any>(null)
  const [showTrialExhaustedModal, setShowTrialExhaustedModal] = useState(false)
  const [isTrialExhausted, setIsTrialExhausted] = useState(false)

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
        // Load profile from database with cache-busting
        const profileResponse = await fetch('/api/profile', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        if (!profileResponse.ok) {
          // No profile - redirect to train
          router.push('/train')
          return
        }
        const profileData = await profileResponse.json()
        setProfile(profileData)
        console.log('Profile loaded:', profileData.business_name)
        
        // Load subscription status
        const subResponse = await fetch('/api/subscription', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (subResponse.ok) {
          const subData = await subResponse.json()
          setSubscription(subData)
          // Show trial banner for both 'trial' and 'trialing' status
          setShowTrialBanner(subData.isTrial === true)
          
          // Check if trial is exhausted
          const remaining = Math.max(0, (subData.usageLimit ?? 0) - (subData.usageCount ?? 0))
          const isTrial = subData.status === 'trial'
          setIsTrialExhausted(isTrial && remaining === 0)
          
          console.log('Subscription loaded:', subData.status, subData.plan, 'isTrial:', subData.isTrial, 'remaining:', remaining)
        }
        
        // Load usage data
        const usageResponse = await fetch('/api/usage', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (usageResponse.ok) {
          const usageData = await usageResponse.json()
          setUsage(usageData)
          console.log('Usage loaded:', usageData.posts_used, '/', usageData.posts_allowance)
        }
        
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
        const postResponse = await fetch(`/api/posts?date=${today}`, {
          cache: 'no-store' // Ensure fresh data
        })
        if (postResponse.ok) {
          const postData = await postResponse.json()
          console.log('[dashboard] Loaded today\'s post:', { id: postData.id, date: postData.date })
          setTodayDraft(postData)
          // Ensure postId is set - try postData.id first, then postData.postId
          const postId = postData.id || postData.postId
          if (postId) {
            console.log('[dashboard] Set currentPostId from database:', postId)
            setCurrentPostId(postId)
          } else {
            console.warn('[dashboard] No postId found in database response:', postData)
          }
        } else {
          console.log('[dashboard] No post found for today:', today)
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

  // Save current draft to history before generating new one
  const saveCurrentToHistory = async () => {
    // Guard: Check if we have a draft and profile
    if (!todayDraft || !profile) {
      console.log('[dashboard] Skipping history save: no draft or profile')
      return
    }

    // Guard: Check if draft has required fields
    if (!todayDraft.headline_options || !todayDraft.post_text || !todayDraft.hashtags) {
      console.log('[dashboard] Skipping history save: draft missing required fields')
      return
    }

    // Guard: Check if arrays are not empty
    if (todayDraft.headline_options.length === 0 || todayDraft.hashtags.length === 0) {
      console.log('[dashboard] Skipping history save: draft has empty arrays')
      return
    }

    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          postType: postTypeMode === 'auto' ? 'information_advice' : postTypeMode,
          tone: profile.tone,
          headlineOptions: todayDraft.headline_options,
          postText: todayDraft.post_text,
          hashtags: todayDraft.hashtags,
          visualPrompt: todayDraft.visual_prompt || '',
          imageUrl: generatedImageUrl || null,
          imageStyle: generatedImageStyle || null,
          isRegeneration: false,
        })
      })

      if (response.ok) {
        console.log('[dashboard] Saved current draft to history')
      } else {
        const errorText = await response.text()
        console.error('[dashboard] Failed to save history:', errorText)
        // Don't throw - just log the error so generation can continue
      }
    } catch (error) {
      console.error('[dashboard] Error saving history:', error)
      // Don't throw - just log the error so generation can continue
    }
  }

  // Generate or regenerate post
  const handleGeneratePost = async (options?: {
    twist?: string
    tone?: string
    keywords?: string
    postType?: PostType
    regenerate?: boolean
    customPrompt?: string
  }) => {
    // Console log to track trigger source
    console.log('[generatePost] Triggered by: USER', options)
    
    if (!profile) return

    // Save current draft to history before generating new one
    // Wrapped in try-catch to ensure generation continues even if history save fails
    try {
      await saveCurrentToHistory()
    } catch (error) {
      console.error('[dashboard] History save failed, but continuing with generation:', error)
    }

    // Reset feedback UI immediately when generating/regenerating
    setFeedbackResetKey(k => k + 1)

    // Set generating state to show spinner
    setIsGenerating(true)

    // Get effective post type
    const effectivePostType = options?.postType || postTypeMode

    try {
      // Build request payload (always force:false for new posts)
      const requestData = {
        business_name: profile.business_name,
        industry: profile.industry,
        tone: options?.tone || profile.tone,
        products_services: profile.products_services,
        target_audience: profile.target_audience,
        usp: profile.usp || '',
        keywords: [
          profile.keywords,
          options?.keywords || '',
          options?.twist || '',
          options?.customPrompt || ''
        ].filter(Boolean).join(', '),
        rotation: profile.rotation,
        post_type: effectivePostType === 'auto' ? 'information_advice' : effectivePostType,
        platform: 'linkedin' as const,
        force: false, // Always false - new posts only
        user_prompt: userPrompt || '',
      }

      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        // Handle specific error cases
        let errorData: any = {}
        try {
          errorData = await response.json()
        } catch {
          errorData = {}
        }

        // Usage limit reached (402 Payment Required)
        if (response.status === 402) {
          // Check if it's a trial exhaustion
          if (errorData.error === 'TRIAL_EXHAUSTED' || errorData.isTrial) {
            setShowTrialExhaustedModal(true)
          } else {
            const message = errorData.message || 'Usage limit reached. Please upgrade your plan.'
            if (confirm(`${message}\n\nWould you like to upgrade now?`)) {
              router.push('/account')
            }
          }
          setIsGenerating(false)
          return
        }

        // Trial expired or access denied (403 Forbidden)
        if (response.status === 403) {
          const message = errorData.message || 'Access denied. Please check your subscription status.'
          if (confirm(`${message}\n\nWould you like to go to your account settings?`)) {
            router.push('/account')
          }
          setIsGenerating(false)
          return
        }

        // Other errors
        throw new Error(errorData.message || `Failed to generate content (HTTP ${response.status})`)
      }

      const data = await response.json()
      
      // Save as today's draft (API already saved to database)
      setTodayDraft(data)
      
      // Get the post ID from the response (API returns it as postId)
      if (data.postId) {
        console.log('[dashboard] Set currentPostId from generation:', data.postId)
        setCurrentPostId(data.postId)
        
        // Fetch customisation usage for this new post
        try {
          const customisationResponse = await fetch(`/api/posts/${data.postId}/customisation-usage`, {
            cache: 'no-store'
          });
          if (customisationResponse.ok) {
            const customisationData = await customisationResponse.json();
            setCustomisationsLeft(customisationData.customisationsLeft || 2);
            console.log('[dashboard] Customisations left:', customisationData.customisationsLeft);
          }
        } catch (err) {
          console.error('[dashboard] Failed to fetch customisation usage:', err);
          setCustomisationsLeft(2); // Default to 2 if fetch fails
        }
      } else {
        console.warn('[dashboard] No postId in generation response:', data)
        setCustomisationsLeft(2); // Default to 2 if no postId
      }
      
      // Also save to localStorage for backward compatibility (temporary)
      const todayKey = getTodayKey()
      localStorage.setItem(todayKey, JSON.stringify(data))
      
      savePostHistory({
        date: new Date().toISOString().split('T')[0],
        postType: effectivePostType === 'auto' ? 'information_advice' : effectivePostType,
        tone: (options?.tone as UserProfile['tone']) || profile.tone,
        headlineOptions: data.headline_options,
        postText: data.post_text,
        hashtags: data.hashtags,
        visualPrompt: data.visual_prompt
      })
      
      // Refresh usage counter after successful generation
      router.refresh()
      
      // Also manually refetch usage and subscription for immediate update
      try {
        const usageResponse = await fetch('/api/usage', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (usageResponse.ok) {
          const usageData = await usageResponse.json()
          setUsage(usageData)
          console.log('[dashboard] Usage updated after generation:', usageData.posts_used, '/', usageData.posts_allowance)
        }
        
        // Also refetch subscription to update usage counter in banner
        const subResponse = await fetch('/api/subscription', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (subResponse.ok) {
          const subData = await subResponse.json()
          setSubscription(subData)
          console.log('[dashboard] Subscription updated after generation:', subData.usageCount, '/', subData.usageLimit)
        }
      } catch (err) {
        console.error('[dashboard] Failed to refetch usage/subscription:', err)
      }
      
      // Clear generating state
      setIsGenerating(false)
      
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate content. Please try again.')
      setIsGenerating(false)
    }
  }

  // Handle regeneration with custom instructions
  const handleRegenerate = async (customInstructions: string) => {
    // Validate input
    const trimmedInstructions = customInstructions.trim()
    if (!trimmedInstructions) {
      alert('Please add a short instruction before regenerating.');
      return;
    }

    if (!currentPostId) {
      console.error('[dashboard] Cannot regenerate: no currentPostId');
      alert('No draft found. Please generate a post first.');
      return;
    }

    // Prevent double clicks
    if (isRegeneratingRef.current) {
      console.log('[dashboard] Regeneration already in progress, ignoring click');
      return;
    }

    // Set in-flight guard
    isRegeneratingRef.current = true;
    setIsGenerating(true);

    // Store previous count for rollback on error
    const previousCount = customisationsLeft;

    try {
      // Call dedicated regenerate endpoint
      const response = await fetch(`/api/posts/${currentPostId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customInstruction: trimmedInstructions
        })
      });

      if (!response.ok) {
        // Parse error
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }

        // Handle specific errors
        if (response.status === 429) {
          alert(errorData.message || "You've used both regenerations for this draft. Generate a new post to continue.");
        } else if (response.status === 404) {
          alert('Draft not found. Generate a new post first.');
        } else if (response.status === 400) {
          alert(errorData.message || 'Invalid request. Please try again.');
        } else if (response.status === 403) {
          alert(errorData.error || 'Access denied. Please check your subscription.');
        } else {
          alert(errorData.message || 'Failed to regenerate content. Please try again.');
        }
        
        // Restore previous count on error
        setCustomisationsLeft(previousCount);
        return;
      }

      const data = await response.json();
      
      // Update draft in place (no scroll jump)
      setTodayDraft(data);
      
      // Update customisations left from server response (source of truth)
      if (typeof data.customisationsLeft === 'number') {
        setCustomisationsLeft(data.customisationsLeft);
        console.log('[dashboard] Customisations left:', data.customisationsLeft);
      } else {
        // Fallback: decrement using functional update
        setCustomisationsLeft((n) => Math.max(0, n - 1));
      }

      // Show success toast
      const regensUsed = 2 - (data.customisationsLeft || 0);
      console.log(`[dashboard] Regeneration successful (${regensUsed}/2 used)`);
      
      // Refresh usage counter
      router.refresh();
      const usageResponse = await fetch('/api/usage', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData);
      }
    } catch (error) {
      console.error('Regeneration error:', error);
      alert('Failed to regenerate content. Please try again.');
      
      // Restore previous count on error
      setCustomisationsLeft(previousCount);
    } finally {
      setIsGenerating(false);
      isRegeneratingRef.current = false; // Clear in-flight guard
    }
  }

  // Restore a previous version from history
  const handleRestoreHistory = async (item: any) => {
    try {
      const response = await fetch('/api/history/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      })

      if (response.ok) {
        const { data } = await response.json()
        
        // Restore to current draft
        setTodayDraft({
          id: data.id,
          headline_options: data.headlineOptions,
          post_text: data.postText,
          hashtags: data.hashtags,
          visual_prompt: data.visualPrompt,
          best_time_uk: '' // Not stored in history
        })
        
        // Set current post ID for regeneration
        setCurrentPostId(data.id)
        console.log('[dashboard] Set currentPostId from history restore:', data.id)
        
        // Set customisations left (default to 2 if not provided)
        const customisationsUsed = data.customisationsUsed || 0
        setCustomisationsLeft(Math.max(0, 2 - customisationsUsed))
        console.log('[dashboard] Set customisationsLeft:', 2 - customisationsUsed)
        
        // Restore image if exists
        if (data.imageUrl) {
          setGeneratedImageUrl(data.imageUrl)
          setGeneratedImageStyle(data.imageStyle)
        } else {
          // Clear image if restoring a draft without image
          setGeneratedImageUrl(null)
          setGeneratedImageStyle(null)
        }
        
        // Close drawer
        setIsHistoryDrawerOpen(false)
        
        console.log('[dashboard] Restored version from history:', data.id)
      } else {
        console.error('[dashboard] Failed to restore history:', await response.text())
        alert('Failed to restore version')
      }
    } catch (error) {
      console.error('[dashboard] Error restoring history:', error)
      alert('Failed to restore version')
    }
  }

  // Preview a previous version (same as restore for now)
  const handlePreviewHistory = (item: any) => {
    // For now, preview is the same as restore
    // In the future, could open a modal to preview without restoring
    handleRestoreHistory(item)
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


      {/* Trial Status Banner */}
      {showTrialBanner && subscription && (
        <div className="relative z-10 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 pointer-events-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <p className="text-sm text-white/70 mb-1">
                    {isTrialExhausted 
                      ? 'Trial complete — upgrade to keep posting' 
                      : (subscription.status === 'trial' ? 'Trial Account' : 'Free Trial Active') + ' — ' + subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) + ' Plan'
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white/90 text-sm font-medium">
                        Posts: {subscription.usageCount}/{subscription.usageLimit}
                      </span>
                      <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${isTrialExhausted ? 'bg-red-400' : 'bg-white'}`}
                          style={{ width: `${Math.min((subscription.usageCount / subscription.usageLimit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    {subscription.trialEnd && (
                      <>
                        <span className="hidden sm:block text-white/50">•</span>
                        <span className="text-white/90 text-sm">
                          {subscription.isTrialExpired ? (
                            <span className="text-red-200 font-semibold">Trial Expired</span>
                          ) : (
                            <>
                              Ends in: <TrialCountdown trialEnd={subscription.trialEnd} className="text-white" />
                            </>
                          )}
                        </span>
                      </>
                    )}
                    {subscription.status === 'trialing' && subscription.currentPeriodEnd && (
                      <>
                        <span className="hidden sm:block text-white/50">•</span>
                        <span className="text-white/90 text-sm">
                          Billing starts: {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short'
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {(subscription.status === 'trialing' || subscription.status === 'trial' || isTrialExhausted) && (
                  <Link
                    href="/account?tab=billing"
                    className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-white/90 transition-colors text-sm"
                  >
                    {isTrialExhausted ? 'Upgrade' : 'Upgrade to Pro'}
                  </Link>
                )}
                <button
                  onClick={() => setShowTrialBanner(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Dismiss banner"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 pointer-events-auto">
        <div className="w-full max-w-[95%] xl:max-w-[90%] 2xl:max-w-[85%] mx-auto">
          <div className="grid lg:grid-cols-2 gap-6 xl:gap-8 2xl:gap-10">
            {/* Left Column: Today's Content */}
            <TodayPanel
              profile={profile}
              todayDraft={todayDraft}
              currentPostId={currentPostId}
              postTypeMode={postTypeMode}
              isGenerating={isGenerating}
              onGenerate={handleGeneratePost}
              onRegenerate={handleRegenerate}
              onPostTypeChange={handlePostTypeChange}
              userPrompt={userPrompt}
              onUserPromptChange={setUserPrompt}
              onFeedbackSubmitted={() => learningProgressRef.current?.refresh()}
              feedbackResetKey={feedbackResetKey}
              usage={usage}
              customisationsLeft={customisationsLeft}
              isTrialExhausted={isTrialExhausted}
              onTrialExhausted={() => setShowTrialExhaustedModal(true)}
              onHistoryClick={() => setIsHistoryDrawerOpen(true)}
            />

            {/* Right Column: Image Generation */}
            <ImagePanel
              visualPrompt={todayDraft?.visual_prompt}
              industry={profile.industry}
              tone={profile.tone}
              postType={postTypeMode === 'auto' ? 'information_advice' : postTypeMode}
              postHeadline={todayDraft?.headline_options?.[0]}
              postText={todayDraft?.post_text}
              autoSelectedType={todayDraft ? undefined : undefined} // Will be calculated in ImagePanel
              onImageGenerated={(imageUrl, imageStyle) => {
                setGeneratedImageUrl(imageUrl)
                setGeneratedImageStyle(imageStyle)
              }}
            />
          </div>

          {/* Learning Progress Section */}
          <div className="mt-8">
            <LearningProgress ref={learningProgressRef} />
          </div>
        </div>
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onRestore={handleRestoreHistory}
        onPreview={handlePreviewHistory}
      />
      
      {/* Trial Exhausted Modal */}
      <TrialExhaustedModal
        open={showTrialExhaustedModal}
        onClose={() => setShowTrialExhaustedModal(false)}
      />
    </div>
  )
}
