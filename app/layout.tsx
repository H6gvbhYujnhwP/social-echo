import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  metadataBase: new URL('https://socialecho.ai'),
  title: {
    default: 'Social Echo - AI Social Media Content Generator for SMEs',
    template: '%s | Social Echo'
  },
  description: 'Train your ECHO once — then generate your daily social media post + image in under 10 minutes. AI-powered content creation for busy SME owners.',
  keywords: ['social media content', 'AI content generator', 'social media automation', 'SME marketing', 'social posts', 'AI writing', 'content creation', 'business marketing'],
  authors: [{ name: 'Social Echo Team' }],
  creator: 'Social Echo',
  publisher: 'Social Echo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://socialecho.ai',
    siteName: 'Social Echo',
    title: 'Social Echo - AI Social Media Content Generator for SMEs',
    description: 'Train your ECHO once — then generate your daily social media post + image in under 10 minutes. AI-powered content creation for busy SME owners.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Social Echo - AI Social Media Content Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Echo - AI Social Media Content Generator for SMEs',
    description: 'Train your ECHO once — then generate your daily social media post + image in under 10 minutes.',
    images: ['/og-image.png'],
    creator: '@socialecho',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}

