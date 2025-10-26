import type { Metadata } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import '../styles/globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'
import { ImpersonationBanner } from '@/components/ImpersonationBanner'
import HelpAssistant from '@/components/ai/HelpAssistant'
import GAPageview from './ga-pageview'

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
  icons: [
    { rel: 'icon', type: 'image/x-icon', url: '/favicon.ico' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon-16x16.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', url: '/apple-icon.png' },
  ],
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  
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
          <Suspense fallback={null}>
            <GAPageview />
          </Suspense>
        </Providers>
        
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: false });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}

