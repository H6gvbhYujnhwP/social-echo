'use client'

import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

interface TrialExhaustedModalProps {
  open: boolean
  onClose: () => void
}

export default function TrialExhaustedModal({ open, onClose }: TrialExhaustedModalProps) {
  const router = useRouter()
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Content */}
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            You've reached the end of your trial
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            If you're enjoying Social Echo, upgrade your plan to keep creating posts and growing your LinkedIn presence.
          </p>
          
          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Choose your plan:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>Starter</strong> — £29.99/month (8 posts)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>Pro</strong> — £49.99/month (20 posts)</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose()
              router.push('/account?tab=billing')
            }}
            className="flex-1 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
          >
            Go to Billing
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}

