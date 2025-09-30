import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Social Echo - AI LinkedIn Content Generator',
  description: 'Train your ECHO once — then generate your daily LinkedIn post + image in under 10 minutes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <header className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">SOCIAL ECHO</h1>
              </div>
              <nav className="flex items-center space-x-4">
                <a href="/train" className="text-gray-600 hover:text-blue-600">Train again</a>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">Account</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">Billing</span>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}
