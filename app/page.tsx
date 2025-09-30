'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, Target, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GradientText } from '../components/ui/GradientText'
import { FeatureCard } from '../components/ui/FeatureCard'
import { StatCard } from '../components/ui/StatCard'
import { GlassCard } from '../components/ui/GlassCard'

export default function HomePage() {
  const router = useRouter()

  const handleSignUp = () => {
    router.push('/train')
  }

  const handleContactClick = () => {
    // For demo purposes, redirect to dashboard
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Big Results for SMEs Without Big Marketing Teams
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl text-white mb-4 font-semibold"
            >
              Stop paying £2,000+ per month.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed"
            >
              Get the visibility and leads your business deserves—at a fraction of the cost. Our streamlined marketing solutions are 
              designed specifically for small and medium enterprises that need professional results without the enterprise-level investment.
            </motion.p>
          </div>
        </section>

        {/* Simple. Affordable. Effective. */}
        <section className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Simple. Affordable. Effective.
              </h2>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <FeatureCard
                icon={Zap}
                title="Social Media Growth"
                price="£149.99 per month"
                features={[
                  "Unlimited posts written in your voice",
                  "Custom images created for every post",
                  "Post directly from your smartphone in minutes",
                  "Just 10 minutes a day to engage on LinkedIn",
                  "No contracts—switch on or off whenever you like"
                ]}
                buttonText="Get Started →"
                onButtonClick={handleSignUp}
                gradient="purple"
                delay={0.8}
              />

              <FeatureCard
                icon={Target}
                title="Email Outreach"
                price="from £49.99 per campaign"
                features={[
                  "Up to 10,000 cold emails sent each month",
                  "Designed, delivered, and fully reported",
                  "Tailored to your brand and goals",
                  "Includes a 1-hour strategy session with our Head of Marketing"
                ]}
                buttonText="Enquire Now →"
                onButtonClick={handleContactClick}
                gradient="blue"
                delay={1.0}
              />
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-center mb-16"
            >
              <button 
                onClick={handleContactClick}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-xl transform hover:scale-105 transition-all duration-200 mb-6"
              >
                Click here
              </button>
              <p className="text-xl text-white mb-2">
                <strong>Speak with Westley or John</strong>
              </p>
              <p className="text-gray-300">
                today to start growing your visibility and winning more customers.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Why SMEs Love Our Approach */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-8">
                Why SMEs Love Our Approach
              </h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <p className="text-xl text-gray-300 leading-relaxed mb-6">
                    Our clients consistently achieve remarkable results that transform their business visibility and lead generation. 
                    We understand that small and medium enterprises need marketing solutions that deliver measurable outcomes 
                    without the complexity and cost of traditional agency relationships.
                  </p>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    The beauty of our system lies in its simplicity and effectiveness. You maintain complete control over your brand voice 
                    while we handle the technical execution and strategic implementation. This approach allows you to focus on what you do best—running 
                    your business—while we ensure your marketing works tirelessly to attract new customers and build your reputation as the go-to expert in your sector.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-16 w-16 text-white/60" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-8">
              <StatCard
                value="350%"
                title="Follower Growth"
                description="Average increase in social media following within the first quarter."
                gradient="purple-pink"
                delay={1.6}
              />

              <StatCard
                value="1000s"
                title="New Subscribers"
                description="Email list growth through targeted outreach campaigns."
                gradient="blue-cyan"
                delay={1.8}
              />

              <StatCard
                value="100%"
                title="Inbound Leads"
                description="Recognition as sector experts driving qualified inquiries."
                gradient="green-emerald"
                delay={2.0}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center text-gray-400">
            <p>&copy; 2025 Social Echo. AI-powered LinkedIn content generation for SMEs.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
