import { prisma } from '@/lib/prisma';
import { getBillingRecipientByStripeCustomer, validateBillingRecipient } from './recipient';

/**
 * Email types for billing emails
 */
export type BillingEmailType =
  | 'upgrade'
  | 'welcome'
  | 'onboarding'
  | 'reactivation'
  | 'cancellation'
  | 'trial_started'
  | 'trial_converted'
  | 'trial_cancelled'
  | 'payment_success'
  | 'payment_failed'
  | 'subscription_upgraded'
  | 'subscription_downgraded';

/**
 * Audit log status
 */
type EmailStatus = 'sent' | 'skipped_no_user' | 'skipped_invalid_recipient' | 'duplicate' | 'error';

/**
 * Secure billing email sender with defense-in-depth
 * 
 * This is the ONLY way to send billing emails to prevent cross-tenant sends.
 * 
 * Features:
 * - Maps recipient via stripeCustomerId (single source of truth)
 * - Validates recipient before send
 * - Idempotency via EmailLog
 * - Structured audit logging
 * - No admin/CC/BCC emails
 * 
 * @param params - Email parameters
 * @returns Promise<boolean> - true if sent, false if skipped
 */
export async function sendSecureBillingEmail(params: {
  stripeCustomerId: string;
  eventId: string;
  type: BillingEmailType;
  sendFn: (recipient: string, userName: string, ...args: any[]) => Promise<void | boolean>;
  sendArgs?: any[];
}): Promise<boolean> {
  const { stripeCustomerId, eventId, type, sendFn, sendArgs = [] } = params;

  // Structured audit log
  const logAudit = (status: EmailStatus, recipient?: string, userId?: string, error?: string) => {
    console.log('[billing-email]', JSON.stringify({
      type,
      customerId: stripeCustomerId,
      userId: userId || null,
      recipient: recipient || null,
      eventId,
      status,
      error: error || null,
      timestamp: new Date().toISOString(),
    }));
  };

  try {
    // A) Recipient resolution (single source of truth)
    const recipient = await getBillingRecipientByStripeCustomer(stripeCustomerId);

    if (!recipient) {
      logAudit('skipped_no_user');
      console.warn(`[billing-email] No user found for Stripe customer: ${stripeCustomerId}`);
      return false;
    }

    // B) Validation guards
    if (!recipient.email || !recipient.email.includes('@')) {
      logAudit('skipped_invalid_recipient', recipient.email, recipient.userId);
      console.warn(`[billing-email] Invalid recipient email for user: ${recipient.userId}`);
      return false;
    }

    // Validate recipient to prevent cross-tenant sends
    try {
      validateBillingRecipient(recipient.email, recipient.userId, stripeCustomerId);
    } catch (err: any) {
      logAudit('error', recipient.email, recipient.userId, err.message);
      throw err; // Re-throw to prevent send
    }

    // C) Idempotency check
    const emailKey = `${eventId}:${type}:${stripeCustomerId}`;
    const existingLog = await prisma.emailLog.findUnique({ where: { key: emailKey } });

    if (existingLog) {
      logAudit('duplicate', recipient.email, recipient.userId);
      console.log(`[billing-email] Email already sent for event: ${eventId}, type: ${type}`);
      return false;
    }

    // Get user name
    const user = await prisma.user.findUnique({
      where: { id: recipient.userId },
      select: { name: true },
    });

    const userName = user?.name || 'there';

    // Send email
    await sendFn(recipient.email, userName, ...sendArgs);

    // D) Log the email send
    await prisma.emailLog.create({
      data: {
        key: emailKey,
        type,
        userId: recipient.userId,
        recipient: recipient.email,
      },
    });

    logAudit('sent', recipient.email, recipient.userId);
    return true;
  } catch (err: any) {
    logAudit('error', undefined, undefined, err.message);
    console.error(`[billing-email] CRITICAL ERROR sending ${type} email:`, err);
    throw err; // Re-throw to ensure errors are visible
  }
}

/**
 * Helper to send secure billing email with automatic error handling
 * 
 * Use this for fire-and-forget email sends in webhooks
 */
export function sendSecureBillingEmailSafe(params: Parameters<typeof sendSecureBillingEmail>[0]): void {
  sendSecureBillingEmail(params).catch((err) => {
    console.error(`[billing-email] Failed to send ${params.type} email:`, err);
  });
}

