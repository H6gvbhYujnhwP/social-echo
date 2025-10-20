'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import Container from '@/components/layout/Container';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle validation errors
        if (data.errors) {
          setError(data.errors[0]?.message || 'Invalid email address');
        } else {
          setError(data.error || 'Something went wrong');
        }
        setIsSubmitting(false);
        return;
      }

      // Success - show message regardless of whether email exists
      setIsSuccess(true);
      setEmail('');

      // Start 10-second cooldown
      setCooldown(10);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* Success Message */}
            {isSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ If that email exists in our system, we've sent a password reset link. 
                  Please check your inbox (and spam folder).
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ❌ {error}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                  placeholder="you@example.com"
                  disabled={isSubmitting || cooldown > 0}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cooldown > 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : cooldown > 0 ? (
                  `Wait ${cooldown}s`
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

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
                The reset link will expire in 30 minutes. If you don't receive an email, 
                please check your spam folder or contact support.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

