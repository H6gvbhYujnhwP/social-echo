'use client'

import { motion } from 'framer-motion'
import { Rocket, Mail, TrendingUp, Users, MessageCircle, ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Big Results for SMEs<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Without Big Marketing Teams
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Stop paying £2,000+ per month. Grow your business visibility and leads in just 10 minutes a day.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/train">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm"
              >
                <Play className="mr-2 h-5 w-5" />
                See How It Works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple. Affordable. Effective.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Social Media Growth Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl mr-4">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Social Media Growth</h3>
                  <p className="text-3xl font-bold text-blue-600">£149.99 per month</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Unlimited posts written in your voice
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Custom images created for every post
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Post directly from your smartphone in minutes
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Just 10 minutes a day to engage on LinkedIn
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  No contracts—switch on or off whenever you like
                </li>
              </ul>
              <Link href="/train">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Email Outreach Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl mr-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Email Outreach</h3>
                  <p className="text-3xl font-bold text-purple-600">from £49.99 per campaign</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Up to 10,000 cold emails sent each month
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Designed, delivered, and fully reported
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Tailored to your brand and goals
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Includes a 1-hour strategy session with our Head of Marketing
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-xl font-semibold">
                Enquire Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why SMEs Love Our Approach
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Our clients consistently achieve remarkable results that transform their business visibility and lead generation. 
              We understand that small and medium enterprises need marketing solutions that deliver measurable outcomes 
              without the complexity and cost of traditional agency relationships.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="text-center bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
            >
              <TrendingUp className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <div className="text-6xl font-bold text-white mb-2">350%</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Follower Growth</h3>
              <p className="text-gray-300">Average increase in social media following within the first quarter.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-center bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
            >
              <Users className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <div className="text-6xl font-bold text-white mb-2">1000s</div>
              <h3 className="text-2xl font-semibold text-white mb-4">New Subscribers</h3>
              <p className="text-gray-300">Email list growth through targeted outreach campaigns.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-center bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
            >
              <MessageCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <div className="text-6xl font-bold text-white mb-2">100%</div>
              <h3 className="text-2xl font-semibold text-white mb-4">Inbound Leads</h3>
              <p className="text-gray-300">Recognition as sector experts driving qualified inquiries.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Ready to grow your visibility?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Speak with Westley or John today to start growing your visibility and winning more customers.
          </p>
          <Link href="/train">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200">
              Start My Free Trial Today
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
