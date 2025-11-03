'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, Check } from 'lucide-react'
import Link from 'next/link'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isTrialing: boolean
}

export default function UpgradeModal({ isOpen, onClose, onConfirm, isTrialing }: UpgradeModalProps) {
  const [agreed, setAgreed] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!agreed) return

    setIsUpgrading(true)
    setError(null)

    try {
      await onConfirm()
      // Success handled by parent component (redirect)
    } catch (err: any) {
      setError(err.message || 'Upgrade failed. Please try again.')
      setIsUpgrading(false)
    }
  }

  const handleClose = () => {
    if (!isUpgrading) {
      setAgreed(false)
      setError(null)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl shadow-2xl border border-white/20 max-w-lg w-full my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Upgrade to Pro
                    </h2>
                    <p className="text-purple-200 text-sm">
                      Unlock unlimited posts and advanced features
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isUpgrading}
                    className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Pricing */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-white/60 text-sm">Pro Plan</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-white">£49.99</span>
                      <span className="text-white/60 text-sm ml-1">/month</span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm text-white/80">
                      <Check className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" />
                      <span>Unlimited posts per month</span>
                    </div>
                    <div className="flex items-center text-sm text-white/80">
                      <Check className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" />
                      <span>Advanced AI features</span>
                    </div>
                    <div className="flex items-center text-sm text-white/80">
                      <Check className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" />
                      <span>Priority support</span>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 min-w-0">
                      <h3 className="text-yellow-200 font-semibold text-sm">
                        Important Billing Information
                      </h3>
                      <div className="text-yellow-100/90 text-sm space-y-2 break-words">
                        {isTrialing ? (
                          <>
                            <p>
                              • Your free trial will end immediately
                            </p>
                            <p>
                              • You will be charged <strong>£49.99 today</strong>
                            </p>
                            <p>
                              • Your new billing cycle starts today
                            </p>
                            <p>
                              • Next renewal: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
                            </p>
                          </>
                        ) : (
                          <>
                            <p>
                              • Your plan will be <strong>switched to Pro</strong> immediately
                            </p>
                            <p>
                              • You will be charged <strong>£49.99 today</strong>
                            </p>
                            <p>
                              • A new billing cycle starts today
                            </p>
                            <p>
                              • Your usage limit resets to 100 posts/month
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      disabled={isUpgrading}
                      className="w-5 h-5 rounded border-2 border-white/30 bg-white/10 checked:bg-purple-600 checked:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors cursor-pointer disabled:opacity-50"
                    />
                  </div>
                  <span className="text-white/90 text-sm leading-relaxed break-words min-w-0">
                    I understand that {isTrialing ? 'my trial will end and I will be' : 'my plan will be switched to Pro and I will be'} charged £49.99 today, starting a new monthly billing cycle.
                  </span>
                </label>

                {/* Terms Link */}
                <p className="text-white/60 text-xs text-center break-words">
                  By upgrading, you agree to our{' '}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline" target="_blank">
                    Terms of Service and Refund Policy
                  </Link>
                </p>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-200 text-sm break-words">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleClose}
                    disabled={isUpgrading}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!agreed || isUpgrading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-purple-600 disabled:to-pink-600"
                  >
                    {isUpgrading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Upgrading...
                      </span>
                    ) : (
                      `Upgrade to Pro — £49.99 today`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

