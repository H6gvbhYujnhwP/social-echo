// lib/billing/client.ts
'use client';

import { PlanKey } from './plans';

/**
 * Launch Stripe Checkout for a specific plan
 */
export async function startCheckout(planKey: PlanKey): Promise<void> {
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planKey }),
    });
    
    const data = await res.json();
    
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Failed to create checkout session');
    }
    
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    throw error;
  }
}

/**
 * Open Stripe Customer Portal for billing management
 */
export async function openBillingPortal(): Promise<void> {
  try {
    const res = await fetch('/api/portal', { 
      method: 'POST' 
    });
    
    const data = await res.json();
    
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Failed to open billing portal');
    }
    
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error: any) {
    console.error('Portal error:', error);
    throw error;
  }
}
