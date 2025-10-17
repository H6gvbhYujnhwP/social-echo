'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, Target, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GradientText } from '@/components/ui/GradientText'
import { FeatureCard } from '@/components/ui/FeatureCard'
import { StatCard } from '@/components/ui/StatCard'
import { GlassCard } from '@/components/ui/GlassCard'

export default function HomePage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/pricing')
  }

  const handleSignUp = (plan: string) => {
    router.push(`/pricing?plan=${plan}`)
  }

  const handleContactClick = () => {
    // For demo purposes, redirect to sign-in
    router.push('/signin')
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
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started Today
              </button>
              <a
                href="/features"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg text-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
              >
                See How It Works →
              </a>
            </motion.div>
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
                title="Starter Plan"
                price="£29.99 per month"
                features={[
                  "2 posts per week written in your voice",
                  "Text + image generation",
                  "Content Mix Planner (Selling / Info / Advice / News)",
                  "Copy and download workflows",
                  "Ideal for freelancers and solopreneurs"
                ]}
                buttonText="Get Started →"
                onButtonClick={() => handleSignUp('SocialEcho_Starter')}
                gradient="purple"
                delay={0.8}
              />

              <FeatureCard
                icon={Target}
                title="Pro Plan"
                price="£49.99 per month"
                features={[
                  "30 posts per month (2 regenerations each)",
                  "Text + image generation",
                  "Full Content Mix Planner (4 post types)",
                  "Copy, download, and share workflows",
                  "Perfect for SMEs who want daily visibility"
                ]}
                buttonText="Get Started →"
                onButtonClick={() => handleSignUp('SocialEcho_Pro')}
                gradient="blue"
                delay={1.0}
              />
            </div>



            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-center mb-16"
            >
              <p className="text-2xl text-white mb-6 font-semibold">
                Stop paying £2,000+ per month for agencies — get daily posts from just £29.99.
              </p>
              <button 
                onClick={() => handleSignUp('SocialEcho_Starter')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-xl transform hover:scale-105 transition-all duration-200 mb-6"
              >
                Start Your Free Trial
              </button>
            </motion.div>
          </div>
        </section>

        {/* Why 7 Days of Posting Works */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Why Posting Smart, Every Day, Wins
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
                Our 7-day posting method ensures you're not just filling a feed — you're building authority, trust, and sales.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <GlassCard className="p-8 text-center">
                  <div className="text-4xl mb-4">📘</div>
                  <h3 className="text-xl font-semibold text-white mb-4">Informational Posts</h3>
                  <p className="text-gray-300">Position you as the expert in your field with valuable insights and industry knowledge.</p>
                </GlassCard>
                
                <GlassCard className="p-8 text-center">
                  <div className="text-4xl mb-4">💡</div>
                  <h3 className="text-xl font-semibold text-white mb-4">Advice Posts</h3>
                  <p className="text-gray-300">Deliver quick wins and real value that your audience can implement immediately.</p>
                </GlassCard>
                
                <GlassCard className="p-8 text-center">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-xl font-semibold text-white mb-4">Selling Posts</h3>
                  <p className="text-gray-300">Give clear CTAs without overwhelming your audience, perfectly timed for maximum impact.</p>
                </GlassCard>
              </div>
              
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
                This balanced rhythm means your audience sees you as helpful, insightful, and credible — and when you do sell, they're ready to buy.
              </p>
              
              <motion.button
                onClick={() => handleSignUp('SocialEcho_Starter')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-full text-xl font-semibold shadow-xl transform transition-all duration-200"
              >
                Start My Free Trial Today
              </motion.button>
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
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <a href="/features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </a>
                <a href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </a>
                <a href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help
                </a>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms
                </a>
                <a href="mailto:support@socialecho.ai" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </a>
              </div>
            </div>
            <div className="text-center text-gray-400">
              <p>&copy; 2025 Social Echo. AI-powered LinkedIn content generation for SMEs.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
