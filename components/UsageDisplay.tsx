// components/UsageDisplay.tsx
'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { CheckoutButton, BillingPortalButton } from './BillingButtons';

interface Subscription {
  plan: string;
  status: string;
  usageCount: number;
  usageLimit: number | null;
  currentPeriodEnd: string;
}

export function UsageDisplay() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscription');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <p className="text-gray-600">Loading subscription...</p>
      </GlassCard>
    );
  }

  if (!subscription) {
    return (
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold mb-4">No Active Subscription</h3>
        <p className="text-gray-600 mb-4">
          Subscribe to a plan to start generating content.
        </p>
        <CheckoutButton planKey="SocialEcho_Pro">
          Subscribe Now
        </CheckoutButton>
      </GlassCard>
    );
  }

  const isUnlimited = subscription.usageLimit === null;
  const usagePercentage = isUnlimited || subscription.usageLimit === null ? 0 : (subscription.usageCount / subscription.usageLimit) * 100;
  const isNearLimit = usagePercentage >= 80 && !isUnlimited;
  const isPro = subscription.plan.toLowerCase() === 'pro';

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold capitalize">
            {subscription.plan} Plan
          </h3>
          <p className="text-sm text-gray-600 capitalize">
            Status: {subscription.status}
          </p>
        </div>
        <BillingPortalButton className="text-sm" />
      </div>

      {!isUnlimited && (
        <>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Posts this month</span>
              <span className="font-bold">
                {subscription.usageCount} / {subscription.usageLimit ?? 'Unlimited'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isNearLimit ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {isNearLimit && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                ⚠️ You're approaching your monthly limit!
              </p>
              {!isPro && (
                <CheckoutButton 
                  planKey="SocialEcho_Pro"
                  className="text-sm"
                >
                  Upgrade to Pro (30/month)
                </CheckoutButton>
              )}
              {isPro && (
                <p className="text-xs text-yellow-700 mt-1">
                  Your limit will reset on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {isUnlimited && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Unlimited posts — Generate as much as you need! (Agency Plan)
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        {!isUnlimited && 'Usage resets on: '}
        {isUnlimited && 'Billing period ends: '}
        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
      </p>
    </GlassCard>
  );
}
