'use client'

import { helpContent } from './content'
import Link from 'next/link'
import Container from '@/components/layout/Container'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Container className="py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-4 break-words min-w-0 px-4">
            {helpContent.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto break-words px-4">
            {helpContent.intro}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6 sm:space-y-8">
          {helpContent.sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-lg shadow-md p-4 sm:p-8 min-w-0"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words min-w-0">
                {section.title}
              </h2>
              <div className="prose prose-blue max-w-none min-w-0">
                {section.body.split('\n').map((line, idx) => {
                  if (!line.trim()) return null
                  
                  // Handle bold markdown
                  if (line.includes('**')) {
                    const parts = line.split('**')
                    return (
                      <p key={idx} className="mb-3 break-words min-w-0">
                        {parts.map((part, i) => 
                          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                      </p>
                    )
                  }
                  
                  // Handle list items
                  if (line.trim().startsWith('-')) {
                    return (
                      <li key={idx} className="ml-4 sm:ml-6 mb-2 break-words min-w-0">
                        {line.trim().substring(1).trim()}
                      </li>
                    )
                  }
                  
                  // Regular paragraph
                  return (
                    <p key={idx} className="mb-3 text-gray-700 break-words min-w-0">
                      {line}
                    </p>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 sm:mt-12 text-center bg-blue-600 text-white rounded-lg p-6 sm:p-8 min-w-0">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 break-words">Ready to Get Started?</h3>
          <p className="mb-6 break-words px-4">
            Head to your dashboard and start creating amazing content with your Echo!
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition min-w-0"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Support Contact */}
        <div className="mt-6 sm:mt-8 text-center text-gray-600 px-4">
          <p className="break-words">
            Still need help?{' '}
            <a
              href="mailto:support@socialecho.ai"
              className="text-blue-600 hover:underline break-all"
            >
              Contact Support
            </a>
          </p>
        </div>
      </Container>
    </div>
  )
}

