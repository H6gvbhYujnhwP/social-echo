'use client'

/**
 * Master Admin Dashboard
 * 
 * Main admin panel with links to all admin features.
 */

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import Container from '../../components/layout/Container'
import APICreditsCard from '../../components/admin/APICreditsCard'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/admin')
    }
  }, [status, router])
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!session) {
    return null
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words min-w-0">Master Admin Dashboard</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 break-words">
            Manage system configuration and settings
          </p>
        </div>
        
        {/* Admin Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* AI Configuration */}
          <Link
            href="/admin/ai-config"
            className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow min-w-0"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words min-w-0">AI Configuration</h3>
            <p className="text-gray-600 text-sm break-words min-w-0">
              Configure AI models, temperature, hashtag defaults, and feature toggles
            </p>
          </Link>
          
          {/* User Management */}
          <Link
            href="/admin/users"
            className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow min-w-0"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words min-w-0">User Management</h3>
            <p className="text-gray-600 text-sm break-words min-w-0">
              Manage users, roles, and permissions
            </p>
          </Link>
          
          {/* API Credits */}
          <APICreditsCard />
          
          {/* Analytics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 opacity-50 min-w-0">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 break-words min-w-0">System Analytics</h3>
            <p className="text-gray-600 text-sm break-words min-w-0">
              View usage statistics and system health (Coming soon)
            </p>
          </div>
        </div>
        
        {/* Back to App */}
        <div className="mt-6 sm:mt-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </Container>
    </div>
  )
}

