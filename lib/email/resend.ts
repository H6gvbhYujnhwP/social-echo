// lib/email/resend.ts
import { Resend } from 'resend';

// Initialize Resend client
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email configuration
export const EMAIL_CONFIG = {
  from: 'Social Echo <noreply@socialecho.app>', // Update with your verified domain
  replyTo: 'support@socialecho.app', // Update with your support email
};

// Check if email service is available
export function isEmailEnabled(): boolean {
  return resend !== null && !!process.env.RESEND_API_KEY;
}
