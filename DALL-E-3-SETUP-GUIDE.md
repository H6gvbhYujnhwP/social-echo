# DALL-E 3 Setup Guide for Social Echo

## 🎨 How to Set Up DALL-E 3 Image Generation

Follow these steps to get DALL-E 3 working with your Social Echo application:

### Step 1: Create an OpenAI Account

1. **Visit OpenAI Platform**: Go to [https://platform.openai.com](https://platform.openai.com)
2. **Sign Up**: Click "Sign up" and create an account with your email
3. **Verify Email**: Check your email and verify your account
4. **Complete Setup**: Fill in your profile information

### Step 2: Add Billing Information

⚠️ **Important**: DALL-E 3 is a paid service. You need to add billing information to use it.

1. **Go to Billing**: Navigate to [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
2. **Add Payment Method**: Click "Add payment method" and enter your credit card details
3. **Set Usage Limits**: Set monthly spending limits to control costs (recommended: $10-50/month)

### Step 3: Generate API Key

1. **Go to API Keys**: Navigate to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Create New Key**: Click "Create new secret key"
3. **Name Your Key**: Give it a descriptive name like "Social Echo App"
4. **Copy the Key**: **IMPORTANT**: Copy the key immediately - you won't be able to see it again!
   - It will look like: `sk-proj-abcd1234...`

### Step 4: Add API Key to Your Environment

#### For Local Development:
1. **Open your `.env.local` file** in the social-echo directory
2. **Add or update the OPENAI_API_KEY**:
   ```
   OPENAI_API_KEY=sk-proj-your-actual-api-key-here
   ```
3. **Save the file** and restart your development server

#### For Render Deployment:
1. **Go to your Render dashboard**: [https://dashboard.render.com](https://dashboard.render.com)
2. **Select your Social Echo service**
3. **Go to Environment tab**
4. **Add/Update Environment Variable**:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-your-actual-api-key-here`
5. **Save** and redeploy your service

### Step 5: Test Image Generation

1. **Generate text content** first in the dashboard
2. **Scroll down** to the "Create Image" section
3. **Select a style** (Meme, Illustration, or Photo-real)
4. **Click "Generate Image"**
5. **Wait 10-30 seconds** for DALL-E 3 to create your image

## 💰 DALL-E 3 Pricing

- **Standard Quality**: $0.040 per image (1024×1024)
- **HD Quality**: $0.080 per image (1024×1024)
- **Estimated Monthly Cost**: $5-20 for typical SME usage (5-15 images/day)

## 🔧 Technical Details

The application now uses:
- **Model**: `dall-e-3` (latest version)
- **Size**: `1024x1024` pixels (perfect for LinkedIn)
- **Quality**: `standard` (good balance of cost/quality)
- **Format**: Base64 encoded PNG

## 🚨 Troubleshooting

### "Nothing happens when I click Generate Image"
- ✅ Check browser console for errors (F12 → Console tab)
- ✅ Ensure you generated text content first
- ✅ Verify API key is correctly set in environment variables
- ✅ Check your OpenAI billing account has available credits

### "Failed to generate image" Error
- ✅ Verify your API key is valid and active
- ✅ Check your OpenAI account billing status
- ✅ Ensure you haven't exceeded usage limits
- ✅ Try again in a few minutes (rate limiting)

### "Insufficient Credits" Error
- ✅ Add more credits to your OpenAI billing account
- ✅ Check your monthly spending limits
- ✅ Verify your payment method is valid

## 📞 Support

If you continue having issues:
1. **Check OpenAI Status**: [https://status.openai.com](https://status.openai.com)
2. **Review OpenAI Docs**: [https://platform.openai.com/docs/guides/images](https://platform.openai.com/docs/guides/images)
3. **Contact OpenAI Support**: Through your platform dashboard

---

**Security Note**: Never share your API key publicly or commit it to version control. Keep it secure in environment variables only.
