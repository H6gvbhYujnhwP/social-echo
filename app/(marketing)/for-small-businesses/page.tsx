'use client'

import { useRouter } from 'next/navigation'
import { Check, Clock, DollarSign, TrendingUp, Target } from 'lucide-react'
import { SchemaMarkup } from '@/components/seo/SchemaMarkup'

export const metadata = {
  title: 'AI Social Media for Small Businesses & SMEs',
  description: 'Affordable AI-powered social media marketing for small businesses. Generate professional posts daily without hiring a marketing team. From £29.99/month.',
}

export default function ForSmallBusinessesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Your Social Media Marketing Team—Without the Team
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            You're running a business, not a marketing agency. Social Echo gives you professional social media content daily—without the £2,000+/month agency fees or the time drain of doing it yourself.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl"
          >
            Start Free Trial - 8 Posts Free
          </button>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            The Small Business Social Media Struggle
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Clock className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">No Time</h3>
              <p className="text-gray-300">
                You're already working 60-hour weeks. Finding time to create social posts feels impossible.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <DollarSign className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Can't Afford an Agency</h3>
              <p className="text-gray-300">
                £2,000-£5,000/month for basic social media management? That's not in your budget.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Target className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Don't Know What to Post</h3>
              <p className="text-gray-300">
                Staring at a blank screen wondering what to write. Even when you post, it doesn't get engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Social Echo: Professional Content, SME Pricing
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <Clock className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">10 Minutes Per Day</h3>
              <p className="text-gray-300 mb-4">
                Train Social Echo once with your business details. Then generate a professional post + image in under 10 minutes every day.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>No marketing experience needed</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>AI learns your business voice</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>3 headline options per post</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <DollarSign className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">From £29.99/Month</h3>
              <p className="text-gray-300 mb-4">
                Get agency-quality content at a fraction of the cost. No contracts, cancel anytime.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>30-100 posts per month</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Text + image generation included</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Free trial - no credit card required</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            How It Works: 3 Simple Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Train Your AI</h3>
              <p className="text-gray-300">
                Tell us about your business, what you sell, and who you serve. Takes 5 minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Generate Daily</h3>
              <p className="text-gray-300">
                Click "Generate" and watch professional posts appear in seconds. Choose from 3 headlines.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Post & Grow</h3>
              <p className="text-gray-300">
                Copy to LinkedIn, add your image, and post. Give feedback to help your AI improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">Starter</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-white">£29.99</span>
                <span className="text-gray-300 text-lg">/month</span>
              </div>
              <p className="text-gray-300 mb-6">Perfect for solopreneurs and freelancers</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">30 posts per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Text + image generation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">All 4 post types</span>
                </li>
              </ul>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Start Free Trial
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-md">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-white">£49.99</span>
                <span className="text-gray-300 text-lg">/month</span>
              </div>
              <p className="text-gray-300 mb-6">For SMEs wanting daily visibility</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">100 posts per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Text + image generation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">Content Mix Planner</span>
                </li>
              </ul>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stop Struggling with Social Media
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of SMEs already growing their social media presence with Social Echo. No credit card required to start.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-2xl"
          >
            Start Your Free Trial Today
          </button>
        </div>
      </section>

      {/* Schema Markup */}
      <SchemaMarkup type="software" />
      <SchemaMarkup type="organization" />
    </div>
  )
}
