'use client'

import { useRouter } from 'next/navigation'
import { Check, Users, Zap, TrendingUp, Clock } from 'lucide-react'
import { SchemaMarkup } from '@/components/seo/SchemaMarkup'

export const metadata = {
  title: 'AI Social Media Tool for Agencies',
  description: 'Scale your agency with AI-powered social media content generation. Create client posts faster, manage multiple brands, and deliver consistent quality.',
}

export default function ForAgenciesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Scale Your Agency with AI-Powered Social Media Content
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Stop spending hours creating social posts for every client. Social Echo lets you generate professional, brand-aligned content in seconds—freeing your team to focus on strategy and growth.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl"
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            The Agency Challenge
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Clock className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Time-Consuming Content Creation</h3>
              <p className="text-gray-300">
                Your team spends 10+ hours per week creating social posts for each client. That's time you could spend on strategy, sales, or scaling.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Users className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Inconsistent Quality</h3>
              <p className="text-gray-300">
                Different team members create content in different styles. Maintaining brand voice across clients is a constant struggle.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <TrendingUp className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Hard to Scale</h3>
              <p className="text-gray-300">
                Every new client means more content to create. Your team is maxed out, and hiring more writers is expensive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            How Social Echo Helps Agencies Scale
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <Zap className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Create Client Content in Seconds</h3>
              <p className="text-gray-300 mb-4">
                Train Social Echo once per client with their brand voice, industry, and target audience. Then generate professional posts in seconds—not hours.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Generate 30-100 posts per client per month</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>4 post types: Info, Advice, Selling, News</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>AI-generated images included</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <Users className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Consistent Brand Voice</h3>
              <p className="text-gray-300 mb-4">
                Social Echo learns each client's unique voice and maintains it across all posts. No more inconsistency between team members.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>AI learns from feedback</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Refine posts with custom instructions</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>3 headline options per post</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing for Agencies */}
      <section className="px-6 py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Agency Pricing
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Manage multiple clients with our flexible plans. Each account can be trained for a different client.
          </p>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 text-left">
            <h3 className="text-2xl font-bold text-white mb-4">Pro Plan (Recommended)</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-bold text-white">£49.99</span>
              <span className="text-gray-300 text-lg">/month per client</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">100 posts per month (3+ per day)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Text + image generation</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Content Mix Planner</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Priority support</span>
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
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Scale Your Agency?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join agencies already using Social Echo to create client content faster and more consistently.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-2xl"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Schema Markup */}
      <SchemaMarkup type="software" />
      <SchemaMarkup type="organization" />
    </div>
  )
}
