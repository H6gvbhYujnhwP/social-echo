'use client'

import { motion } from 'framer-motion'
import { Sparkles, Zap, Target, TrendingUp, Check, X, Brain, Repeat, Palette, Clock, BarChart3, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GradientText } from '@/components/ui/GradientText'
import { FeatureCard } from '@/components/ui/FeatureCard'
import { StatCard } from '@/components/ui/StatCard'
import { GlassCard } from '@/components/ui/GlassCard'
import { trackCTAClick } from '@/lib/analytics/track-event'
import { SchemaMarkup } from '@/components/seo/SchemaMarkup'

export default function HomePage() {
  const router = useRouter()

  const handleGetStarted = () => {
    trackCTAClick('Start Free Trial', 'hero_section');
    router.push('/pricing')
  }

  const handleSignUp = (plan: string) => {
    trackCTAClick(`Get Started - ${plan}`, 'pricing_section');
    router.push(`/pricing?plan=${plan}`)
  }

  const handleHowItWorks = () => {
    trackCTAClick('How It Works', 'hero_section');
    // Scroll to how it works section
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
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
        <section className="px-6 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Get LinkedIn Leads with AI-Generated Posts—
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Do It Now!
              </span>
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <p className="text-2xl md:text-3xl text-green-400 font-bold mb-4">
                No Credit Card • No Bank Details • Completely Free Trial
              </p>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Generate professional social media posts in seconds. Our AI learns your business voice and creates content that gets you noticed.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button
                onClick={handleGetStarted}
                className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105"
              >
                Try Free - No Credit Card Required →
              </button>
              <button
                onClick={handleHowItWorks}
                className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-lg text-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
              >
                See How It Works →
              </button>
            </motion.div>
            
            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm"
            >
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Join 500+ businesses</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Setup in 2 minutes</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Video Demo Section */}
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                See Social Echo in Action
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Watch how easy it is to generate professional social media content in seconds
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/50 backdrop-blur-sm"
            >
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-xl"
                  src="https://www.youtube.com/embed/kE_ZrbgrPg0?rel=0&modestbranding=1"
                  title="Social Echo Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Agency Comparison Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Stop Paying £2,000+/Month for What You Can Get for £49
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Traditional agencies charge enterprise prices for basic social media management. 
                We give you professional results at SME-friendly pricing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="px-6 py-4 text-left text-gray-400 font-semibold">Feature</th>
                      <th className="px-6 py-4 text-center text-gray-400 font-semibold">Traditional Agency</th>
                      <th className="px-6 py-4 text-center text-blue-400 font-semibold">Social Echo</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    <tr className="border-b border-white/10">
                      <td className="px-6 py-4">Monthly Cost</td>
                      <td className="px-6 py-4 text-center text-red-400">£2,000-£5,000</td>
                      <td className="px-6 py-4 text-center text-green-400 font-semibold">£29.99-£49.99</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-6 py-4">Posts Per Month</td>
                      <td className="px-6 py-4 text-center">15-30 posts</td>
                      <td className="px-6 py-4 text-center font-semibold">Up to 100 posts</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-6 py-4">Content Style</td>
                      <td className="px-6 py-4 text-center">Generic templates</td>
                      <td className="px-6 py-4 text-center font-semibold">AI trained on YOUR voice</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-6 py-4">Turnaround Time</td>
                      <td className="px-6 py-4 text-center">3-5 days</td>
                      <td className="px-6 py-4 text-center font-semibold">Instant</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-6 py-4">Revisions</td>
                      <td className="px-6 py-4 text-center">Limited (1-2)</td>
                      <td className="px-6 py-4 text-center font-semibold">2 refinements per post</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">Control</td>
                      <td className="px-6 py-4 text-center">Agency decides</td>
                      <td className="px-6 py-4 text-center font-semibold">Full control</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <button
                onClick={() => handleSignUp('SocialEcho_Pro')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Try Free - No Credit Card →
              </button>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="px-6 py-16 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How It Works: 3 Simple Steps
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From zero to daily social posts in minutes. No marketing experience required.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-8 text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Train Your Echo</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Tell us about your business, tone, target audience, and what makes you unique. 
                    Our AI learns your voice in minutes.
                  </p>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-8 text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Generate Daily</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Click "Generate" and watch as professional posts appear in seconds. 
                    Choose from 3 headline options and refine with custom instructions.
                  </p>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-8 text-center h-full">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Post & Grow</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Copy to your platform, add your image, and post. Give feedback to help your AI learn. 
                    Watch your presence and authority soar.
                  </p>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* v8.9 Features Showcase */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Powered by AI That Learns from You
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Social Echo v8.9 includes cutting-edge features that make content creation effortless and effective.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">4 Post Types</h3>
                      <p className="text-gray-300 text-sm">
                        Information & Advice, Random/Fun Facts, Selling, and News posts—all optimized for engagement.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Brain className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">AI Learning System</h3>
                      <p className="text-gray-300 text-sm">
                        Gets smarter with every "Good" or "Needs Work" feedback you give. Your AI evolves with you.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Repeat className="h-6 w-6 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Post Refinement</h3>
                      <p className="text-gray-300 text-sm">
                        Don't like something? Refine it with custom instructions. 2 refinement attempts per post.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Content Mix Planner</h3>
                      <p className="text-gray-300 text-sm">
                        Automatically balances your content types for maximum engagement and authority building.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Palette className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Image Generation</h3>
                      <p className="text-gray-300 text-sm">
                        Create eye-catching visuals for every post. Choose from 7 visual styles including memes and infographics.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Best Time to Post</h3>
                      <p className="text-gray-300 text-sm">
                        AI-powered timing recommendations to maximize your reach and engagement on social media.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Start Your Free Trial Today
              </h2>
              <p className="text-2xl text-green-400 font-bold mb-4">
                No Credit Card Required • Cancel Anytime
              </p>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Choose the plan that fits your business. All plans include our v8.9 AI features.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <FeatureCard
                icon={Zap}
                title="Starter"
                price="£29.99/month"
                features={[
                  "30 posts per month (daily)",
                  "All 4 post types",
                  "Text + image generation",
                  "2 refinements per post",
                  "AI learning system",
                  "3 headline options"
                ]}
                buttonText="Try Free - No Card Required"
                onButtonClick={() => handleSignUp('SocialEcho_Starter')}
                gradient="purple"
                delay={0.2}
              />

              <div className="relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    MOST POPULAR
                  </span>
                </div>
                <FeatureCard
                  icon={Target}
                  title="Pro"
                  price="£49.99/month"
                  features={[
                    "100 posts per month (3+/day)",
                    "All 4 post types",
                    "Text + image generation",
                    "2 refinements per post",
                    "Content Mix Planner",
                    "Priority AI learning"
                  ]}
                  buttonText="Try Free - No Card Required"
                  onButtonClick={() => handleSignUp('SocialEcho_Pro')}
                  gradient="blue"
                  delay={0.4}
                />
              </div>

              <div className="relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    NEW
                  </span>
                </div>
                <FeatureCard
                  icon={Sparkles}
                  title="Ultimate"
                  price="£179/month"
                  features={[
                    "Unlimited posts per month",
                    "All 4 post types",
                    "Text + image generation",
                    "Unlimited refinements per post",
                    "Content Mix Planner",
                    "Priority AI learning",
                    "Planner & scheduling tools"
                  ]}
                  buttonText="Try Free - No Card Required"
                  onButtonClick={() => handleSignUp('SocialEcho_Ultimate')}
                  gradient="pink"
                  delay={0.6}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why It Works - 7 Day Method */}
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
                The 7-Day Posting Method That Builds Authority
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
                Our balanced content mix ensures you're not just filling a feed—you're building trust, authority, and sales.
              </p>
              
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <GlassCard className="p-6 text-center">
                  <div className="text-4xl mb-4">💡</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Information Posts</h3>
                  <p className="text-gray-300 text-sm">Position you as the expert with valuable insights and industry knowledge.</p>
                </GlassCard>
                
                <GlassCard className="p-6 text-center">
                  <div className="text-4xl mb-4">📘</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Advice Posts</h3>
                  <p className="text-gray-300 text-sm">Deliver quick wins and real value your audience can implement immediately.</p>
                </GlassCard>
                
                <GlassCard className="p-6 text-center">
                  <div className="text-4xl mb-4">💰</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Selling Posts</h3>
                  <p className="text-gray-300 text-sm">Convert when trust is built with clear CTAs at the perfect moment.</p>
                </GlassCard>

                <GlassCard className="p-6 text-center">
                  <div className="text-4xl mb-4">🎲</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Fun/News Posts</h3>
                  <p className="text-gray-300 text-sm">Keep your audience engaged with relatable moments and industry updates.</p>
                </GlassCard>
              </div>
              
              <p className="text-xl text-white max-w-4xl mx-auto leading-relaxed mb-8 font-semibold">
                This rhythm means your audience sees you as helpful and credible—and when you do sell, they're ready to buy.
              </p>
              
              <motion.button
                onClick={() => handleSignUp('SocialEcho_Pro')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-full text-xl font-semibold shadow-xl transform transition-all duration-200"
              >
                Start Building Authority Today
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Results & Social Proof */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Results That Speak for Themselves
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our clients consistently achieve remarkable results that transform their business visibility and lead generation.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <StatCard
                value="350%"
                title="Follower Growth"
                description="Average increase in social media following within 90 days of consistent posting."
                gradient="purple-pink"
                delay={0.2}
              />

              <StatCard
                value="1000s"
                title="New Subscribers"
                description="Email list growth through targeted content and engagement strategies."
                gradient="blue-cyan"
                delay={0.4}
              />

              <StatCard
                value="100%"
                title="Inbound Leads"
                description="Recognition as sector experts driving qualified inquiries and opportunities."
                gradient="green-emerald"
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Start Your Free Trial Today
              </h2>
              <p className="text-xl text-white/90 mb-8">
                No credit card required. Cancel anytime. See results in days, not months.
              </p>
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-600 px-12 py-5 rounded-full text-xl font-bold hover:bg-gray-100 transition-all shadow-xl transform hover:scale-105"
              >
                Get Started Free →
              </button>
              <p className="text-white/80 mt-6 text-sm">
                Join hundreds of SMEs already growing their social media presence with Social Echo
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                <a href="/features" className="text-gray-400 hover:text-white transition-colors">
                  How It Works
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
              <div className="flex flex-wrap gap-6 justify-center md:justify-start mt-4">
                <a href="/for-agencies" className="text-gray-400 hover:text-white transition-colors">
                  For Agencies
                </a>
                <a href="/for-small-businesses" className="text-gray-400 hover:text-white transition-colors">
                  For Small Businesses
                </a>
              </div>
            </div>
            <div className="text-center text-gray-400">
              <p>&copy; 2025 Social Echo. AI-powered social media content generation for SMEs.</p>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Schema Markup for SEO */}
      <SchemaMarkup type="software" />
      <SchemaMarkup type="organization" />
      <SchemaMarkup type="faq" />
    </div>
  )
}

