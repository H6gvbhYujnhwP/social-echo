// lib/email/service.ts
import { resend, EMAIL_CONFIG, isEmailEnabled } from './resend';
import * as templates from './templates';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// Generic email sending function
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  if (!isEmailEnabled()) {
    console.warn('Email service not configured. Skipping email:', options.subject);
    return false;
  }

  try {
    await resend!.emails.send({
      from: EMAIL_CONFIG.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: EMAIL_CONFIG.replyTo,
    });
    console.log(`Email sent successfully to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
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

// Subscription upgraded
export async function sendSubscriptionUpgradedEmail(to: string, userName: string, oldPlan: string, newPlan: string): Promise<boolean> {
  const template = templates.subscriptionUpgradedEmail(userName, oldPlan, newPlan);
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
