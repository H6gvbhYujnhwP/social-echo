'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, FileText, Shield } from 'lucide-react'
import Container from '@/components/layout/Container'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-4 sm:py-6 border-b border-white/10 backdrop-blur-lg bg-white/5">
        <Container className="flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-white hover:text-purple-300 transition-colors">
            SOCIAL ECHO
          </Link>
          <Link href="/dashboard" className="flex items-center text-white/80 hover:text-white transition-colors text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Container>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-8 sm:py-12">
        <Container className="max-w-4xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 break-words">
              Legal Information
            </h1>
            <p className="text-base sm:text-lg text-gray-300 break-words">
              Terms of Service and Refund Policy
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <a
              href="#terms"
              className="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-white font-semibold break-words">Terms of Service</h3>
                  <p className="text-white/60 text-sm break-words">Account, billing, and usage terms</p>
                </div>
              </div>
            </a>
            <a
              href="#refund"
              className="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors"
            >
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-white font-semibold break-words">Refund Policy</h3>
                  <p className="text-white/60 text-sm break-words">Billing, upgrades, and refunds</p>
                </div>
              </div>
            </a>
          </motion.div>

          {/* Terms of Service */}
          <motion.div
            id="terms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 mb-8 min-w-0"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 break-words">Terms of Service</h2>
            
            <div className="space-y-6 text-white/90 break-words">
              <div>
                <p className="text-sm text-white/60 mb-4">
                  <strong>Effective Date:</strong> October 2025<br />
                  <strong>Last Updated:</strong> October 16, 2025
                </p>
                <p>
                  Welcome to Social Echo, an AI-powered social media assistant developed and operated by <strong>Sweetbyte Ltd</strong> ("we", "us", "our"). By using Social Echo ("Service", "Platform", or "Application"), you agree to these Terms of Service ("Terms").
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1. Overview</h3>
                <p>Social Echo provides AI-assisted tools to generate, edit, and manage social media content. Access to the Service requires a registered account and an active subscription.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">2. Accounts & Security</h3>
                <p className="mb-2">You are responsible for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>Ensuring all information you provide is accurate and up to date</li>
                  <li>Promptly notifying us of any unauthorized access</li>
                </ul>
                <p className="mt-2">Accounts may be suspended or terminated for misuse, breach of these Terms, or fraudulent activity.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">3. Subscriptions & Billing</h3>
                <p className="mb-2">Social Echo offers paid subscriptions billed via Stripe, our payment processor. By subscribing, you authorize recurring monthly payments until you cancel.</p>
                
                <p className="font-semibold mt-4 mb-2">Billing Plans:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Starter – £29.99/month</li>
                  <li>Pro – £49.99/month</li>
                  <li>Agency – £99.99/month</li>
                </ul>
                <p className="mt-2 text-sm">Prices include applicable taxes unless otherwise stated.</p>

                <p className="font-semibold mt-4 mb-2">Trial Period:</p>
                <p>New users may start on a free trial. Upgrading to a paid plan before the trial ends will begin billing immediately, ending the trial.</p>

                <p className="font-semibold mt-4 mb-2">Automatic Renewal:</p>
                <p>Your plan renews automatically each month unless canceled before the next billing date.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">4. Upgrades & Downgrades</h3>
                
                <p className="font-semibold mb-2">Upgrading (e.g., Starter → Pro):</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Upgrading immediately starts a new billing cycle at the higher plan rate</li>
                  <li><strong>No refunds or credits are given for unused Starter time</strong></li>
                  <li>You are charged £49.99 immediately and your next renewal will be one month from today</li>
                  <li>If you are on a free trial, the £29.99 Starter charge will not apply; only the £49.99 Pro charge will be made</li>
                </ul>

                <p className="font-semibold mt-4 mb-2">Downgrading:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Downgrades take effect at the end of your current billing cycle</li>
                  <li>You will retain Pro features until that date</li>
                </ul>

                <p className="mt-2">All billing is handled securely by Stripe, and invoices are available through your Account → Billing page.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">5. Refund Policy</h3>
                <p className="mb-2"><strong>Social Echo does not issue refunds except where required by law.</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Upgrades:</strong> No refunds or credits for unused time on lower-tier plans when upgrading</li>
                  <li><strong>Cancellations:</strong> You may cancel anytime; your subscription remains active until the end of the paid period</li>
                  <li><strong>Trials:</strong> You won't be charged until you upgrade or your trial ends</li>
                  <li><strong>Failed Payments:</strong> Accounts may be paused or downgraded automatically after failed renewals</li>
                </ul>
                <p className="mt-2">See the full <a href="#refund" className="text-purple-400 hover:text-purple-300 underline">Refund Policy</a> below for details.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">6. Acceptable Use</h3>
                <p className="mb-2">You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use Social Echo for unlawful, abusive, or harassing activity</li>
                  <li>Generate, distribute, or publish harmful or misleading content</li>
                  <li>Reverse-engineer, resell, or misuse the Service</li>
                </ul>
                <p className="mt-2">Violations may result in immediate suspension or termination without refund.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">7. Intellectual Property</h3>
                <p>All platform code, designs, and AI models are the property of Sweetbyte Ltd. You retain ownership of your generated social media content. By using the Service, you grant us limited rights to process and store your content to provide the Service.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">8. Service Availability & Changes</h3>
                <p>We may update, modify, or discontinue features at any time. We aim to provide 99% uptime on Render-hosted services. Planned maintenance and third-party outages may affect availability.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">9. Liability & Disclaimer</h3>
                <p className="mb-2">The Service is provided "as is" without warranties. We are not responsible for any loss of data, revenue, or reputation resulting from Service use.</p>
                <p>Our liability under any circumstance is limited to the amount you paid in the past 12 months.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">10. Governing Law</h3>
                <p>These Terms are governed by the laws of England and Wales, under the jurisdiction of UK courts.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">11. Contact</h3>
                <p>For billing, data, or account questions, contact:</p>
                <p className="mt-2">
                  📧 <a href="mailto:support@socialecho.ai" className="text-purple-400 hover:text-purple-300 underline">support@socialecho.ai</a><br />
                  📍 Sweetbyte Ltd, London, UK
                </p>
              </div>
            </div>
          </motion.div>

          {/* Refund Policy */}
          <motion.div
            id="refund"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 min-w-0"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 break-words">Refund Policy</h2>
            
            <div className="space-y-6 text-white/90 break-words">
              <div>
                <p className="text-sm text-white/60 mb-4">
                  <strong>Effective Date:</strong> October 2025
                </p>
                <p>
                  At Social Echo, we strive for clarity and fairness in billing. Please read this policy carefully.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1. General Refunds</h3>
                <p><strong>Payments are non-refundable.</strong> Refunds are only issued if required by consumer protection law or in cases of verified technical billing errors.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">2. Trials</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You are not charged during the free trial period</li>
                  <li>If you upgrade to a paid plan before the trial ends, your free trial ends immediately and the new plan is billed at its standard price</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">3. Upgrades</h3>
                <p className="mb-2">When upgrading (e.g., Starter → Pro or Pro → Agency):</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The new plan takes effect immediately</li>
                  <li>A new billing cycle starts the day of the upgrade</li>
                  <li><strong>No refunds or credits are given for unused time on your previous plan</strong></li>
                  <li>You will be billed the full price of the new plan immediately</li>
                  <li>The new renewal date will be one month from the upgrade date</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">4. Cancellations</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You can cancel your subscription anytime through your Account page</li>
                  <li>Your plan remains active until the end of the paid period</li>
                  <li>No partial refunds are given for unused time</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">5. Billing Errors</h3>
                <p>If you believe you were billed incorrectly, contact <a href="mailto:support@socialecho.ai" className="text-purple-400 hover:text-purple-300 underline">support@socialecho.ai</a> within 7 days of the charge. We'll investigate and correct any errors.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">6. Special Circumstances</h3>
                <p>Refunds may be considered on a case-by-case basis for duplicate payments or verified technical issues.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">7. Contact</h3>
                <p>
                  📧 <a href="mailto:support@socialecho.ai" className="text-purple-400 hover:text-purple-300 underline">support@socialecho.ai</a>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-white/60 text-sm">
              <Link href="/help" className="hover:text-white transition-colors">
                Help Center
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link href="/account" className="hover:text-white transition-colors">
                Manage Account
              </Link>
              <span className="hidden sm:inline">•</span>
              <a href="mailto:support@socialecho.ai" className="hover:text-white transition-colors">
                Contact Support
              </a>
            </div>
          </motion.div>
        </Container>
      </main>
    </div>
  )
}

