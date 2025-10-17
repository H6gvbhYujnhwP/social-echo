// components/BillingButtons.tsx
'use client';

import { useState } from 'react';
import { startCheckout, openBillingPortal } from '@/lib/billing/client';
import { PlanKey } from '@/lib/billing/plans';
import { Button } from './ui/Button';

interface CheckoutButtonProps {
  planKey: PlanKey;
  children: React.ReactNode;
  className?: string;
}

export function CheckoutButton({ planKey, children, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await startCheckout(planKey);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={handleClick} 
        disabled={loading}
        className={className}
      >
        {loading ? 'Loading...' : children}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}

interface BillingPortalButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export function BillingPortalButton({ children = 'Manage Billing', className }: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await openBillingPortal();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={handleClick} 
        disabled={loading}
        className={className}
      >
        {loading ? 'Loading...' : children}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
