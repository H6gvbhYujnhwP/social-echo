# Social Echo

AI-powered LinkedIn content generator for SMEs. Train your ECHO once — then generate your daily LinkedIn post + image in under 10 minutes.

## Features

- **Profile Training**: Set up your business details once
- **Content Generation**: AI-powered LinkedIn post creation with multiple headline options
- **Image Generation**: Create scroll-stopping visuals to accompany your posts
- **Fine-tuning**: Adjust tone and add daily context twists
- **Copy-to-Clipboard**: Easy content copying for immediate use

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini for text, DALL-E 3 for images
- **Storage**: localStorage (browser-based, no database required for MVP)
- **Validation**: Zod for API contract validation

## Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/H6gvbhYujnhwP/social-echo.git
cd social-echo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_actual_openai_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Render Deployment

1. **Create Web Service** on Render
2. **Connect Repository**: Link your GitHub repository
3. **Configure Build Settings**:
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm run start`
   - Node Version: 18+

4. **Set Environment Variables**:
   ```
   OPENAI_API_KEY=your_openai_api_key
   APP_NAME=SOCIAL ECHO
   JWT_SECRET=your_secure_jwt_secret
   NODE_ENV=production
   ```

## Usage

1. **Welcome**: Start at the welcome page
2. **Train**: Set up your business profile and content preferences
3. **Generate**: Create daily LinkedIn posts with AI assistance
4. **Fine-tune**: Adjust tone and add contextual twists
5. **Create Images**: Generate accompanying visuals
6. **Copy & Post**: Use the copy buttons to transfer content to LinkedIn

## API Endpoints

### POST /api/generate-text
Generates LinkedIn post content based on business profile.

**Request Body**:
```json
{
  "business_name": "string",
  "industry": "string", 
  "tone": "professional|casual|funny|bold",
  "products_services": "string",
  "target_audience": "string",
  "keywords": "comma,separated,words",
  "rotation": "serious|quirky"
}
```

**Response**:
```json
{
  "headline_options": ["...", "...", "..."],
  "post_text": "Full LinkedIn draft...",
  "hashtags": ["#tag1", "#tag2", "..."],
  "visual_prompt": "Image description...",
  "best_time_uk": "09:10"
}
```

### POST /api/generate-image
Generates images based on visual prompts.

**Request Body**:
```json
{
  "visual_prompt": "string",
  "industry": "string",
  "tone": "string",
  "style": "meme|illustration|photo-real"
}
```

**Response**:
```json
{
  "image_base64": "data:image/png;base64,..."
}
```

## Project Structure

```
social-echo/
├── app/                    # Next.js App Router pages
│   ├── welcome/           # Welcome page
│   ├── train/             # Profile training page  
│   ├── dashboard/         # Main dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # Base UI components
│   └── *.tsx              # Feature components
├── lib/                   # Utility libraries
│   ├── openai.ts          # OpenAI client
│   ├── contract.ts        # API validation schemas
│   └── localstore.ts      # localStorage utilities
└── styles/                # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License
