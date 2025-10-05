// lib/email/templates.ts

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Welcome email for new account creation
export function welcomeEmail(userName: string, email: string, tempPassword?: string): EmailTemplate {
  const passwordSection = tempPassword ? `
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <strong>🔐 Your Temporary Password:</strong><br>
      <code style="background: #f5f5f5; padding: 8px 12px; border-radius: 4px; font-size: 16px; display: inline-block; margin-top: 8px;">${tempPassword}</code>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Please log in and change your password immediately for security.</p>
    </div>
  ` : '';

  const passwordTextSection = tempPassword ? `
🔐 Your Temporary Password: ${tempPassword}
Please log in and change your password immediately for security.

` : '';

  return {
    subject: 'Welcome to Your New Social Media Guru! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .tip-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .tip-title { font-weight: bold; color: #667eea; margin-bottom: 8px; }
            .step-number { display: inline-block; background: #667eea; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            h3 { color: #667eea; margin-top: 25px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Social Echo!</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0;">Your New Social Media Guru</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Welcome aboard! We're thrilled to be your new social media guru. Say goodbye to writer's block and hello to engaging, on-brand content that resonates with your audience.</p>
              <p>Your account is ready: <strong>${email}</strong></p>
              ${passwordSection}
              
              <h3>🚀 Get Started in 3 Simple Steps</h3>
              
              <p><span class="step-number">1</span><strong>Train Your AI</strong></p>
              <p style="margin-left: 38px;">Head to the training page and tell us about your business. The more details you provide, the better your content will be!</p>
              
              <p><span class="step-number">2</span><strong>Generate Your First Post</strong></p>
              <p style="margin-left: 38px;">Choose your post type and tone, then watch the magic happen. You'll get multiple headline options, engaging copy, hashtags, and even image prompts!</p>
              
              <p><span class="step-number">3</span><strong>Give Feedback</strong></p>
              <p style="margin-left: 38px;">Thumbs up or down on each post. Your AI learns from your preferences and gets smarter with every interaction.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/train" class="button">Start Training Your AI →</a>
              </div>
              
              <h3>💡 Pro Tips for Best Results</h3>
              
              <div class="tip-box">
                <div class="tip-title">✓ Be Specific in Your Profile</div>
                Include your unique selling points, target audience, and brand voice. The AI uses this to create content that sounds authentically YOU.
              </div>
              
              <div class="tip-box">
                <div class="tip-title">✓ Use the Feedback System</div>
                Every thumbs up or down teaches your AI what you like. After 5-10 posts with feedback, you'll notice significantly better results.
              </div>
              
              <div class="tip-box">
                <div class="tip-title">✓ Try Different Tones</div>
                Experiment with Professional, Casual, Funny, and Bold tones to see what resonates best with your audience.
              </div>
              
              <div class="tip-box">
                <div class="tip-title">✓ Plan Ahead with the Content Planner</div>
                Use our planner to schedule your content strategy for the week. Consistency is key to social media success!
              </div>
              
              <div class="tip-box">
                <div class="tip-title">✓ Regenerate When Needed</div>
                Not happy with a post? Hit regenerate! It doesn't count against your monthly limit, so experiment freely.
              </div>
              
              <h3>🎯 What You Can Do</h3>
              <p><strong>✓</strong> Generate selling posts that drive conversions<br>
              <strong>✓</strong> Create informational content that educates<br>
              <strong>✓</strong> Share advice that positions you as an expert<br>
              <strong>✓</strong> Post news and updates that keep followers engaged<br>
              <strong>✓</strong> Plan your content calendar strategically<br>
              <strong>✓</strong> Get AI-powered image prompts for visuals</p>
              
              <h3>📈 Ready to Level Up?</h3>
              <p>Your Starter plan includes 8 posts per month. Need more? Upgrade to Pro for unlimited posts, priority AI processing, and advanced features.</p>
              
              <p style="margin-top: 30px;">We're here to help you succeed. If you have any questions or need guidance, just reply to this email!</p>
              
              <p style="margin-top: 25px;"><strong>Here's to your social media success! 🚀</strong></p>
              
              <p>Your Social Echo Team<br>
              <em>Your AI-Powered Social Media Guru</em></p>
            </div>
            <div class="footer">
              <p>© 2025 Social Echo. All rights reserved.</p>
              <p style="margin-top: 10px;">Need help? Reply to this email or visit our <a href="${process.env.NEXTAUTH_URL}/help" style="color: #667eea;">Help Center</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `🎉 Welcome to Social Echo - Your New Social Media Guru!

Hi ${userName},

Welcome aboard! We're thrilled to be your new social media guru. Say goodbye to writer's block and hello to engaging, on-brand content that resonates with your audience.

Your account is ready: ${email}

${passwordTextSection}
🚀 GET STARTED IN 3 SIMPLE STEPS

1. Train Your AI
Head to the training page and tell us about your business. The more details you provide, the better your content will be!

2. Generate Your First Post
Choose your post type and tone, then watch the magic happen. You'll get multiple headline options, engaging copy, hashtags, and even image prompts!

3. Give Feedback
Thumbs up or down on each post. Your AI learns from your preferences and gets smarter with every interaction.

Start Training Your AI: ${process.env.NEXTAUTH_URL}/train

💡 PRO TIPS FOR BEST RESULTS

✓ Be Specific in Your Profile
Include your unique selling points, target audience, and brand voice. The AI uses this to create content that sounds authentically YOU.

✓ Use the Feedback System
Every thumbs up or down teaches your AI what you like. After 5-10 posts with feedback, you'll notice significantly better results.

✓ Try Different Tones
Experiment with Professional, Casual, Funny, and Bold tones to see what resonates best with your audience.

✓ Plan Ahead with the Content Planner
Use our planner to schedule your content strategy for the week. Consistency is key to social media success!

✓ Regenerate When Needed
Not happy with a post? Hit regenerate! It doesn't count against your monthly limit, so experiment freely.

🎯 WHAT YOU CAN DO

✓ Generate selling posts that drive conversions
✓ Create informational content that educates
✓ Share advice that positions you as an expert
✓ Post news and updates that keep followers engaged
✓ Plan your content calendar strategically
✓ Get AI-powered image prompts for visuals

📈 READY TO LEVEL UP?

Your Starter plan includes 8 posts per month. Need more? Upgrade to Pro for unlimited posts, priority AI processing, and advanced features.

We're here to help you succeed. If you have any questions or need guidance, just reply to this email!

Here's to your social media success! 🚀

Your Social Echo Team
Your AI-Powered Social Media Guru

© 2025 Social Echo. All rights reserved.
Need help? Reply to this email or visit ${process.env.NEXTAUTH_URL}/help`
  };
}

// Password reset email
export function passwordResetEmail(userName: string, resetUrl: string): EmailTemplate {
  return {
    subject: 'Reset Your Social Echo Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We received a request to reset your password for your Social Echo account.</p>
              <p>Click the button below to reset your password. This link will expire in 24 hours.</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </div>
              <p>For security reasons, this link will expire in 24 hours.</p>
              <p>Best regards,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Password Reset Request

Hi ${userName},

We received a request to reset your password for your Social Echo account.

Click the link below to reset your password. This link will expire in 24 hours.

${resetUrl}

⚠️ Security Notice: If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

For security reasons, this link will expire in 24 hours.

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}

// 2FA setup confirmation email
export function twoFactorEnabledEmail(userName: string): EmailTemplate {
  return {
    subject: 'Two-Factor Authentication Enabled',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 2FA Enabled</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <div class="success">
                <strong>✓ Success!</strong> Two-factor authentication has been enabled on your Social Echo account.
              </div>
              <p>Your account is now more secure. You'll need to enter a verification code from your authenticator app each time you sign in.</p>
              <h3>What This Means:</h3>
              <ul>
                <li>Enhanced security for your account</li>
                <li>Protection against unauthorized access</li>
                <li>Required authenticator code at each login</li>
              </ul>
              <p>If you didn't enable 2FA, please contact our support team immediately.</p>
              <p>Best regards,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `🔒 Two-Factor Authentication Enabled

Hi ${userName},

✓ Success! Two-factor authentication has been enabled on your Social Echo account.

Your account is now more secure. You'll need to enter a verification code from your authenticator app each time you sign in.

What This Means:
- Enhanced security for your account
- Protection against unauthorized access
- Required authenticator code at each login

If you didn't enable 2FA, please contact our support team immediately.

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}

// Payment successful email
export function paymentSuccessEmail(userName: string, planName: string, amount: string): EmailTemplate {
  return {
    subject: 'Payment Confirmed - Social Echo',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .receipt { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Payment Confirmed</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Thank you for your payment! Your subscription has been successfully processed.</p>
              <div class="receipt">
                <h3>Payment Details</h3>
                <p><strong>Plan:</strong> ${planName}</p>
                <p><strong>Amount:</strong> ${amount}</p>
                <p><strong>Status:</strong> Paid</p>
              </div>
              <p>Your subscription is now active and you have full access to all features.</p>
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
              <p>You can view your billing history and manage your subscription anytime from your account settings.</p>
              <p>Best regards,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `✓ Payment Confirmed

Hi ${userName},

Thank you for your payment! Your subscription has been successfully processed.

Payment Details:
- Plan: ${planName}
- Amount: ${amount}
- Status: Paid

Your subscription is now active and you have full access to all features.

Go to Dashboard: ${process.env.NEXTAUTH_URL}/dashboard

You can view your billing history and manage your subscription anytime from your account settings.

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}

// Payment failed email
export function paymentFailedEmail(userName: string, planName: string): EmailTemplate {
  return {
    subject: 'Payment Failed - Action Required',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .alert { background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Payment Failed</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <div class="alert">
                <strong>Action Required:</strong> We were unable to process your payment for the ${planName} plan.
              </div>
              <p>This could be due to:</p>
              <ul>
                <li>Insufficient funds</li>
                <li>Expired credit card</li>
                <li>Card declined by your bank</li>
                <li>Incorrect billing information</li>
              </ul>
              <p>Please update your payment method to continue enjoying Social Echo's features.</p>
              <a href="${process.env.NEXTAUTH_URL}/dashboard?tab=billing" class="button">Update Payment Method</a>
              <p>If you need assistance, please contact our support team.</p>
              <p>Best regards,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `⚠️ Payment Failed - Action Required

Hi ${userName},

We were unable to process your payment for the ${planName} plan.

This could be due to:
- Insufficient funds
- Expired credit card
- Card declined by your bank
- Incorrect billing information

Please update your payment method to continue enjoying Social Echo's features.

Update Payment Method: ${process.env.NEXTAUTH_URL}/dashboard?tab=billing

If you need assistance, please contact our support team.

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}

// Subscription upgraded email
export function subscriptionUpgradedEmail(userName: string, oldPlan: string, newPlan: string): EmailTemplate {
  return {
    subject: 'Subscription Upgraded Successfully! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .upgrade { background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Subscription Upgraded!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Great news! Your subscription has been successfully upgraded.</p>
              <div class="upgrade">
                <p><strong>${oldPlan}</strong> → <strong>${newPlan}</strong></p>
              </div>
              <p>You now have access to enhanced features and increased limits!</p>
              <h3>What's New:</h3>
              <ul>
                <li>Increased post generation limits</li>
                <li>Priority AI processing</li>
                <li>Advanced content planning tools</li>
                <li>Premium support</li>
              </ul>
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Explore Your New Features</a>
              <p>Thank you for choosing Social Echo!</p>
              <p>Best regards,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `🎉 Subscription Upgraded!

Hi ${userName},

Great news! Your subscription has been successfully upgraded.

${oldPlan} → ${newPlan}

You now have access to enhanced features and increased limits!

What's New:
- Increased post generation limits
- Priority AI processing
- Advanced content planning tools
- Premium support

Explore Your New Features: ${process.env.NEXTAUTH_URL}/dashboard

Thank you for choosing Social Echo!

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}

// Subscription cancelled email
export function subscriptionCancelledEmail(userName: string, planName: string, endDate: string): EmailTemplate {
  return {
    subject: 'Subscription Cancelled - Social Echo',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6b7280; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .info { background: #f3f4f6; border: 1px solid #9ca3af; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Subscription Cancelled</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We're sorry to see you go. Your ${planName} subscription has been cancelled.</p>
              <div class="info">
                <p><strong>Access Until:</strong> ${endDate}</p>
                <p>You'll continue to have access to your subscription features until the end of your current billing period.</p>
              </div>
              <p>We'd love to hear your feedback about why you're leaving. Your input helps us improve Social Echo for everyone.</p>
              <h3>Before You Go:</h3>
              <ul>
                <li>Download any content you want to keep</li>
                <li>Export your post history</li>
                <li>Save your business profile settings</li>
              </ul>
              <p>You can reactivate your subscription anytime from your dashboard.</p>
              <a href="${process.env.NEXTAUTH_URL}/dashboard?tab=billing" class="button">Reactivate Subscription</a>
              <p>Thank you for being part of Social Echo!</p>
              <p>Best regards,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Subscription Cancelled

Hi ${userName},

We're sorry to see you go. Your ${planName} subscription has been cancelled.

Access Until: ${endDate}

You'll continue to have access to your subscription features until the end of your current billing period.

We'd love to hear your feedback about why you're leaving. Your input helps us improve Social Echo for everyone.

Before You Go:
- Download any content you want to keep
- Export your post history
- Save your business profile settings

You can reactivate your subscription anytime from your dashboard.

Reactivate Subscription: ${process.env.NEXTAUTH_URL}/dashboard?tab=billing

Thank you for being part of Social Echo!

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}

// Usage limit warning email
export function usageLimitWarningEmail(userName: string, usageCount: number, usageLimit: number): EmailTemplate {
  const percentage = Math.round((usageCount / usageLimit) * 100);
  return {
    subject: `You've Used ${percentage}% of Your Monthly Limit`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Usage Limit Warning</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <div class="warning">
                <p><strong>You've used ${usageCount} of ${usageLimit} posts this month (${percentage}%)</strong></p>
              </div>
              <p>You're approaching your monthly post generation limit. Once you reach the limit, you won't be able to generate new posts until your next billing cycle.</p>
              <h3>Options:</h3>
              <ul>
                <li>Upgrade to a higher plan for more posts</li>
                <li>Wait for your limit to reset next month</li>
                <li>Contact support for special arrangements</li>
              </ul>
              <a href="${process.env.NEXTAUTH_URL}/pricing" class="button">View Plans</a>
              <p>Best regards,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `⚠️ Usage Limit Warning

Hi ${userName},

You've used ${usageCount} of ${usageLimit} posts this month (${percentage}%)

You're approaching your monthly post generation limit. Once you reach the limit, you won't be able to generate new posts until your next billing cycle.

Options:
- Upgrade to a higher plan for more posts
- Wait for your limit to reset next month
- Contact support for special arrangements

View Plans: ${process.env.NEXTAUTH_URL}/pricing

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}

// Account suspended email
export function accountSuspendedEmail(userName: string, reason?: string): EmailTemplate {
  return {
    subject: 'Your Social Echo Account Has Been Suspended',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .alert { background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Suspended</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <div class="alert">
                <strong>Your Social Echo account has been suspended.</strong>
              </div>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>During this suspension period, you will not be able to access your account or use Social Echo services.</p>
              <p>If you believe this is a mistake or would like to appeal this decision, please contact our support team immediately.</p>
              <p>Support Email: support@socialecho.app</p>
              <p>Best regards,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Account Suspended

Hi ${userName},

Your Social Echo account has been suspended.

${reason ? `Reason: ${reason}` : ''}

During this suspension period, you will not be able to access your account or use Social Echo services.

If you believe this is a mistake or would like to appeal this decision, please contact our support team immediately.

Support Email: support@socialecho.app

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}

// Account reactivated email
export function accountReactivatedEmail(userName: string): EmailTemplate {
  return {
    subject: 'Your Social Echo Account Has Been Reactivated! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Account Reactivated!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <div class="success">
                <strong>Good news!</strong> Your Social Echo account has been reactivated.
              </div>
              <p>You now have full access to all your account features and can continue creating amazing social media content.</p>
              <p>All your previous data, posts, and settings have been preserved.</p>
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
              <p>Thank you for being part of Social Echo!</p>
              <p>Best regards,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `🎉 Account Reactivated!

Hi ${userName},

Good news! Your Social Echo account has been reactivated.

You now have full access to all your account features and can continue creating amazing social media content.

All your previous data, posts, and settings have been preserved.

Go to Dashboard: ${process.env.NEXTAUTH_URL}/dashboard

Thank you for being part of Social Echo!

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}


// Two-factor authentication reset email
export function twoFactorResetEmail(userName: string): EmailTemplate {
  return {
    subject: 'Two-Factor Authentication Reset',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 2FA Reset</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Your two-factor authentication (2FA) has been reset by your administrator.</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Your account is now less secure without 2FA enabled. We strongly recommend setting it up again as soon as possible.
              </div>
              
              <p>To set up 2FA again:</p>
              <ol>
                <li>Log in to your account</li>
                <li>Go to Settings → Security</li>
                <li>Enable Two-Factor Authentication</li>
                <li>Scan the QR code with your authenticator app</li>
              </ol>
              
              <a href="${process.env.NEXTAUTH_URL}/settings" class="button">Go to Settings</a>
              
              <p>If you didn't request this change or have concerns about your account security, please contact your administrator immediately.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Social Echo Team</p>
              <p style="font-size: 12px; color: #999;">© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `🔐 2FA Reset
Hi ${userName},
Your two-factor authentication (2FA) has been reset by your administrator.
⚠️ Security Notice: Your account is now less secure without 2FA enabled. We strongly recommend setting it up again as soon as possible.
To set up 2FA again:
1. Log in to your account
2. Go to Settings → Security
3. Enable Two-Factor Authentication
4. Scan the QR code with your authenticator app
Go to Settings: ${process.env.NEXTAUTH_URL}/settings
If you didn't request this change or have concerns about your account security, please contact your administrator immediately.
Best regards,
The Social Echo Team
© 2025 Social Echo. All rights reserved.`
  };
}


// Agency admin: Client added notification
export function agencyClientAddedEmail(agencyName: string, clientEmail: string, clientCount: number, monthlyTotal: number): EmailTemplate {
  return {
    subject: `New Client Added: ${clientEmail}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .info-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Client Added</h1>
            </div>
            <div class="content">
              <p>Hi ${agencyName} team,</p>
              <p>A new client has been successfully added to your agency account:</p>
              
              <div class="info-box">
                <strong>Client Email:</strong> ${clientEmail}<br>
                <strong>Total Active Clients:</strong> ${clientCount}<br>
                <strong>Next Monthly Bill:</strong> £${monthlyTotal.toFixed(2)}
              </div>
              
              <p>The client has been sent a welcome email with their temporary password.</p>
              
              <p><strong>Note:</strong> Social Echo bills your agency directly. Your clients are billed by you. No Stripe invoices are sent to your clients.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Social Echo Team</p>
              <p style="font-size: 12px; color: #999;">© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `✅ Client Added

Hi ${agencyName} team,

A new client has been successfully added to your agency account:

Client Email: ${clientEmail}
Total Active Clients: ${clientCount}
Next Monthly Bill: £${monthlyTotal.toFixed(2)}

The client has been sent a welcome email with their temporary password.

Note: Social Echo bills your agency directly. Your clients are billed by you. No Stripe invoices are sent to your clients.

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}

// Agency admin: Client paused notification
export function agencyClientPausedEmail(agencyName: string, clientEmail: string, clientCount: number, monthlyTotal: number): EmailTemplate {
  return {
    subject: `Client Paused: ${clientEmail}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .info-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏸️ Client Paused</h1>
            </div>
            <div class="content">
              <p>Hi ${agencyName} team,</p>
              <p>A client has been paused and removed from billing:</p>
              
              <div class="info-box">
                <strong>Client Email:</strong> ${clientEmail}<br>
                <strong>Total Active Clients:</strong> ${clientCount}<br>
                <strong>Next Monthly Bill:</strong> £${monthlyTotal.toFixed(2)}
              </div>
              
              <p>The client's account is suspended and they cannot log in. You can resume them at any time from your agency dashboard.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Social Echo Team</p>
              <p style="font-size: 12px; color: #999;">© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `⏸️ Client Paused

Hi ${agencyName} team,

A client has been paused and removed from billing:

Client Email: ${clientEmail}
Total Active Clients: ${clientCount}
Next Monthly Bill: £${monthlyTotal.toFixed(2)}

The client's account is suspended and they cannot log in. You can resume them at any time from your agency dashboard.

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}

// Agency admin: Client deleted notification
export function agencyClientDeletedEmail(agencyName: string, clientEmail: string, clientCount: number, monthlyTotal: number): EmailTemplate {
  return {
    subject: `Client Deleted: ${clientEmail}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .info-box { background: #fee; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗑️ Client Deleted</h1>
            </div>
            <div class="content">
              <p>Hi ${agencyName} team,</p>
              <p>A client has been permanently deleted:</p>
              
              <div class="info-box">
                <strong>Client Email:</strong> ${clientEmail}<br>
                <strong>Total Active Clients:</strong> ${clientCount}<br>
                <strong>Next Monthly Bill:</strong> £${monthlyTotal.toFixed(2)}
              </div>
              
              <p><strong>Warning:</strong> This action is permanent. All client data, posts, and history have been deleted and cannot be recovered.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Social Echo Team</p>
              <p style="font-size: 12px; color: #999;">© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `🗑️ Client Deleted

Hi ${agencyName} team,

A client has been permanently deleted:

Client Email: ${clientEmail}
Total Active Clients: ${clientCount}
Next Monthly Bill: £${monthlyTotal.toFixed(2)}

Warning: This action is permanent. All client data, posts, and history have been deleted and cannot be recovered.

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}

// Agency admin: Client resumed notification
export function agencyClientResumedEmail(agencyName: string, clientEmail: string, clientCount: number, monthlyTotal: number): EmailTemplate {
  return {
    subject: `Client Resumed: ${clientEmail}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .info-box { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>▶️ Client Resumed</h1>
            </div>
            <div class="content">
              <p>Hi ${agencyName} team,</p>
              <p>A client has been resumed and added back to billing:</p>
              
              <div class="info-box">
                <strong>Client Email:</strong> ${clientEmail}<br>
                <strong>Total Active Clients:</strong> ${clientCount}<br>
                <strong>Next Monthly Bill:</strong> £${monthlyTotal.toFixed(2)}
              </div>
              
              <p>The client's account is now active and they can log in again.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The Social Echo Team</p>
              <p style="font-size: 12px; color: #999;">© 2025 Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `▶️ Client Resumed

Hi ${agencyName} team,

A client has been resumed and added back to billing:

Client Email: ${clientEmail}
Total Active Clients: ${clientCount}
Next Monthly Bill: £${monthlyTotal.toFixed(2)}

The client's account is now active and they can log in again.

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.`
  };
}
