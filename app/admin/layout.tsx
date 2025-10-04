'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  // Don't redirect if on signin page
  const isSigninPage = pathname === '/admin/signin'
  
  useEffect(() => {
    if (status === 'unauthenticated' && !isSigninPage) {
      router.push('/admin/signin')
    }
  }, [status, router, isSigninPage])
  
  // Show loading state
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
  
  // If not authenticated and not on signin page, don't render
  if (!session && !isSigninPage) {
    return null
  }
  
  // If on signin page, render without layout
  if (isSigninPage) {
    return <>{children}</>
  }
  
  const userRole = (session?.user as any)?.role
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SE</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Social Echo</span>
              </Link>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                MASTER ADMIN
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session?.user?.email}
              </span>
              <Link
                href="/api/auth/signout"
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Social Echo Admin Panel • Secure Access
          </p>
        </div>
      </footer>
    </div>
  )
}
