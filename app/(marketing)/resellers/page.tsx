export const metadata = {
  title: 'Resellers – Social Echo',
  description: 'White-label Social Echo and resell at 5× markup. Per-client billing, VAT invoices, branding controls.',
};

import Link from 'next/link';

export default function ResellersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-16 text-white">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Grow Revenue with Social Echo Reseller Plans
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          White-label ready for agencies — resell at <strong>5× markup</strong> with per-client billing and VAT-compliant invoices.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="mailto:sales@socialecho.ai" 
            className="rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg"
          >
            Become a Reseller
          </Link>
          <Link 
            href="/contact" 
            className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold hover:bg-white/10 transition-colors"
          >
            Schedule a Demo
          </Link>
        </div>
      </section>

      {/* Why Resell Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Why Resell Social Echo?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'White-Label Branding',
              description: 'Your logo, your colors, your domain. Fully branded for your agency.',
            },
            {
              title: 'Per-Client Billing',
              description: 'Simple £39/client/month pricing. Resell at £99+ for healthy margins.',
            },
            {
              title: 'VAT Invoices',
              description: 'Automated VAT-compliant invoices for UK and EU clients.',
            },
            {
              title: 'AI Text + Image',
              description: 'Full social media content generation with AI-powered text and images.',
            },
            {
              title: 'Client Seat Controls',
              description: 'Admin dashboard to manage all client accounts in one place.',
            },
            {
              title: 'Usage Analytics',
              description: 'Track client usage, engagement, and content performance.',
            },
          ].map((feature, index) => (
            <div 
              key={index} 
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="max-w-3xl mx-auto">
          <ol className="space-y-6">
            {[
              {
                step: 1,
                title: 'Sign Up & Verify',
                description: 'Contact our sales team to set up your reseller account and verify your agency status.',
              },
              {
                step: 2,
                title: 'Add Clients',
                description: 'Create client accounts and set up per-client subscriptions with automated billing.',
              },
              {
                step: 3,
                title: 'Configure Branding',
                description: 'Apply your logo, colors, and custom domain to create a fully white-labeled experience.',
              },
              {
                step: 4,
                title: 'Launch & Bill',
                description: 'Launch your clients and bill them monthly. We handle the infrastructure, you keep the margin.',
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing & Terms Section */}
      <section className="mb-16">
        <div className="max-w-3xl mx-auto rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8">
          <h2 className="text-3xl font-bold mb-4 text-center">Pricing & Terms</h2>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-blue-400 mb-2">£39/client/mo</div>
            <p className="text-gray-300">Resell at £99+ for 154% markup</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-center mb-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">You Pay</div>
              <div className="text-2xl font-bold">£39/mo</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">You Charge</div>
              <div className="text-2xl font-bold text-green-400">£99/mo</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Your Margin</div>
              <div className="text-2xl font-bold text-green-400">£60/mo</div>
            </div>
          </div>
          <p className="text-center text-gray-300 text-sm">
            With 25 clients: Earn £2,475/mo in revenue, £1,500/mo profit margin
          </p>
          <p className="text-center text-gray-400 text-xs mt-4">
            Reseller enrollment is managed via our Sales team. Contact us to get started.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              question: 'Can I use my own branding?',
              answer: 'Yes! You can customize the logo, colors, and use your own custom domain for a fully white-labeled experience.',
            },
            {
              question: 'How does support work?',
              answer: 'You receive priority support from our team. Your clients can contact you, and you can escalate to us as needed.',
            },
            {
              question: 'What are the margins?',
              answer: 'You pay £39/client/month and can resell at £99+ per month, giving you a healthy 154% markup and £60+ margin per client.',
            },
            {
              question: 'Do you provide VAT invoices?',
              answer: 'Yes, all invoices are VAT-compliant for UK and EU clients, making your accounting simple.',
            },
            {
              question: 'Can clients cancel anytime?',
              answer: 'Yes, clients can cancel at any time. You only pay for active client subscriptions.',
            },
          ].map((faq, index) => (
            <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Resell Social Echo?</h2>
        <p className="text-xl text-gray-300 mb-8">
          Join agencies already earning recurring revenue with our white-label platform.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="mailto:sales@socialecho.ai" 
            className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg"
          >
            Contact Sales
          </Link>
          <Link 
            href="/contact" 
            className="rounded-lg border border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Book a Demo
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}

