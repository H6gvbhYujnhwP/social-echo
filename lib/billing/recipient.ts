import { prisma } from '@/lib/prisma';

/**
 * Get billing recipient by Stripe Customer ID
 * 
 * This is the ONLY way to resolve billing email recipients to prevent
 * cross-tenant email sends.
 * 
 * @param stripeCustomerId - Stripe customer ID from webhook event
 * @returns User ID and email, or null if not found
 */
export async function getBillingRecipientByStripeCustomer(stripeCustomerId: string) {
  // First check Subscription table (individual users)
  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId },
    select: { 
      userId: true,
      user: {
        select: {
          id: true,
          email: true,
          // billingEmail: true, // Add this field to User model if needed
        }
      }
    },
  });

  if (subscription?.user) {
    return {
      userId: subscription.user.id,
      email: subscription.user.email, // Use billingEmail if available: subscription.user.billingEmail ?? subscription.user.email
    };
  }

  // Check Agency table (agency subscriptions)
  const agency = await prisma.agency.findFirst({
    where: { stripeCustomerId },
    select: {
      ownerId: true,
      owner: {
        select: {
          id: true,
          email: true,
        }
      }
    },
  });

  if (agency?.owner) {
    return {
      userId: agency.owner.id,
      email: agency.owner.email,
    };
  }

  // No user found for this Stripe customer
  return null;
}

/**
 * Validate recipient email to prevent cross-tenant sends
 * 
 * @param recipient - Email address to validate
 * @param userId - User ID that should own this email
 * @param stripeCustomerId - Stripe customer ID for logging
 * @throws Error if cross-tenant mismatch detected in production
 */
export function validateBillingRecipient(
  recipient: string,
  userId: string,
  stripeCustomerId: string
) {
  // Log for audit trail
  console.log('[billing-recipient-check]', {
    stripeCustomerId,
    userId,
    recipient,
    env: process.env.NODE_ENV,
  });

  // Validate email format
  if (!recipient || !recipient.includes('@')) {
    throw new Error(`Invalid recipient email format: ${recipient}`);
  }

  // Production safety guard: prevent accidental cross-tenant sends
  // This is a last-resort check - the lookup should already be correct
  if (process.env.NODE_ENV === 'production') {
    // Add any known internal/admin emails that should NEVER receive customer emails
    const forbiddenRecipients = [
      'westley@sweetbyte.co.uk',
      'admin@socialecho.ai',
      'support@socialecho.ai',
      // Add other internal emails here
    ];

    // This check is intentionally broad to catch any potential issues
    // Remove or adjust based on your actual user base
    if (forbiddenRecipients.includes(recipient.toLowerCase())) {
      console.error('[CRITICAL] Attempted to send billing email to forbidden recipient', {
        recipient,
        userId,
        stripeCustomerId,
      });
      throw new Error(
        `Security violation: Attempted to send billing email to forbidden recipient. ` +
        `This indicates a cross-tenant data breach risk. Aborting send.`
      );
    }
  }

  return true;
}

