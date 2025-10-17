'use client';

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
  
  return (
    <header className="w-full border-b border-white/10 bg-transparent">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-wide text-white hover:opacity-90 transition-opacity">
          SOCIAL ECHO
        </Link>
        
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
        
        {/* Mobile menu can be added later if needed */}
      </div>
    </header>
  );
}

