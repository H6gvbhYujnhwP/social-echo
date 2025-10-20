'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface BackButtonProps {
  label?: string
  fallbackUrl?: string
  className?: string
}

export function BackButton({ 
  label = 'Back', 
  fallbackUrl = '/',
  className = ''
}: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Check if there's history to go back to
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // Fallback to homepage or specified URL
      router.push(fallbackUrl)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Support Enter and Space keys for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleBack()
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label="Go back"
      className={`
        inline-flex items-center gap-1.5 
        py-2 px-1
        text-sm font-medium 
        text-gray-700 hover:text-blue-600 
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
        cursor-pointer
        min-h-[44px]
        ${className}
      `}
    >
      <ChevronLeft size={20} className="flex-shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}

