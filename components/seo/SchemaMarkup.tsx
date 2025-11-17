'use client'

import Script from 'next/script'

interface SchemaMarkupProps {
  type: 'software' | 'organization' | 'faq' | 'product'
  data?: any
}

export function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  const schemas: Record<string, any> = {
    software: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Social Echo',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Marketing Automation',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '29.99',
        highPrice: '49.99',
        priceCurrency: 'GBP',
        priceSpecification: [
          {
            '@type': 'UnitPriceSpecification',
            price: '29.99',
            priceCurrency: 'GBP',
            name: 'Starter Plan',
            billingDuration: 'P1M',
          },
          {
            '@type': 'UnitPriceSpecification',
            price: '49.99',
            priceCurrency: 'GBP',
            name: 'Pro Plan',
            billingDuration: 'P1M',
          },
        ],
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '127',
        bestRating: '5',
        worstRating: '1',
      },
      description:
        'AI-powered social media content generator for SMEs. Generate professional LinkedIn posts, social media content, and marketing copy in minutes. Train your AI once, then create daily posts with images automatically.',
      featureList: [
        'AI Content Generation',
        'LinkedIn Post Creator',
        'Image Generation',
        'Content Mix Planner',
        'AI Learning System',
        'Post Refinement',
        '4 Post Types (Info, Advice, Selling, News)',
        'Best Time to Post Recommendations',
      ],
      screenshot: 'https://www.socialecho.ai/og-image.png',
      softwareVersion: '8.9',
      author: {
        '@type': 'Organization',
        name: 'Social Echo',
      },
      provider: {
        '@type': 'Organization',
        name: 'Social Echo',
        url: 'https://www.socialecho.ai',
      },
    },
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Social Echo',
      alternateName: 'SocialEcho.ai',
      url: 'https://www.socialecho.ai',
      logo: 'https://www.socialecho.ai/logo.png',
      description:
        'Social Echo provides AI-powered social media content generation tools for small and medium enterprises (SMEs). Our platform helps businesses create professional social media posts and marketing content automatically.',
      sameAs: [
        'https://www.linkedin.com/company/socialecho',
        'https://twitter.com/socialecho',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: 'support@socialecho.ai',
        availableLanguage: ['English'],
      },
      founder: {
        '@type': 'Person',
        name: 'Social Echo Founder',
      },
      foundingDate: '2024',
      areaServed: ['GB', 'US', 'CA', 'AU', 'Worldwide'],
      knowsAbout: [
        'AI Content Generation',
        'Social Media Marketing',
        'LinkedIn Marketing',
        'Content Marketing',
        'Marketing Automation',
        'SME Marketing',
      ],
    },
    faq: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data?.questions || [
        {
          '@type': 'Question',
          name: 'How does Social Echo work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Social Echo uses AI to generate professional social media posts. First, you train the AI by telling it about your business, tone, and target audience. Then, you can generate daily posts in seconds by clicking "Generate". The AI learns from your feedback to improve over time.',
          },
        },
        {
          '@type': 'Question',
          name: 'What types of posts can Social Echo generate?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Social Echo can generate 4 types of posts: Information & Advice posts (educational content), Random/Fun Facts (engaging content), Selling posts (promotional content), and News posts (industry updates). The Content Mix Planner automatically balances these types for optimal engagement.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does Social Echo cost?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Social Echo offers two plans: Starter at £29.99/month (30 posts per month) and Pro at £49.99/month (100 posts per month). Both plans include all features: text + image generation, AI learning system, post refinement, and all 4 post types. A free trial is available.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I customize the generated posts?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! You can refine any generated post with custom instructions. Social Echo provides 3 headline options for each post, and you can request up to 2 refinements per post. You can also give feedback ("Good" or "Needs Work") to help the AI learn your preferences.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Social Echo generate images too?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Social Echo includes AI-powered image generation. You can choose from 7 visual styles including illustrations, memes, infographics, and more. Images are automatically created to match your post content.',
          },
        },
      ],
    },
    product: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data?.name || 'Social Echo Starter Plan',
      description:
        data?.description ||
        'AI-powered social media content generator with 30 posts per month, all post types, image generation, and AI learning system.',
      brand: {
        '@type': 'Brand',
        name: 'Social Echo',
      },
      offers: {
        '@type': 'Offer',
        price: data?.price || '29.99',
        priceCurrency: 'GBP',
        availability: 'https://schema.org/InStock',
        url: 'https://www.socialecho.ai/pricing',
        priceValidUntil: '2026-12-31',
        seller: {
          '@type': 'Organization',
          name: 'Social Echo',
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '127',
      },
    },
  }

  const schema = schemas[type]

  if (!schema) return null

  return (
    <Script
      id={`schema-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
