'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ImpersonationSession {
  isImpersonating: boolean
  impersonatorName: string
  targetUserName: string
  expiresAt: string
}

export function ImpersonationBanner() {
  const router = useRouter()
  const [session, setSession] = useState<ImpersonationSession | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Check if currently impersonating
    async function checkImpersonation() {
      try {
        const response = await fetch('/api/impersonation/status')
        if (response.ok) {
          const data = await response.json()
          if (data.isImpersonating) {
            setSession(data)
          }
        }
      } catch (error) {
        console.error('Failed to check impersonation status:', error)
      }
    }

    checkImpersonation()
  }, [])

  useEffect(() => {
    if (!session) return

    // Update time remaining every second
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const expires = new Date(session.expiresAt).getTime()
      const diff = expires - now

      if (diff <= 0) {
        // Session expired - exit impersonation
        handleExit()
      } else {
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [session])

  const handleExit = async () => {
    setIsExiting(true)
    try {
      const response = await fetch('/api/impersonation/exit', {
        method: 'POST'
      })

      if (response.ok) {
        // Redirect to agency dashboard
        router.push('/agency')
        router.refresh()
      } else {
        alert('Failed to exit impersonation')
      }
    } catch (error) {
      alert('Failed to exit impersonation')
    } finally {
      setIsExiting(false)
    }
  }

  if (!session) return null

  return (
    <div className="bg-yellow-500 text-black px-4 py-3 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="font-semibold">
              Impersonating: <span className="font-bold">{session.targetUserName}</span>
            </p>
            <p className="text-sm">
              Logged in as {session.impersonatorName} • Time remaining: {timeRemaining}
            </p>
          </div>
        </div>

        <button
          onClick={handleExit}
          disabled={isExiting}
          className="bg-black text-yellow-500 px-4 py-2 rounded-md font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isExiting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exiting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Exit Impersonation
            </>
          )}
        </button>
      </div>
    </div>
  )
}
