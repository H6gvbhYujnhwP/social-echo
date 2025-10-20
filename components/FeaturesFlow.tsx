'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { 
  UserPlus, Brain, Calendar, Sparkles, FileText, 
  Edit, ThumbsUp, Image, Copy, Rocket,
  ArrowRight, Shield, Palette, History, Zap
} from 'lucide-react'
import { featuresFlow, featureHighlights } from '@/app/(marketing)/features/content'

const iconMap = {
  UserPlus, Brain, Calendar, Sparkles, FileText,
  Edit, ThumbsUp, Image, Copy, Rocket,
  Shield, Palette, History, Zap
}

export default function FeaturesFlow() {
  const prefersReducedMotion = useReducedMotion()

  const getMotionProps = (index: number) => {
    if (prefersReducedMotion) {
      return { initial: false, whileInView: {}, transition: {} }
    }
    return {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: '-50px' },
      transition: { duration: 0.5, delay: index * 0.06 }
    }
  }

  const arrowMotionProps = prefersReducedMotion 
    ? { animate: {} } 
    : { 
        animate: { x: [0, 5, 0] },
        transition: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }
      }

  return (
    <div className="w-full min-w-0">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16">
        <motion.h1 
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 break-words min-w-0 px-4"
          {...getMotionProps(0)}
        >
          How SocialEcho Works
        </motion.h1>
        <motion.p 
          className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto break-words px-4"
          {...getMotionProps(1)}
        >
          From blank page to polished post in minutes. Watch how easy it is to create 
          professional content with your personal AI assistant.
        </motion.p>
      </div>

      {/* Features Flow */}
      <div className="space-y-6 sm:space-y-8 mb-12 sm:mb-20">
        {featuresFlow.map((feature, index) => {
          const Icon = iconMap[feature.icon as keyof typeof iconMap]
          const hasVideo = !!feature.video

          return (
            <div key={feature.step} className="min-w-0">
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-shadow min-w-0"
                {...getMotionProps(index)}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 min-w-0">
                  {/* Step Number & Icon */}
                  <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0 flex-shrink-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0">
                      {feature.step}
                    </div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 sm:mt-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon size={24} className="sm:w-8 sm:h-8" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 break-words min-w-0">
                      {feature.title}
                    </h3>
                    <p className="text-base sm:text-lg text-gray-600 mb-4 break-words min-w-0">
                      {feature.description}
                    </p>

                    {/* Video Demo */}
                    {hasVideo && (
                      <div className="mt-4 sm:mt-6 min-w-0">
                        <video
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="rounded-xl shadow-md w-full h-auto max-w-full"
                          aria-label={`Demo video: ${feature.title}`}
                        >
                          <source src={`/features/${feature.video}`} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Arrow Between Steps */}
              {index < featuresFlow.length - 1 && (
                <div className="flex justify-center my-4 sm:my-6">
                  <motion.div 
                    aria-hidden="true"
                    {...arrowMotionProps}
                  >
                    <ArrowRight className="text-blue-600 opacity-70" size={24} />
                  </motion.div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Feature Highlights */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 lg:p-12 min-w-0">
        <motion.h2 
          className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12 break-words px-4"
          {...getMotionProps(0)}
        >
          Why Teams Love SocialEcho
        </motion.h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {featureHighlights.map((highlight, index) => {
            const Icon = iconMap[highlight.icon as keyof typeof iconMap]
            
            return (
              <motion.div
                key={highlight.title}
                className="bg-white rounded-xl p-4 sm:p-6 text-center min-w-0"
                {...getMotionProps(index + 2)}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 flex-shrink-0">
                  <Icon size={24} className="sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 break-words min-w-0">
                  {highlight.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 break-words min-w-0">
                  {highlight.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div 
        className="text-center mt-12 sm:mt-16 px-4"
        {...getMotionProps(0)}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 break-words">
          Ready to Transform Your Content Creation?
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 break-words">
          Join hundreds of businesses creating better content in less time.
        </p>
        <a
          href="/pricing"
          className="inline-block bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Get Started Today
        </a>
      </motion.div>
    </div>
  )
}

