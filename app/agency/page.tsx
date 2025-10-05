'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { Users, Zap, TrendingUp, Settings } from 'lucide-react';

function AgencyDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get('welcome');
  const [showWelcome, setShowWelcome] = useState(welcome === '1');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your agency dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        {showWelcome && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white relative">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2">🎉 Welcome to Your Agency Dashboard!</h2>
            <p className="text-blue-100">
              Your white-label Social Echo agency account is now active. Start managing your clients and delivering exceptional social media content.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <GradientText className="text-4xl font-bold mb-2">
            Agency Dashboard
          </GradientText>
          <p className="text-gray-600 text-lg">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Clients</p>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              <Users className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Posts This Month</p>
                <p className="text-3xl font-bold text-purple-600">0</p>
              </div>
              <Zap className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Active Accounts</p>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Plan Capacity</p>
                <p className="text-3xl font-bold text-orange-600">0/10</p>
              </div>
              <Settings className="w-10 h-10 text-orange-500 opacity-50" />
            </div>
          </GlassCard>
        </div>

        {/* Getting Started Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold mb-4">🚀 Getting Started</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Set Up Your Branding</h4>
                  <p className="text-gray-600 text-sm">Customize your white-label instance with your agency's branding and logo.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Add Your First Client</h4>
                  <p className="text-gray-600 text-sm">Create client accounts and start generating content for them.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Configure Client Profiles</h4>
                  <p className="text-gray-600 text-sm">Train each client's AI with their business information and brand voice.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Start Generating Content</h4>
                  <p className="text-gray-600 text-sm">Create unlimited posts for all your clients with AI-powered content generation.</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold mb-4">💡 Agency Features</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>White-label branded instance</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Unlimited posts per client</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Multi-client management dashboard</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Client account creation & management</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Export content in multiple formats</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Priority support channel</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Advanced analytics & reporting</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <GlassCard className="p-8">
          <h3 className="text-2xl font-bold mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-left">
              <Users className="w-6 h-6 mb-2" />
              <div>Add New Client</div>
              <p className="text-sm text-blue-100 mt-1">Create a new client account</p>
            </button>

            <button className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors text-left">
              <Settings className="w-6 h-6 mb-2" />
              <div>Branding Settings</div>
              <p className="text-sm text-purple-100 mt-1">Customize your white-label</p>
            </button>

            <button className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-left">
              <TrendingUp className="w-6 h-6 mb-2" />
              <div>View Analytics</div>
              <p className="text-sm text-green-100 mt-1">Check performance metrics</p>
            </button>
          </div>
        </GlassCard>

        {/* Coming Soon Notice */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-bold text-yellow-800 mb-2">🚧 Agency Features Coming Soon</h4>
          <p className="text-yellow-700 text-sm">
            We're currently building out the full agency dashboard with client management, white-label branding, and advanced features. 
            In the meantime, you can use the standard dashboard to generate content. We'll notify you when agency features are ready!
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AgencyDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AgencyDashboardContent />
    </Suspense>
  );
}
