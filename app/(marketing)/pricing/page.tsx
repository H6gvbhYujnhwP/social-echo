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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
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
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">£29.99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                  <p className="text-green-700 text-sm font-medium">🎉 1-Day Free Trial</p>
                  <p className="text-green-600 text-xs">Card required. Billed in 24 hours unless you cancel.</p>
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
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg"
              >
                Start 1-Day Free Trial
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
                  <span className="font-bold">30 posts per month</span>
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

        {/* Agency Plan */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-4">Agency White Label Plan</h2>
          <p className="text-center text-gray-600 mb-8">
            Grow as you go — £39/client/month with unlimited capacity
          </p>
          <div className="max-w-2xl mx-auto">
            {/* Agency — Grow as You Go */}
            <GlassCard className="p-8 border-2 border-purple-500">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  AGENCY PLAN
                </span>
              </div>
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold mb-2">Agency — Grow as You Go</h3>
                <div className="flex items-baseline gap-2 mb-4 justify-center">
                  <span className="text-4xl font-bold">£39</span>
                  <span className="text-gray-600">/client/month</span>
                </div>
                <p className="text-gray-600">One simple rate. Unlimited potential.</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Unlimited client accounts</strong> — add as many as you need</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Unlimited posts per client</strong> — no caps, no limits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Branded white-label instance</strong> — your logo, your colors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Admin dashboard</strong> — manage all clients in one place</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Custom domain support</strong> — use your own domain</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Auto-proration billing</strong> — only pay for what you use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Priority support</strong> — dedicated help when you need it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Export-ready content</strong> — CSV, PDF, and more</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('SocialEcho_AgencyStarter')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
              >
                Get Started
              </button>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Revenue Example:</strong> Resell at £99/client = <strong className="text-green-600">£60 margin per client</strong>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  With 25 clients: £2,475/mo revenue, £1,500/mo profit
                </p>
              </div>
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
              <p className="text-gray-600">On Starter (8/month) and Pro (30/month) plans, you'll be prompted to wait for your monthly reset or contact us for custom solutions. Agency plans have unlimited posts.</p>
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
