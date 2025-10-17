'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NAV_LINKS = [
  { href: '/features',  label: 'Features' },
  { href: '/pricing',   label: 'Pricing' },
  { href: '/resellers', label: 'Resellers' },
  { href: '/help',      label: 'Help' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="w-full border-b border-white/10 bg-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-wide text-white hover:opacity-90 transition-opacity">
          SOCIAL ECHO
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden gap-8 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-opacity ${
                pathname === href 
                  ? 'text-white opacity-100' 
                  : 'text-white/80 hover:text-white hover:opacity-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        
        {/* Desktop CTA Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link 
            href="/signin" 
            className="text-sm font-medium text-white/80 hover:text-white hover:opacity-100 transition-opacity"
          >
            Sign In
          </Link>
          <Link 
            href="/pricing" 
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started
          </Link>
        </div>
        
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <span className="sr-only">Open main menu</span>
          {/* Hamburger Icon */}
          {!mobileMenuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMounted && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={closeMobileMenu}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            id="mobile-menu"
            className={`fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Close Button */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <span className="text-xl font-bold text-gray-900">Menu</span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-colors"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <span className="sr-only">Close menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col px-6 py-6 space-y-1">
              {/* Main Navigation Links */}
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`py-3 px-6 text-lg font-medium rounded-lg transition-colors ${
                    pathname === href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={closeMobileMenu}
                >
                  {label}
                </Link>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-200 my-4" />

              {/* Sign In Link */}
              <Link
                href="/signin"
                className="py-3 px-6 text-lg font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                Sign In
              </Link>

              {/* Get Started Button */}
              <Link
                href="/pricing"
                className="py-3 px-6 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-center shadow-lg"
                onClick={closeMobileMenu}
              >
                Get Started
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

