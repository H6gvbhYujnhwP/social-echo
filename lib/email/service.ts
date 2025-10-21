// lib/email/service.ts
import { resend, EMAIL_CONFIG, isEmailEnabled } from './resend';
import * as templates from './templates';

export interface AgencyBranding {
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  agencyBranding?: AgencyBranding;
}

// Retry helper with exponential backoff
async function sendWithRetry(
  payload: any,
  attempts: number = 3
): Promise<{ id?: string; error?: any }> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await resend!.emails.send(payload);
      
      // Check if send was successful
      if (res?.data?.id) {
        return { id: res.data.id };
      }
      
      // If no ID but also no error, treat as failure
      if (res?.error) {
        throw new Error(res.error.message || 'Unknown Resend error');
      }
      
      throw new Error('No email ID returned from Resend');
    } catch (err: any) {
      const attempt = i + 1;
      console.error('[email] Send failed', {
        attempt,
        maxAttempts: attempts,
        to: payload.to,
        subject: payload.subject,
        error: err?.message || String(err),
      });
      
      // If this was the last attempt, throw the error
      if (attempt === attempts) {
        return { error: err };
      }
      
      // Exponential backoff: 1s, 3s
      const delay = attempt === 1 ? 1000 : 3000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { error: new Error('Max retry attempts reached') };
}

// Generic email sending function with retry and structured logging
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  // Input validation
  if (!options.to || !options.subject || !options.html || !options.text) {
    console.error('[email] Invalid email options', {
      hasTo: !!options.to,
      hasSubject: !!options.subject,
      hasHtml: !!options.html,
      hasText: !!options.text,
    });
    return false;
  }
  
  if (!isEmailEnabled()) {
    console.warn('[email] Email service disabled', {
      to: options.to,
      subject: options.subject,
      reason: process.env.DISABLE_EMAILS === 'true' ? 'DISABLE_EMAILS=true' : 'No RESEND_API_KEY',
    });
    return false;
  }

  try {
    // Import branding helpers
    const { applyAgencyBranding, applyAgencyBrandingText } = await import('./branding');

    // Determine the From name based on agency branding
    let fromName = 'Social Echo';
    if (options.agencyBranding) {
      fromName = `${options.agencyBranding.name} via Social Echo`;
    }

    // Apply agency branding to email content
    const brandedHtml = applyAgencyBranding(options.html, options.agencyBranding);
    const brandedText = applyAgencyBrandingText(options.text, options.agencyBranding);

    // Prepare email payload
    const payload = {
      from: `${fromName} <${EMAIL_CONFIG.from.split('<')[1].replace('>', '')}>`,
      to: options.to,
      subject: options.subject,
      html: brandedHtml,
      text: brandedText,
      replyTo: EMAIL_CONFIG.replyTo,
    };
    
    // Send with retry
    const result = await sendWithRetry(payload);
    
    if (result.id) {
      console.log('[email] Send successful', {
        id: result.id,
        to: options.to,
        subject: options.subject,
        branded: !!options.agencyBranding,
      });
      return true;
    } else {
      console.error('[email] Send failed after retries', {
        to: options.to,
        subject: options.subject,
        error: result.error?.message || String(result.error),
      });
      return false;
    }
  } catch (error: any) {
    console.error('[email] Unexpected error', {
      to: options.to,
      subject: options.subject,
      error: error?.message || String(error),
    });
    return false;
  }
}

// Welcome email for new users
export async function sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
  const template = templates.welcomeEmail(userName, to);
  return sendEmail({ to, ...template });
}

// Password reset email
export async function sendPasswordResetEmail(to: string, userName: string, resetUrl: string): Promise<boolean> {
  const template = templates.passwordResetEmail(userName, resetUrl);
  return sendEmail({ to, ...template });
}

// 2FA enabled confirmation
export async function send2FAEnabledEmail(to: string, userName: string): Promise<boolean> {
  const template = templates.twoFactorEnabledEmail(userName);
  return sendEmail({ to, ...template });
}

// Payment successful
export async function sendPaymentSuccessEmail(to: string, userName: string, planName: string, amount: string): Promise<boolean> {
  const template = templates.paymentSuccessEmail(userName, planName, amount);
  return sendEmail({ to, ...template });
}

// Payment failed
export async function sendPaymentFailedEmail(to: string, userName: string, planName: string): Promise<boolean> {
  const template = templates.paymentFailedEmail(userName, planName);
  return sendEmail({ to, ...template });
}

// Payment action required (SCA)
export async function sendPaymentActionRequiredEmail(to: string, userName: string, planName: string, invoiceId: string): Promise<boolean> {
  const template = templates.paymentActionRequiredEmail(userName, planName, invoiceId);
  return sendEmail({ to, ...template });
}

// Subscription upgraded
export async function sendSubscriptionUpgradedEmail(to: string, userName: string, oldPlan: string, newPlan: string): Promise<boolean> {
  const template = templates.subscriptionUpgradedEmail(userName, oldPlan, newPlan);
  return sendEmail({ to, ...template });
}

// NEW: Custom upgrade email for Starter → Pro with no-refund policy
export async function sendPlanUpgradeEmail(
  to: string,
  userName: string,
  amount: string,
  renewalDate: string
): Promise<boolean> {
  const template = templates.planUpgradeEmail(userName, amount, renewalDate);
  return sendEmail({ to, ...template });
}

// Subscription cancelled
export async function sendSubscriptionCancelledEmail(to: string, userName: string, planName: string, endDate: string): Promise<boolean> {
  const template = templates.subscriptionCancelledEmail(userName, planName, endDate);
  return sendEmail({ to, ...template });
}

// Usage limit warning
export async function sendUsageLimitWarningEmail(to: string, userName: string, usageCount: number, usageLimit: number): Promise<boolean> {
  const template = templates.usageLimitWarningEmail(userName, usageCount, usageLimit);
  return sendEmail({ to, ...template });
}

// Account suspended
export async function sendAccountSuspendedEmail(to: string, userName: string, reason?: string): Promise<boolean> {
  const template = templates.accountSuspendedEmail(userName, reason);
  return sendEmail({ to, ...template });
}

// Account reactivated
export async function sendAccountReactivatedEmail(to: string, userName: string): Promise<boolean> {
  const template = templates.accountReactivatedEmail(userName);
  return sendEmail({ to, ...template });
}


// Trial started email
export async function sendTrialStartedEmail(to: string, userName: string, trialEndDate: string): Promise<boolean> {
  const template = templates.trialStartedEmail(userName, trialEndDate);
  return sendEmail({ to, ...template });
}

// Trial converted to paid subscription
export async function sendTrialConvertedEmail(to: string, userName: string, planName: string): Promise<boolean> {
  const template = templates.trialConvertedEmail(userName, planName);
  return sendEmail({ to, ...template });
}

// Trial cancelled email
export async function sendTrialCancelledEmail(to: string, userName: string, planName: string): Promise<boolean> {
  const template = templates.trialCancelledEmail(userName, planName);
  return sendEmail({ to, ...template });
}




/**
 * Send subscription cancellation confirmation email
 */
export async function sendCancelConfirmationEmail(
  to: string,
  name: string,
  plan: string,
  effectiveDate: Date
): Promise<boolean> {
  if (!isEmailEnabled()) {
    console.log('[email] Email service disabled', {
      to,
      reason: 'DISABLE_EMAILS=true',
      type: 'cancel_confirmation',
    });
    return false;
  }

  try {
    const { html, text } = templates.cancelConfirmation(name, plan, effectiveDate);

    const payload = {
      from: EMAIL_CONFIG.from,
      to,
      subject: 'Your Social Echo subscription has been cancelled',
      html,
      text,
      reply_to: EMAIL_CONFIG.replyTo,
    };

    const result = await sendWithRetry(payload);

    if (result.id) {
      console.log('[email] Send successful', {
        id: result.id,
        to,
        subject: payload.subject,
        type: 'cancel_confirmation',
      });
      return true;
    }

    console.error('[email] Send failed', {
      to,
      subject: payload.subject,
      error: result.error,
      type: 'cancel_confirmation',
    });
    return false;
  } catch (err: any) {
    console.error('[email] Unexpected error', {
      to,
      error: err?.message || String(err),
      type: 'cancel_confirmation',
    });
    return false;
  }
}




/**
 * Send "Get The Most Out of Your Echo" onboarding email
 */
export async function sendOnboardingEmail(
  to: string,
  name: string
): Promise<boolean> {
  if (!isEmailEnabled()) {
    console.log('[email] Email service disabled', {
      to,
      reason: 'DISABLE_EMAILS=true',
      type: 'onboarding',
    });
    return false;
  }

  try {
    const helpUrl = process.env.HELP_URL || process.env.NEXTAUTH_URL + '/help';
    const template = templates.onboardingEmail(name, helpUrl);

    const payload = {
      from: EMAIL_CONFIG.from,
      to,
      subject: 'Get The Most Out of Your Echo 🚀',
      html: template.html,
      text: template.text,
      reply_to: EMAIL_CONFIG.replyTo,
    };

    const result = await sendWithRetry(payload);

    if (result.id) {
      console.log('[email] Onboarding email sent', { to, id: result.id });
      return true;
    }

    console.error('[email] Onboarding email failed', { to, error: result.error });
    return false;
  } catch (error: any) {
    console.error('[email] Onboarding email error', { to, error: error.message });
    return false;
  }
}

