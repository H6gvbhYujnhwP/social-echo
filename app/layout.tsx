import type { Metadata } from 'next'
import '../styles/globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'
import { ImpersonationBanner } from '@/components/ImpersonationBanner'
import HelpAssistant from '@/components/ai/HelpAssistant'

export const metadata: Metadata = {
  metadataBase: new URL('https://socialecho.ai'),
  title: {
    default: 'Social Echo - AI LinkedIn Content Generator for SMEs',
    template: '%s | Social Echo'
  },
  description: 'Train your ECHO once — then generate your daily LinkedIn post + image in under 10 minutes. AI-powered content creation for busy SME owners.',
  keywords: ['LinkedIn content', 'AI content generator', 'social media automation', 'SME marketing', 'LinkedIn posts', 'AI writing', 'content creation', 'business marketing'],
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
    title: 'Social Echo - AI LinkedIn Content Generator for SMEs',
    description: 'Train your ECHO once — then generate your daily LinkedIn post + image in under 10 minutes. AI-powered content creation for busy SME owners.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Social Echo - AI LinkedIn Content Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Echo - AI LinkedIn Content Generator for SMEs',
    description: 'Train your ECHO once — then generate your daily LinkedIn post + image in under 10 minutes.',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://socialecho.ai" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <ImpersonationBanner />
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <HelpAssistant />
        </Providers>
      </body>
    </html>
  )
}
