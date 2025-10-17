'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export function Header() {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Don't render Header on marketing pages - they use NavBar instead
  const isMarketingPage = pathname === '/' || 
                         pathname === '/features' || 
                         pathname === '/pricing' || 
                         pathname === '/resellers' || 
                         pathname === '/help' ||
                         pathname === '/signup' ||
                         pathname === '/signin'

  if (isMarketingPage) {
    return null
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={session ? '/dashboard' : '/'} onClick={closeMobileMenu}>
              <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">SOCIAL ECHO</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
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
                <Link href="/help" className="text-gray-600 hover:text-blue-600">
                  Help
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="/account" className="text-gray-600 hover:text-blue-600">
                  Account
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
                  href="/pricing"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-blue-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-200 mt-4 pt-4">
            {loading ? (
              <span className="block text-gray-400 py-2">Loading...</span>
            ) : session ? (
              // Authenticated mobile navigation
              <div className="flex flex-col space-y-3">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href="/planner"
                  className="text-gray-600 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Planner
                </Link>
                <Link
                  href="/train"
                  className="text-gray-600 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Train Again
                </Link>
                <Link
                  href="/help"
                  className="text-gray-600 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Help
                </Link>
                <Link
                  href="/account"
                  className="text-gray-600 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Account
                </Link>
                <div className="border-t border-gray-200 pt-3">
                  <span className="text-gray-700 font-medium block py-2">
                    {session.user?.email}
                  </span>
                  <button
                    onClick={() => {
                      closeMobileMenu()
                      signOut({ callbackUrl: '/' })
                    }}
                    className="text-gray-600 hover:text-blue-600 py-2 w-full text-left"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              // Unauthenticated mobile navigation
              <div className="flex flex-col space-y-3">
                <Link
                  href="/signin"
                  className="text-gray-600 hover:text-blue-600 py-2"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
