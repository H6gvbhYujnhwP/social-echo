export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Container from '@/components/layout/Container';
import ResetPasswordForm from './ResetPasswordForm';

interface PageProps {
  searchParams: { token?: string };
}

export default function ResetPasswordPage({ searchParams }: PageProps) {
  const token = searchParams?.token ?? '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reset Your Password
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Enter your new password below.
              </p>
            </div>

            {/* Client Form Component */}
            <ResetPasswordForm token={token} />

            {/* Back to Sign In */}
            <div className="mt-6 text-center">
              <Link
                href="/signin"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Sign In
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Your password must be at least 8 characters long. After resetting, 
                you'll be redirected to sign in with your new password.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

