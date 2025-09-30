'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Welcome to SOCIAL ECHO
            </CardTitle>
            <p className="mt-4 text-lg text-gray-600">
              Train your ECHO once — then generate your daily LinkedIn post + image in under 10 minutes.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/train')}
              className="w-full"
              size="lg"
            >
              Train my ECHO
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
