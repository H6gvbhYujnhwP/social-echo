'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export function Header() {
  const { data: session, status } = useSession()
  const loading = status === 'loading'

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href={session ? '/dashboard' : '/'}>
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">SOCIAL ECHO</h1>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            {loading ? (
              <span className="text-gray-400">Loading...</span>
            ) : session ? (
              // Authenticated navigation
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                  Dashboard
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/planner" className="text-gray-600 hover:text-blue-600">
                  Planner
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/train" className="text-gray-600 hover:text-blue-600">
                  Train Again
                </Link>
                <span className="text-gray-400">•</span>
                <span className="text-gray-700 font-medium">
                  {session.user?.email}
                </span>
                <span className="text-gray-400">•</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              // Unauthenticated navigation
              <>
                <Link href="/signin" className="text-gray-600 hover:text-blue-600">
                  Sign In
                </Link>
                <span className="text-gray-400">•</span>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
