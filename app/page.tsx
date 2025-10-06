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
                  "Unlimited posts written in your voice",
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

            {/* Enterprise White Label Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mb-16"
            >
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Enterprise White Label Plans
                </h3>
                <p className="text-xl text-gray-300 mb-8">
                  White-label ready for agencies — resell at 5× markup
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Agency - Grow as You Go */}
                <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-200 border-2 border-blue-500">
                  <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                    AGENCY PLAN
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Agency — Grow as You Go</h4>
                  <div className="text-3xl font-bold text-blue-400 mb-4">£39/client/mo</div>
                  <ul className="text-left text-gray-300 space-y-2 text-sm mb-6">
                    <li>✓ Unlimited client accounts</li>
                    <li>✓ Branded white-label instance</li>
                    <li>✓ Unlimited posts per client</li>
                    <li>✓ Admin dashboard</li>
                    <li>✓ Custom domain support</li>
                    <li>✓ Auto-proration billing</li>
                    <li>✓ Priority support</li>
                  </ul>
                  <button 
                    onClick={() => handleSignUp('SocialEcho_AgencyStarter')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Get Started
                  </button>
                </GlassCard>

                {/* Enterprise Unlimited */}
                <GlassCard className="p-6 text-center hover:scale-105 transition-transform duration-200">
                  <h4 className="text-xl font-bold text-white mb-2">Enterprise Unlimited</h4>
                  <div className="text-3xl font-bold text-orange-400 mb-4">£1,499+/mo</div>
                  <ul className="text-left text-gray-300 space-y-2 text-sm mb-6">
                    <li>✓ Unlimited client accounts</li>
                    <li>✓ Full white-label SaaS</li>
                    <li>✓ API access</li>
                    <li>✓ Custom onboarding</li>
                    <li>✓ SLA guarantees</li>
                    <li>✓ Revenue-share model</li>
                  </ul>
                  <button 
                    onClick={handleContactClick}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Contact Sales
                  </button>
                </GlassCard>
              </div>

              {/* Agency Revenue Example */}
              <div className="mt-12 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h4 className="text-2xl font-bold text-white mb-4 text-center">
                  Agency Revenue Potential
                </h4>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-gray-400 mb-2">You Pay</div>
                    <div className="text-3xl font-bold text-white">£39/mo</div>
                    <div className="text-sm text-gray-400">per client</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-2">You Charge</div>
                    <div className="text-3xl font-bold text-green-400">£99/mo</div>
                    <div className="text-sm text-gray-400">per client</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-2">Your Margin</div>
                    <div className="text-3xl font-bold text-green-400">£60/mo</div>
                    <div className="text-sm text-gray-400">per client (154% markup)</div>
                  </div>
                </div>
                <p className="text-center text-gray-300 mt-6 text-sm">
                  With 25 clients: Earn £2,475/mo in revenue, £1,500/mo profit margin
                </p>
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-center mb-16"
            >
              <p className="text-2xl text-white mb-6 font-semibold">
                Stop paying £2,000+ per month for agencies — get daily posts for £49.
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
          <div className="max-w-7xl mx-auto text-center text-gray-400">
            <p>&copy; 2025 Social Echo. AI-powered LinkedIn content generation for SMEs.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
