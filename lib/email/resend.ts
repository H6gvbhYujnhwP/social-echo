// lib/email/resend.ts
import { Resend } from 'resend';

// Initialize Resend client
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email configuration - driven by environment variables
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM ?? 'Social Echo <noreply@socialecho.ai>',
  replyTo: process.env.EMAIL_REPLY_TO ?? 'support@socialecho.ai',
};

// Check if email service is available
export function isEmailEnabled(): boolean {
  // Respect DISABLE_EMAILS flag for testing/development
  if (process.env.DISABLE_EMAILS === 'true') {
    return false;
  }
  return resend !== null && !!process.env.RESEND_API_KEY;
}

