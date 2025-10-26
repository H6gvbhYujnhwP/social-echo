// app/pricing/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { trackPlanSelected } from '@/lib/analytics/track-event';

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (planKey: string, planName: string, price: number) => {
    // Track plan selection in GA4
    trackPlanSelected(planName, price, 'pricing_page');
    
    router.push(`/signup?plan=${planKey}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Select the perfect plan for your content needs
          </p>
        </div>

        {/* Individual Plans */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">Individual Plans</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Starter</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-5xl font-bold text-gray-900">£29.99</span>
                  <span className="text-gray-700 text-lg">/month</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                  <p className="text-green-800 text-sm font-semibold">🎉 1-Day Free Trial</p>
                  <p className="text-green-700 text-xs mt-1">Card required. Billed in 24 hours unless you cancel.</p>
                </div>
                <p className="text-gray-700 text-base">Perfect for freelancers and solopreneurs</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base"><strong className="font-semibold">8 posts per month</strong> (2 per week)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base">Text + image generation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base">Content Mix Planner</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base">Email support</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('SocialEcho_Starter', 'Starter', 29.99)}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg text-base"
              >
                Start 1-Day Free Trial
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-500 relative hover:shadow-2xl transition-shadow">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-md">
                  MOST POPULAR
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Pro</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-gray-900">£49.99</span>
                  <span className="text-gray-700 text-lg">/month</span>
                </div>
                <p className="text-gray-700 text-base">For SMEs wanting daily visibility</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-900 text-base font-semibold">30 posts per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base">Text + image generation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base">Full Content Mix Planner</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base">Customise output</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base">Priority support</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('SocialEcho_Pro', 'Pro', 49.99)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg text-base"
              >
                Get Started
              </button>
            </div>

            {/* Ultimate */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 border-2 border-purple-500 relative hover:shadow-2xl transition-shadow">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-md">
                  ✨ POWER USER
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ultimate</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold text-gray-900">£179</span>
                  <span className="text-gray-700 text-lg">/month</span>
                </div>
                <p className="text-gray-700 text-base">For power users who need unlimited content</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl mt-0.5 flex-shrink-0">✨</span>
                  <span className="text-gray-900 text-base font-semibold">Unlimited monthly posts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 text-xl mt-0.5 flex-shrink-0">✨</span>
                  <span className="text-gray-900 text-base font-semibold">Unlimited regenerations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base">All Pro features included</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base">Custom branding options</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('SocialEcho_Ultimate', 'Ultimate', 179)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-700 text-base">Yes, you can cancel your subscription at any time. After you cancel, you will not be charged after your current billing period ends.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 text-lg mb-2">What happens when I reach my limit?</h3>
              <p className="text-gray-700 text-base">On Starter (8/month) and Pro (30/month) plans, you'll be prompted to wait for your monthly reset or contact us for custom solutions.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 text-lg mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-gray-700 text-base">Yes, you can change your plan at any time through the billing portal.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

