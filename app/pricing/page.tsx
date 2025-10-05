// app/pricing/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (planKey: string) => {
    router.push(`/signup?plan=${planKey}`);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <GradientText className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </GradientText>
          <p className="text-gray-600 text-lg">
            Select the perfect plan for your content needs
          </p>
        </div>

        {/* Individual Plans */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Individual Plans</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter */}
            <GlassCard className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">£29.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">Perfect for freelancers and solopreneurs</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>8 posts per month (2 per week)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Text + image generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Content Mix Planner</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Email support</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('SocialEcho_Starter')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get Started
              </button>
            </GlassCard>

            {/* Pro */}
            <GlassCard className="p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  MOST POPULAR
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold">£49.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600">For SMEs wanting daily visibility</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="font-bold">Unlimited posts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Text + image generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Full Content Mix Planner</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Customise output</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('SocialEcho_Pro')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get Started
              </button>
            </GlassCard>
          </div>
        </div>

        {/* Agency Plans */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-4">Agency White Label Plans</h2>
          <p className="text-center text-gray-600 mb-8">
            Resell to your clients and earn up to 520% markup
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Agency Starter */}
            <GlassCard className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Agency Starter</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">£199</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Up to 10 client accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Unlimited posts per client</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Branded white-label</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Admin dashboard</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('SocialEcho_AgencyStarter')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get Started
              </button>
              <p className="text-xs text-center mt-3 text-gray-500">
                Resell at £99/client = £791 margin
              </p>
            </GlassCard>

            {/* Agency Growth */}
            <GlassCard className="p-6 border-2 border-purple-500">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Agency Growth</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">£399</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Up to 25 client accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Unlimited posts per client</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Custom domain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Export-ready content</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('SocialEcho_AgencyGrowth')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get Started
              </button>
              <p className="text-xs text-center mt-3 text-gray-500">
                Resell at £99/client = £2,076 margin (520%)
              </p>
            </GlassCard>

            {/* Agency Scale */}
            <GlassCard className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Agency Scale</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">£799</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Up to 50 client accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Advanced branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Team seats</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Quarterly strategy call</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('SocialEcho_AgencyScale')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get Started
              </button>
              <p className="text-xs text-center mt-3 text-gray-500">
                Resell at £99/client = £4,151 margin
              </p>
            </GlassCard>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <GlassCard className="p-6">
              <h3 className="font-bold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your subscription at any time. No questions asked.</p>
            </GlassCard>
            <GlassCard className="p-6">
              <h3 className="font-bold mb-2">What happens when I reach my limit?</h3>
              <p className="text-gray-600">On the Starter plan, you'll be prompted to upgrade. Pro and Agency plans have unlimited posts.</p>
            </GlassCard>
            <GlassCard className="p-6">
              <h3 className="font-bold mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-gray-600">Yes, you can change your plan at any time through the billing portal.</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
