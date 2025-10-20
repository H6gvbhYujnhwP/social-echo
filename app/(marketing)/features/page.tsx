import FeaturesFlow from '@/components/FeaturesFlow'
import Container from '@/components/layout/Container'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features - How SocialEcho Works',
  description: 'Discover how SocialEcho helps you create professional LinkedIn content in minutes. From training your Echo to publishing polished posts with AI-generated images.',
  openGraph: {
    title: 'Features - How SocialEcho Works',
    description: 'See how easy it is to create professional content with your personal AI assistant.',
  },
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <Container className="py-12 sm:py-16">
        <FeaturesFlow />
      </Container>
    </div>
  )
}

