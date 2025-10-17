// app/pricing/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (planKey: string) => {
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
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
                onClick={() => handleSelectPlan('SocialEcho_Starter')}
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
                onClick={() => handleSelectPlan('SocialEcho_Pro')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg text-base"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Agency Plan */}
        <div className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">Agency White Label Plan</h2>
          <p className="text-center text-gray-700 text-lg mb-12 max-w-2xl mx-auto">
            Grow as you go — £39/client/month with unlimited capacity
          </p>
          <div className="max-w-3xl mx-auto">
            {/* Agency — Grow as You Go */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-500 relative hover:shadow-2xl transition-shadow">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-md">
                  AGENCY PLAN
                </span>
              </div>
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Agency — Grow as You Go</h3>
                <div className="flex items-baseline gap-2 mb-4 justify-center">
                  <span className="text-5xl font-bold text-gray-900">£39</span>
                  <span className="text-gray-700 text-lg">/client/month</span>
                </div>
                <p className="text-gray-700 text-base">One simple rate. Unlimited potential.</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base"><strong className="font-semibold text-gray-900">Unlimited client accounts</strong> — add as many as you need</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base"><strong className="font-semibold text-gray-900">Unlimited posts per client</strong> — no caps, no limits</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base"><strong className="font-semibold text-gray-900">Branded white-label instance</strong> — your logo, your colors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base"><strong className="font-semibold text-gray-900">Admin dashboard</strong> — manage all clients in one place</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base"><strong className="font-semibold text-gray-900">Custom domain support</strong> — use your own domain</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base"><strong className="font-semibold text-gray-900">Auto-proration billing</strong> — only pay for what you use</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base"><strong className="font-semibold text-gray-900">Priority support</strong> — dedicated help when you need it</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-800 text-base"><strong className="font-semibold text-gray-900">Export-ready content</strong> — CSV, PDF, and more</span>
                </li>
              </ul>
              <button
                onClick={() => handleSelectPlan('SocialEcho_AgencyStarter')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg mb-4 text-base"
              >
                Get Started
              </button>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-800 font-medium">
                  <strong className="text-gray-900">Revenue Example:</strong> Resell at £99/client = <strong className="text-green-700">£60 margin per client</strong>
                </p>
                <p className="text-xs text-gray-700 mt-1.5">
                  With 25 clients: £2,475/mo revenue, £1,500/mo profit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-700 text-base">Yes, you can cancel your subscription at any time. No questions asked.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 text-lg mb-2">What happens when I reach my limit?</h3>
              <p className="text-gray-700 text-base">On Starter (8/month) and Pro (30/month) plans, you'll be prompted to wait for your monthly reset or contact us for custom solutions. Agency plans have unlimited posts.</p>
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

