// lib/billing/stripe.ts
import Stripe from 'stripe';

// Initialize Stripe only if API key is available
// This allows the build to succeed even without Stripe configured
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as any, // Stable API version
    })
  : null as any as Stripe; // Type assertion for build compatibility
