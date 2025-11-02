'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useOnboarding } from './OnboardingProvider'
import { OnboardingModal } from './OnboardingModal'
import { SpotlightTooltip } from './SpotlightTooltip'
import { ProfileCompleteCelebration } from './ProfileCompleteCelebration'
import { CelebrationScreen } from './CelebrationScreen'
import { ProgressIndicator } from './ProgressIndicator'
import { Sparkles, Target, Briefcase, MessageSquare, Users, Lightbulb, FileText, CheckCircle, Zap, ThumbsUp, Image as ImageIcon, TrendingUp } from 'lucide-react'

export function OnboardingOrchestrator() {
  const {
    isActive,
    currentStep,
    totalSteps,
    completedSteps,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding,
    setCurrentPage,
  } = useOnboarding()

  const pathname = usePathname()

  // Update current page in context
  useEffect(() => {
    setCurrentPage(pathname)
  }, [pathname, setCurrentPage])

  if (!isActive) return null

  // Render step based on current step number
  const renderStep = () => {
    switch (currentStep) {
      // PHASE 1: WELCOME (Steps 1-2)
      case 1:
        return (
          <OnboardingModal showProgress={true} fullScreen={false}>
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome to Social Echo!
              </h2>
              <p className="text-xl text-gray-300 mb-6 max-w-lg">
                You're about to train your personal AI assistant to create
                professional LinkedIn posts in your unique voice.
              </p>
              <p className="text-lg text-gray-400 mb-8">
                This will take about <strong className="text-purple-400">5 minutes</strong>, and you only need to do it once.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={nextStep}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:shadow-lg transition-all"
                >
                  Start Training
                </button>
                <button
                  onClick={skipOnboarding}
                  className="px-8 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </OnboardingModal>
        )

      case 2:
        return (
          <OnboardingModal showProgress={true} fullScreen={false}>
            <div className="py-8">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                How Social Echo Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/10 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Train Your Echo
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">5 minutes</p>
                  <p className="text-gray-400">
                    Tell us about your business, tone, and audience
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Generate Daily Posts
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">30 seconds</p>
                  <p className="text-gray-400">
                    AI creates personalized LinkedIn posts + images
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Post & Grow
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">1 click</p>
                  <p className="text-gray-400">
                    Copy, paste, and watch your engagement soar
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-300 mb-6">
                  Ready to train your Echo?
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:shadow-lg transition-all"
                  >
                    Let's Go!
                  </button>
                </div>
              </div>
            </div>
          </OnboardingModal>
        )

      // PHASE 2: PROFILE SETUP (Steps 3-10) - Only show on /train page
      case 3:
        if (pathname !== '/train') {
          // Auto-skip if not on train page
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="input[placeholder*='Smith & Associates']"
            position="bottom"
            title="💼 What's your business called?"
            content={
              <div>
                <p className="mb-3">
                  This could be your company name, personal brand, or product name.
                </p>
                <p className="text-sm text-purple-200 italic">
                  Example: "Acme Marketing Agency" or "Sarah's Consulting"
                </p>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            stepNumber={3}
            totalSteps={totalSteps}
          />
        )

      case 4:
        if (pathname !== '/train') {
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="input[placeholder*='Financial Services']"
            position="bottom"
            title="🏢 What industry are you in?"
            content={
              <div>
                <p className="mb-3">
                  Be specific! This helps us create relevant content.
                </p>
                <p className="text-sm text-green-200 font-medium mb-1">
                  Good: "B2B SaaS Marketing"
                </p>
                <p className="text-sm text-green-300 font-bold">
                  Better: "AI-powered marketing tools for SMEs"
                </p>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            stepNumber={4}
            totalSteps={totalSteps}
          />
        )

      case 5:
        if (pathname !== '/train') {
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="select"
            position="bottom"
            title="🎭 How should your posts sound?"
            content={
              <div>
                <p className="mb-3">Choose the tone that matches your brand:</p>
                <ul className="text-sm space-y-2">
                  <li>• <strong>Professional</strong> - Formal, authoritative, trustworthy</li>
                  <li>• <strong>Casual</strong> - Friendly, approachable, conversational</li>
                  <li>• <strong>Funny</strong> - Witty, entertaining, memorable</li>
                  <li>• <strong>Bold</strong> - Confident, provocative, attention-grabbing</li>
                </ul>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            stepNumber={5}
            totalSteps={totalSteps}
          />
        )

      case 6:
        if (pathname !== '/train') {
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="textarea"
            position="top"
            title="🛍️ What do you offer?"
            content={
              <div>
                <p className="mb-3">
                  List your main products or services. The more detail, the better!
                </p>
                <div className="text-sm text-purple-200 bg-white/10 rounded p-2">
                  <p className="font-medium mb-1">Example:</p>
                  <p>"We offer:</p>
                  <p>- Social media management for SMEs</p>
                  <p>- AI-powered content creation</p>
                  <p>- LinkedIn growth strategies"</p>
                </div>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            stepNumber={6}
            totalSteps={totalSteps}
          />
        )

      case 7:
        if (pathname !== '/train') {
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="button:has-text('SME Owners')"
            position="top"
            title="🎯 Who are you talking to?"
            content={
              <div>
                <p className="mb-3">
                  Select all audiences that apply, then add custom details.
                </p>
                <p className="text-sm text-yellow-200 mb-2">
                  <strong>Tip:</strong> The more specific, the more relevant your posts!
                </p>
                <div className="text-sm text-purple-200 bg-white/10 rounded p-2">
                  <p className="font-medium mb-1">Example custom text:</p>
                  <p>"Tech-savvy SME owners in the UK who want to grow their LinkedIn presence but don't have time"</p>
                </div>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            stepNumber={7}
            totalSteps={totalSteps}
          />
        )

      case 8:
        if (pathname !== '/train') {
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="textarea[placeholder*='USP']"
            position="top"
            title="✨ What makes you unique?"
            content={
              <div>
                <p className="mb-3">
                  Why should people choose you over competitors?
                </p>
                <p className="text-sm text-red-300 mb-1">
                  Good: "We're affordable"
                </p>
                <p className="text-sm text-green-300 font-medium">
                  Better: "We deliver enterprise-quality marketing at SME prices, with a 30-day money-back guarantee"
                </p>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            stepNumber={8}
            totalSteps={totalSteps}
          />
        )

      case 9:
        if (pathname !== '/train') {
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="input[placeholder*='automation']"
            position="top"
            title="🔑 Add your brand keywords (optional)"
            content={
              <div>
                <p className="mb-3">
                  These are words you want to appear in your posts.
                </p>
                <p className="text-sm text-purple-200 mb-2">
                  Examples: "AI", "automation", "growth", "ROI"
                </p>
                <p className="text-sm text-yellow-200">
                  <strong>Tip:</strong> Click the suggestions below for instant ideas!
                </p>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            showSkip={true}
            stepNumber={9}
            totalSteps={totalSteps}
          />
        )

      case 10:
        if (pathname !== '/train') {
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="input[type='file']"
            position="top"
            title="📄 Upload business documents (optional)"
            content={
              <div>
                <p className="mb-3">
                  Add PDFs, Word docs, or text files to train your Echo.
                </p>
                <div className="text-sm text-purple-200 space-y-1 mb-2">
                  <p>Examples:</p>
                  <p>• Company brochures</p>
                  <p>• Case studies</p>
                  <p>• Blog posts</p>
                  <p>• Product descriptions</p>
                </div>
                <p className="text-sm text-green-200 font-medium">
                  Your Echo will reference these when creating posts!
                </p>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            showSkip={true}
            stepNumber={10}
            totalSteps={totalSteps}
          />
        )

      // PHASE 3: PROFILE COMPLETE CELEBRATION (Step 11)
      case 11:
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <ProfileCompleteCelebration onContinue={nextStep} />
          </OnboardingModal>
        )

      // PHASE 4: DASHBOARD TRAINING (Steps 12-17) - Only show on /dashboard
      case 12:
        if (pathname !== '/dashboard') {
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="button:has-text('Generate New Post')"
            position="top"
            title="🚀 Let's create your first post!"
            content={
              <div>
                <p className="mb-3">
                  Click "Generate Post" to create a professional LinkedIn post in your voice, complete with hashtags and timing suggestions.
                </p>
                <p className="text-sm text-purple-200 font-medium">
                  Your Echo will use everything you just trained it on!
                </p>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            stepNumber={12}
            totalSteps={totalSteps}
          />
        )

      case 13:
        if (pathname !== '/dashboard') {
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="button:has-text('Auto')"
            position="bottom"
            title="📝 Choose a Post Type"
            content={
              <div>
                <ul className="text-sm space-y-2 mb-3">
                  <li>• <strong>Auto</strong> - Let AI decide the best type</li>
                  <li>• <strong>Information & Advice</strong> - Share tips and insights</li>
                  <li>• <strong>Random / Fun Facts</strong> - Engage with interesting content</li>
                  <li>• <strong>Selling</strong> - Highlight your products</li>
                  <li>• <strong>News</strong> - Share industry updates</li>
                </ul>
                <p className="text-sm text-green-200 font-medium">
                  For your first post, we recommend "Auto"!
                </p>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            stepNumber={13}
            totalSteps={totalSteps}
          />
        )

      case 14:
        if (pathname !== '/dashboard') {
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="textarea[placeholder*='Talk about']"
            position="top"
            title="✨ Customize Your Post"
            content={
              <div>
                <p className="mb-3">
                  You can customize your generated post by:
                </p>
                <ul className="text-sm space-y-1 mb-3">
                  <li>• Editing the text directly</li>
                  <li>• Changing the tone or angle</li>
                  <li>• Adding specific details</li>
                  <li>• Making it longer or shorter</li>
                </ul>
                <p className="text-sm text-yellow-200 font-medium">
                  <strong>Tip:</strong> Scroll down to see more options!
                </p>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            stepNumber={14}
            totalSteps={totalSteps}
          />
        )

      case 15:
        if (pathname !== '/dashboard') {
          nextStep()
          return null
        }
        return (
          <OnboardingModal showProgress={true} fullScreen={false}>
            <div className="py-8">
              <div className="flex items-center justify-center mb-6">
                <ThumbsUp className="w-16 h-16 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 text-center">
                Rate Your Posts
              </h2>
              <p className="text-lg text-gray-300 mb-6 text-center max-w-md mx-auto">
                After using a post, rate how it performed:
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-4 text-center">
                  <div className="text-4xl mb-2">👍</div>
                  <h3 className="font-bold text-white mb-1">Love it</h3>
                  <p className="text-sm text-gray-300">
                    Echo learns what works
                  </p>
                </div>
                <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 text-center">
                  <div className="text-4xl mb-2">👎</div>
                  <h3 className="font-bold text-white mb-1">Not quite</h3>
                  <p className="text-sm text-gray-300">
                    Echo adjusts next time
                  </p>
                </div>
              </div>
              <p className="text-center text-gray-400 mb-6">
                The more you use Social Echo, the smarter it gets!
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </OnboardingModal>
        )

      case 16:
        if (pathname !== '/dashboard') {
          nextStep()
          return null
        }
        return (
          <SpotlightTooltip
            targetSelector="button:has-text('Generate Illustration')"
            position="top"
            title="🖼️ Add a Professional Image"
            content={
              <div>
                <p className="mb-3">
                  Stand out with AI-generated images in multiple styles:
                </p>
                <ul className="text-sm space-y-1 mb-3">
                  <li>• <strong>Photo-Real</strong> - Clean, corporate, polished</li>
                  <li>• <strong>Illustration</strong> - Modern, creative, unique</li>
                  <li>• <strong>Meme</strong> - Fun, relatable, shareable</li>
                  <li>• <strong>Minimalist</strong> - Simple, elegant, professional</li>
                </ul>
                <p className="text-sm text-green-200 font-medium">
                  Try generating an image for your first post!
                </p>
              </div>
            }
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipOnboarding}
            stepNumber={16}
            totalSteps={totalSteps}
          />
        )

      case 17:
        if (pathname !== '/dashboard') {
          nextStep()
          return null
        }
        return (
          <OnboardingModal showProgress={true} fullScreen={false}>
            <div className="py-8">
              <div className="flex items-center justify-center mb-6">
                <TrendingUp className="w-16 h-16 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 text-center">
                Your Echo Learns With You
              </h2>
              <p className="text-lg text-gray-300 mb-6 text-center max-w-md mx-auto">
                Every time you rate a post, your Echo gets smarter:
              </p>
              <div className="space-y-4 mb-8 max-w-md mx-auto">
                <div className="bg-white/10 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-1">Learns Your Style</h3>
                    <p className="text-sm text-gray-300">
                      Adapts to your preferences and voice
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-1">Improves Quality</h3>
                    <p className="text-sm text-gray-300">
                      Creates better content over time
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-1">Saves Time</h3>
                    <p className="text-sm text-gray-300">
                      Less editing needed as it learns
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg transition-all"
                >
                  Almost Done!
                </button>
              </div>
            </div>
          </OnboardingModal>
        )

      // PHASE 5: FINAL CELEBRATION (Step 18)
      case 18:
        return (
          <OnboardingModal showProgress={false} fullScreen={true}>
            <CelebrationScreen onComplete={completeOnboarding} />
          </OnboardingModal>
        )

      default:
        // If step is out of range, complete onboarding
        completeOnboarding()
        return null
    }
  }

  return (
    <>
      {/* Progress Indicator - Always visible when onboarding is active */}
      {isActive && currentStep > 0 && currentStep < 18 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-4xl px-4">
          <div className="bg-gray-900/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/10">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              completedSteps={completedSteps}
            />
          </div>
        </div>
      )}

      {/* Render current step */}
      {renderStep()}
    </>
  )
}
