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
              <p>Your Starter plan includes 100 posts per month. Need more? Upgrade to Pro for unlimited posts, priority AI processing, and advanced features.</p>
              
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

Your Starter plan includes 100 posts per month. Need more? Upgrade to Pro for unlimited posts, priority AI processing, and advanced features.

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

// Payment action required email (SCA)
export function paymentActionRequiredEmail(userName: string, planName: string, invoiceId: string): EmailTemplate {
  return {
    subject: 'Complete Your Payment Authentication',
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
            .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Authentication Required</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <div class="alert">
                <strong>Action Required:</strong> Your bank requires additional authentication to complete your payment for the ${planName} plan.
              </div>
              <p>This is a security measure called 3D Secure (SCA) that helps protect your payment.</p>
              <p><strong>What you need to do:</strong></p>
              <ul>
                <li>Click the button below to complete authentication</li>
                <li>You may be asked to enter a code sent to your phone</li>
                <li>Or approve the payment in your banking app</li>
              </ul>
              <a href="${process.env.NEXTAUTH_URL}/dashboard?tab=billing&invoice=${invoiceId}" class="button">Complete Authentication</a>
              <p><strong>Note:</strong> This is not a payment failure. Your payment is pending authentication only.</p>
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
    text: `🔒 Authentication Required

Hi ${userName},

Your bank requires additional authentication to complete your payment for the ${planName} plan.

This is a security measure called 3D Secure (SCA) that helps protect your payment.

What you need to do:
- Click the link below to complete authentication
- You may be asked to enter a code sent to your phone
- Or approve the payment in your banking app

Complete Authentication: ${process.env.NEXTAUTH_URL}/dashboard?tab=billing&invoice=${invoiceId}

Note: This is not a payment failure. Your payment is pending authentication only.

If you need assistance, please contact our support team.

Best regards,
The Social Echo Team

© 2025 Social Echo. All rights reserved.
    `
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


// Trial started email
export function trialStartedEmail(userName: string, trialEndDate: string): EmailTemplate {
  return {
    subject: 'Your 1-Day Free Trial is Live! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Your Free Trial is Active!</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0;">Welcome to Social Echo Starter</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Great news! Your 1-day free trial has started. You now have full access to all Starter plan features.</p>
              
              <div class="info-box">
                <strong>✓ Trial Period:</strong> 24 hours<br>
                <strong>✓ Billing Date:</strong> ${trialEndDate}<br>
                <strong>✓ Plan:</strong> Starter (£29.99/month)<br>
                <strong>✓ Features:</strong> 100 posts/month, AI text & image generation
              </div>
              
              <h3>🚀 Make the Most of Your Trial</h3>
              <p>Here's what you can do right now:</p>
              <ul>
                <li><strong>Train your AI</strong> with your business details</li>
                <li><strong>Generate your first post</strong> in under 10 minutes</li>
                <li><strong>Create stunning images</strong> with 7 visual styles</li>
                <li><strong>Give feedback</strong> to improve your AI</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Start Creating Content →</a>
              </div>
              
              <div class="warning-box">
                <strong>⏰ Important:</strong> You'll be automatically billed on ${trialEndDate} unless you cancel before then. No surprises!
              </div>
              
              <h3>💳 Manage Your Subscription</h3>
              <p>You can cancel anytime from your billing dashboard. If you cancel during the trial, you won't be charged.</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.NEXTAUTH_URL}/api/billing/portal" style="color: #3b82f6; text-decoration: underline;">Manage Billing & Subscription →</a>
              </div>
              
              <p>Need help? Reply to this email or visit our support center.</p>
              <p>Happy creating!</p>
              <p><strong>The Social Echo Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${userName},

Your 1-Day Free Trial is Active! 🎉

Great news! Your 1-day free trial has started. You now have full access to all Starter plan features.

Trial Details:
✓ Trial Period: 24 hours
✓ Billing Date: ${trialEndDate}
✓ Plan: Starter (£29.99/month)
✓ Features: 100 posts/month, AI text & image generation

Make the Most of Your Trial:
- Train your AI with your business details
- Generate your first post in under 10 minutes
- Create stunning images with 7 visual styles
- Give feedback to improve your AI

Start creating: ${process.env.NEXTAUTH_URL}/dashboard

Important: You'll be automatically billed on ${trialEndDate} unless you cancel before then.

Manage your subscription: ${process.env.NEXTAUTH_URL}/api/billing/portal

Need help? Reply to this email or visit our support center.

Happy creating!
The Social Echo Team

© ${new Date().getFullYear()} Social Echo. All rights reserved.
    `
  };
}

// Trial converted to paid subscription
export function trialConvertedEmail(userName: string, planName: string): EmailTemplate {
  return {
    subject: 'Welcome to Social Echo! Your Trial Has Converted 🎉',
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
            .success-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to ${planName}!</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0;">Your trial has successfully converted</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Your 1-day free trial has ended and your subscription is now active. Thank you for choosing Social Echo!</p>
              
              <div class="success-box">
                <strong>✓ Payment Successful</strong><br>
                Your ${planName} subscription is now active and you have full access to all features.
              </div>
              
              <h3>🚀 What's Next?</h3>
              <p>Continue creating amazing content with:</p>
              <ul>
                <li><strong>100 posts per month</strong> (2 per week)</li>
                <li><strong>AI-powered text generation</strong> for all post types</li>
                <li><strong>7 intelligent visual styles</strong> for images</li>
                <li><strong>Learning system</strong> that improves with feedback</li>
                <li><strong>Content Mix Planner</strong> for strategic posting</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Continue Creating →</a>
              </div>
              
              <h3>💳 Manage Your Subscription</h3>
              <p>You can view invoices, update payment methods, or manage your subscription anytime from your billing dashboard.</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.NEXTAUTH_URL}/api/billing/portal" style="color: #667eea; text-decoration: underline;">Manage Billing →</a>
              </div>
              
              <p>Thank you for being part of Social Echo!</p>
              <p><strong>The Social Echo Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${userName},

Welcome to ${planName}! 🎉

Your 1-day free trial has ended and your subscription is now active. Thank you for choosing Social Echo!

✓ Payment Successful
Your ${planName} subscription is now active and you have full access to all features.

What's Next?
Continue creating amazing content with:
- 100 posts per month (2 per week)
- AI-powered text generation for all post types
- 7 intelligent visual styles for images
- Learning system that improves with feedback
- Content Mix Planner for strategic posting

Continue creating: ${process.env.NEXTAUTH_URL}/dashboard

Manage your subscription: ${process.env.NEXTAUTH_URL}/api/billing/portal

Thank you for being part of Social Echo!
The Social Echo Team

© ${new Date().getFullYear()} Social Echo. All rights reserved.
    `
  };
}

// Trial cancelled email
export function trialCancelledEmail(userName: string, planName: string): EmailTemplate {
  return {
    subject: 'Your Trial Has Been Cancelled',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .info-box { background: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Trial Cancelled</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0;">We're sorry to see you go</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Your ${planName} trial has been cancelled. You won't be charged anything.</p>
              
              <div class="info-box">
                <strong>✓ No Charge:</strong> Your card was not charged.<br>
                <strong>✓ Account Status:</strong> Your account remains active with limited access.
              </div>
              
              <h3>💭 We'd Love Your Feedback</h3>
              <p>We're always improving Social Echo. If you have a moment, please let us know why you cancelled:</p>
              <ul>
                <li>Was the platform too complex?</li>
                <li>Didn't meet your needs?</li>
                <li>Pricing concerns?</li>
                <li>Something else?</li>
              </ul>
              <p>Reply to this email with your thoughts. We read every response!</p>
              
              <h3>🔄 Changed Your Mind?</h3>
              <p>You can restart your subscription anytime from the pricing page.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/pricing" class="button">View Plans →</a>
              </div>
              
              <p>Thank you for trying Social Echo. We hope to see you again!</p>
              <p><strong>The Social Echo Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Social Echo. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${userName},

Your Trial Has Been Cancelled

Your ${planName} trial has been cancelled. You won't be charged anything.

✓ No Charge: Your card was not charged.
✓ Account Status: Your account remains active with limited access.

We'd Love Your Feedback
We're always improving Social Echo. If you have a moment, please let us know why you cancelled. Reply to this email with your thoughts!

Changed Your Mind?
You can restart your subscription anytime from the pricing page: ${process.env.NEXTAUTH_URL}/pricing

Thank you for trying Social Echo. We hope to see you again!
The Social Echo Team

© ${new Date().getFullYear()} Social Echo. All rights reserved.
    `
  };
}




// Cancel confirmation email
export function cancelConfirmation(userName: string, plan: string, effectiveDate: Date) {
  const formattedDate = effectiveDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return {
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
            .info-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
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
              
              <p>We're sorry to see you go! Your <strong>${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> plan subscription has been cancelled.</p>
              
              <div class="info-box">
                <strong>📅 Effective Date:</strong> ${formattedDate}<br>
                <strong>📦 Plan:</strong> ${plan.charAt(0).toUpperCase() + plan.slice(1)}<br>
                <strong>✅ Access:</strong> You'll continue to have access until the end of your billing period
              </div>
              
              <h3>What happens next?</h3>
              <ul>
                <li>Your account will remain active until ${formattedDate}</li>
                <li>You won't be charged again</li>
                <li>All your data will be preserved</li>
                <li>You can reactivate anytime</li>
              </ul>
              
              <h3>Want to come back?</h3>
              <p>We'd love to have you back! You can reactivate your subscription at any time from your account settings.</p>
              
              <a href="${process.env.NEXTAUTH_URL}/account" class="button">Reactivate Subscription</a>
              
              <p style="margin-top: 30px;">If you cancelled by mistake or have any questions, please don't hesitate to reach out to us at <a href="mailto:support@socialecho.ai">support@socialecho.ai</a>.</p>
              
              <p>Thank you for being part of Social Echo!</p>
              
              <p style="margin-top: 30px;">Best regards,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>Social Echo - Your Social Media Guru</p>
              <p><a href="${process.env.NEXTAUTH_URL}">socialecho.ai</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${userName},

We're sorry to see you go! Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan subscription has been cancelled.

CANCELLATION DETAILS
━━━━━━━━━━━━━━━━━━━━
📅 Effective Date: ${formattedDate}
📦 Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}
✅ Access: You'll continue to have access until the end of your billing period

WHAT HAPPENS NEXT?
━━━━━━━━━━━━━━━━━━━━
• Your account will remain active until ${formattedDate}
• You won't be charged again
• All your data will be preserved
• You can reactivate anytime

WANT TO COME BACK?
━━━━━━━━━━━━━━━━━━━━
We'd love to have you back! You can reactivate your subscription at any time from your account settings.

Reactivate: ${process.env.NEXTAUTH_URL}/account

If you cancelled by mistake or have any questions, please don't hesitate to reach out to us at support@socialecho.ai.

Thank you for being part of Social Echo!

Best regards,
The Social Echo Team

━━━━━━━━━━━━━━━━━━━━
Social Echo - Your Social Media Guru
${process.env.NEXTAUTH_URL}
    `
  };
}




// Onboarding email - "Get The Most Out of Your Echo"
export function onboardingEmail(userName: string, helpUrl: string): EmailTemplate {
  return {
    subject: 'Get The Most Out of Your Echo 🚀',
    html: `
      <!doctype html>
      <html>
        <body style="font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;line-height:1.55;color:#111;margin:0;padding:0;background:#fafafa">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td align="center" style="padding:32px">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
                  <tr>
                    <td style="padding:28px 28px 8px 28px">
                      <h1 style="margin:0 0 4px 0;font-size:22px">Get The Most Out of Your Echo 🚀</h1>
                      <p style="margin:0 0 16px 0;color:#666;font-size:14px">Hi ${userName},</p>
                      <p style="margin:0 0 12px 0">
                        Welcome to <strong>SocialEcho</strong>! Here's how to get the most out of your Echo and start creating high-impact content:
                      </p>
                      <ol style="margin:0 0 12px 20px;padding:0">
                        <li><strong>Train your Echo</strong> — Add brand voice & examples in <em>Train</em>.</li>
                        <li><strong>Use the Generator</strong> — Create drafts in <em>Planner</em> with short prompts (e.g., "make this confident", "add a CTA").</li>
                        <li><strong>Fine-tune</strong> — Ask for variations, change tone, and remove buzzwords.</li>
                        <li><strong>Stay original</strong> — Request 3–5 angles to avoid repetition.</li>
                        <li><strong>Need help?</strong> — Visit our new Help & AI Integrator.</li>
                      </ol>
                      <p style="margin:0 0 24px 0">Your Echo learns from every edit and each bit of feedback. Start experimenting today!</p>
                      <p style="margin:0">
                        <a href="${helpUrl}" style="display:inline-block;background:#5b43f1;color:#fff;text-decoration:none;border-radius:8px;padding:10px 16px">Get Help & Learn More</a>
                      </p>
                      <p style="margin:24px 0 0 0;color:#666;font-size:13px">— The SocialEcho Team</p>
                    </td>
                  </tr>
                </table>
                <p style="color:#999;font-size:12px;margin:12px 0 0 0">You're receiving this because you created a SocialEcho account.</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Get The Most Out of Your Echo 🚀

Hi ${userName},

Welcome to SocialEcho! Here's how to get the most out of your Echo and start creating high-impact content:

1. Train your Echo — Add brand voice & examples in Train.
2. Use the Generator — Create drafts in Planner with short prompts (e.g., "make this confident", "add a CTA").
3. Fine-tune — Ask for variations, change tone, and remove buzzwords.
4. Stay original — Request 3–5 angles to avoid repetition.
5. Need help? — Visit our new Help & AI Integrator.

Your Echo learns from every edit and each bit of feedback. Start experimenting today!

Get Help & Learn More: ${helpUrl}

— The SocialEcho Team

You're receiving this because you created a SocialEcho account.
    `,
  };
}




// Plan upgrade email (Starter → Pro with no-refund policy)
export function planUpgradeEmail(userName: string, amount: string, renewalDate: string): EmailTemplate {
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;
  const accountUrl = `${process.env.NEXTAUTH_URL}/account`;
  const helpUrl = `${process.env.NEXTAUTH_URL}/help`;

  return {
    subject: 'Your Plan Has Been Upgraded to Pro! 🎉',
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
            .info-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .feature-list { list-style: none; padding: 0; }
            .feature-list li { padding: 8px 0; padding-left: 30px; position: relative; }
            .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; font-size: 18px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            h3 { color: #667eea; margin-top: 25px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
            table td:first-child { font-weight: bold; color: #667eea; width: 40%; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Pro!</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0;">Your upgrade is complete</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Great news! Your Social Echo account has been successfully upgraded to <strong>Pro</strong>. You now have access to unlimited posts and advanced features to supercharge your social media presence.</p>
              
              <h3>📋 Billing Summary</h3>
              <table>
                <tr>
                  <td>Plan</td>
                  <td>Pro</td>
                </tr>
                <tr>
                  <td>Amount Charged</td>
                  <td><strong>${amount}</strong></td>
                </tr>
                <tr>
                  <td>Billing Cycle</td>
                  <td>Monthly</td>
                </tr>
                <tr>
                  <td>Next Renewal</td>
                  <td><strong>${renewalDate}</strong></td>
                </tr>
              </table>

              <div class="warning-box">
                <strong>⚠️ Important:</strong> As per our <a href="${process.env.NEXTAUTH_URL}/terms" style="color: #667eea;">Refund Policy</a>, no refunds or credits have been issued for unused time on your previous Starter plan. Your new Pro billing cycle started today.
              </div>

              <h3>🚀 What's New with Pro</h3>
              <ul class="feature-list">
                <li><strong>Unlimited Posts</strong> — Generate as many posts as you need, no monthly limits</li>
                <li><strong>Advanced AI Features</strong> — Access to enhanced content generation capabilities</li>
                <li><strong>Priority Support</strong> — Get help faster when you need it</li>
                <li><strong>Extended History</strong> — Access to all your previous posts and drafts</li>
                <li><strong>Advanced Analytics</strong> — Better insights into your content performance</li>
              </ul>

              <div class="info-box">
                <strong>💡 Pro Tip:</strong> With unlimited posts, you can now experiment more freely with different tones, styles, and content types. Use the feedback system to train your AI even further!
              </div>

              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Start Creating →</a>
              </div>

              <h3>📊 Manage Your Subscription</h3>
              <p>You can view your invoices, update payment methods, or manage your subscription anytime from your <a href="${accountUrl}" style="color: #667eea;">Account page</a>.</p>

              <h3>❓ Need Help?</h3>
              <p>Check out our <a href="${helpUrl}" style="color: #667eea;">Help Center</a> or use the AI assistant widget (bottom-right corner) for instant answers to your questions.</p>

              <p style="margin-top: 30px;">Thank you for upgrading! We're excited to see what you create with Pro.</p>
              
              <p>Best regards,<br>
              <strong>The Social Echo Team</strong></p>
            </div>
            <div class="footer">
              <p>Social Echo — Your AI-Powered Social Media Guru</p>
              <p style="font-size: 12px; color: #999;">
                You're receiving this email because you upgraded your Social Echo subscription.<br>
                <a href="${accountUrl}" style="color: #667eea;">Manage Subscription</a> | 
                <a href="${helpUrl}" style="color: #667eea;">Get Help</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to Pro!

Hi ${userName},

Great news! Your Social Echo account has been successfully upgraded to Pro. You now have access to unlimited posts and advanced features to supercharge your social media presence.

BILLING SUMMARY
---------------
Plan: Pro
Amount Charged: ${amount}
Billing Cycle: Monthly
Next Renewal: ${renewalDate}

⚠️ IMPORTANT: As per our Refund Policy, no refunds or credits have been issued for unused time on your previous Starter plan. Your new Pro billing cycle started today.

WHAT'S NEW WITH PRO
-------------------
✓ Unlimited Posts — Generate as many posts as you need, no monthly limits
✓ Advanced AI Features — Access to enhanced content generation capabilities
✓ Priority Support — Get help faster when you need it
✓ Extended History — Access to all your previous posts and drafts
✓ Advanced Analytics — Better insights into your content performance

💡 Pro Tip: With unlimited posts, you can now experiment more freely with different tones, styles, and content types. Use the feedback system to train your AI even further!

Start Creating: ${dashboardUrl}

MANAGE YOUR SUBSCRIPTION
------------------------
You can view your invoices, update payment methods, or manage your subscription anytime from your Account page: ${accountUrl}

NEED HELP?
----------
Check out our Help Center (${helpUrl}) or use the AI assistant widget for instant answers to your questions.

Thank you for upgrading! We're excited to see what you create with Pro.

Best regards,
The Social Echo Team

---
Social Echo — Your AI-Powered Social Media Guru
You're receiving this email because you upgraded your Social Echo subscription.
Manage Subscription: ${accountUrl} | Get Help: ${helpUrl}
    `,
  };
}


// Free trial welcome email with verification link
export function freeTrialWelcomeEmail(userName: string, email: string, verificationUrl: string): EmailTemplate {
  return {
    subject: 'Welcome to Social Echo - Verify Your Email to Start Your Free Trial! 🎉',
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
            .button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; font-size: 16px; }
            .trial-box { background: #f0f9ff; border: 2px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .step-number { display: inline-block; background: #667eea; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            h3 { color: #667eea; margin-top: 25px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Social Echo!</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0;">Your Free Trial Starts Now</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <p>Welcome aboard! You're just one click away from experiencing the power of AI-driven content creation.</p>
              
              <div class="trial-box">
                <h2 style="margin: 0 0 10px 0; color: #3b82f6;">✨ Your Free Trial Includes:</h2>
                <p style="font-size: 18px; margin: 0;"><strong>8 Free Posts</strong> - No credit card required!</p>
              </div>
              
              <h3>🔐 First Step: Verify Your Email</h3>
              <p>To start generating amazing content, please verify your email address:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email & Start Free Trial →</a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
              </p>
              
              <h3>🚀 What Happens Next?</h3>
              
              <p><span class="step-number">1</span><strong>Train Your AI</strong></p>
              <p style="margin-left: 38px;">Tell us about your business - your unique selling points, target audience, and brand voice.</p>
              
              <p><span class="step-number">2</span><strong>Generate Content</strong></p>
              <p style="margin-left: 38px;">Create 30 professional social media posts with headlines, copy, hashtags, and image prompts!</p>
              
              <p><span class="step-number">3</span><strong>Choose Your Plan</strong></p>
              <p style="margin-left: 38px;">After your trial, continue with Starter (£9.99), Pro (£19.99), or Ultimate (£179.99).</p>
              
              <p style="margin-top: 30px;">Ready to transform your social media presence? Click the button above to get started!</p>
              
              <p>Cheers,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>This email was sent to ${email}</p>
              <p>If you didn't create this account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Welcome to Social Echo!

Hi ${userName},

Welcome aboard! You're just one click away from experiencing the power of AI-driven content creation.

YOUR FREE TRIAL INCLUDES:
✨ 8 Free Posts - No credit card required!

FIRST STEP: VERIFY YOUR EMAIL
To start generating amazing content, please verify your email address:

${verificationUrl}

WHAT HAPPENS NEXT?

1. Train Your AI
Tell us about your business - your unique selling points, target audience, and brand voice.

2. Generate Content
Create 30 professional social media posts with headlines, copy, hashtags, and image prompts!

3. Choose Your Plan
After your trial, continue with Starter (£9.99), Pro (£19.99), or Ultimate (£179.99).

Ready to transform your social media presence? Click the link above to get started!

Cheers,
The Social Echo Team

---
This email was sent to ${email}
If you didn't create this account, you can safely ignore this email.
    `
  };
}

// Free trial feedback email (sent at 4 posts)
export function freeTrialFeedbackEmail(userName: string, postsRemaining: number): EmailTemplate {
  return {
    subject: 'How are you enjoying Social Echo? We\'d love your feedback! 💬',
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
            .progress-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 We'd Love Your Feedback!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <p>You're halfway through your free trial! 🎉</p>
              
              <div class="progress-box">
                <p style="margin: 0; font-size: 16px;"><strong>Trial Progress:</strong> 4 posts created, ${postsRemaining} remaining</p>
              </div>
              
              <p>We hope you're enjoying Social Echo's AI-powered content generation. Your experience matters to us!</p>
              
              <h3>Quick Question:</h3>
              <p><strong>How are you finding Social Echo so far?</strong></p>
              
              <p>Simply reply to this email and let us know:</p>
              <ul>
                <li>What do you love about Social Echo?</li>
                <li>Is there anything we could improve?</li>
                <li>Any features you'd like to see?</li>
              </ul>
              
              <p>Your feedback helps us make Social Echo even better for you and other users. Plus, we read every response personally!</p>
              
              <p style="margin-top: 30px;">Keep creating amazing content,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>Still have ${postsRemaining} free posts remaining in your trial</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
We'd Love Your Feedback!

Hi ${userName},

You're halfway through your free trial! 🎉

TRIAL PROGRESS: 4 posts created, ${postsRemaining} remaining

We hope you're enjoying Social Echo's AI-powered content generation. Your experience matters to us!

QUICK QUESTION:
How are you finding Social Echo so far?

Simply reply to this email and let us know:
- What do you love about Social Echo?
- Is there anything we could improve?
- Any features you'd like to see?

Your feedback helps us make Social Echo even better for you and other users. Plus, we read every response personally!

Keep creating amazing content,
The Social Echo Team

---
Still have ${postsRemaining} free posts remaining in your trial
    `
  };
}

// Free trial exhausted email
export function freeTrialExhaustedEmail(userName: string): EmailTemplate {
  const upgradeUrl = `${process.env.NEXTAUTH_URL}/pricing?upgrade=1`;
  
  return {
    subject: 'Your Free Trial is Complete - Ready to Continue? 🚀',
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
            .button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; font-size: 16px; }
            .plan-box { background: #f9fafb; border: 2px solid #e5e7eb; padding: 20px; margin: 15px 0; border-radius: 8px; }
            .plan-name { color: #667eea; font-size: 20px; font-weight: bold; margin: 0 0 10px 0; }
            .plan-price { color: #333; font-size: 24px; font-weight: bold; margin: 0 0 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p style="font-size: 18px; margin: 10px 0 0 0;">You've Completed Your Free Trial</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              
              <p>You've used all 30 of your free posts. We hope you loved the experience of AI-powered content creation!</p>
              
              <h3>Ready to Keep Creating Amazing Content?</h3>
              <p>Choose the plan that fits your needs:</p>
              
              <div class="plan-box">
                <p class="plan-name">Starter Plan</p>
                <p class="plan-price">£9.99/month</p>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>100 posts per month</li>
                  <li>2 regenerations per post</li>
                  <li>AI-powered content generation</li>
                </ul>
              </div>
              
              <div class="plan-box">
                <p class="plan-name">Pro Plan</p>
                <p class="plan-price">£19.99/month</p>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>100 posts per month</li>
                  <li>2 regenerations per post</li>
                  <li>Priority support</li>
                </ul>
              </div>
              
              <div class="plan-box">
                <p class="plan-name">Ultimate Plan</p>
                <p class="plan-price">£179.99/month</p>
                <ul style="margin: 0; padding-left: 20px;">
                  <li><strong>Unlimited posts</strong></li>
                  <li><strong>Unlimited regenerations</strong></li>
                  <li>Premium support</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${upgradeUrl}" class="button">View Plans & Upgrade →</a>
              </div>
              
              <p style="margin-top: 30px;">Thank you for trying Social Echo. We're excited to continue helping you create engaging content!</p>
              
              <p>Best regards,<br>The Social Echo Team</p>
            </div>
            <div class="footer">
              <p>Questions? Reply to this email - we're here to help!</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Congratulations! You've Completed Your Free Trial

Hi ${userName},

You've used all 30 of your free posts. We hope you loved the experience of AI-powered content creation!

READY TO KEEP CREATING AMAZING CONTENT?
Choose the plan that fits your needs:

STARTER PLAN - £9.99/month
- 100 posts per month
- 2 regenerations per post
- AI-powered content generation

PRO PLAN - £19.99/month
- 100 posts per month
- 2 regenerations per post
- Priority support

ULTIMATE PLAN - £179.99/month
- Unlimited posts
- Unlimited regenerations
- Premium support

View plans and upgrade: ${upgradeUrl}

Thank you for trying Social Echo. We're excited to continue helping you create engaging content!

Best regards,
The Social Echo Team

---
Questions? Reply to this email - we're here to help!
    `
  };
}
