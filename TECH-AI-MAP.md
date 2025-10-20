# Technical Map: AI Generation Logic

This document maps all files and functions that influence how LinkedIn post drafts are generated.

---

## Core Generation Files

### 1. `/app/api/generate-text/route.ts`
**Main generation handler** - Primary API endpoint for post generation

**Key Functions:**
- `POST` handler - Main entry point for post generation requests
- Validates user authentication and profile
- Checks usage limits (8 posts/month for Starter plan)
- Loads learning signals from feedback history
- Builds AI prompt with business context, tone, keywords
- Calls OpenAI API via `generateText()` from lib/openai.ts
- Parses response into canonical shape: `{ headline_options[], post_text, hashtags[], visual_prompt, best_time_uk }`
- Saves to PostHistory table
- Increments usage counter

**Generation Logic:**
- Lines 95-150: Learning signal analysis (tone preferences, hashtag count)
- Lines 152-220: Prompt construction with profile data, tone, keywords
- Lines 222-240: OpenAI API call and response parsing
- Lines 242-280: Post history saving and usage tracking

**Hardcoded Defaults:**
- Model: `gpt-4.1-mini` (line 222)
- Temperature: Not explicitly set (uses OpenAI default ~0.7)
- Hashtag count: `~8` mentioned in prompt (line 190)
- Response format: JSON with specific fields (line 200)

---

### 2. `/lib/openai.ts`
**OpenAI API wrapper** - Handles all OpenAI API calls

**Key Functions:**
- `generateText(prompt: string)` - Calls OpenAI text generation API
  - Uses `gpt-4.1-mini` model
  - Returns raw text response
  - Handles API errors and retries
  
- `generateImage(prompt: string)` - Calls DALL-E for image generation
  - Not currently used in main flow
  - Available for future visual generation

**Configuration:**
- Model: `gpt-4.1-mini` (line 15)
- Max tokens: Not set (uses default)
- Temperature: Not set (uses default ~0.7)

---

### 3. `/lib/learning-engine.ts`
**Learning system** - Analyzes feedback to improve future generations

**Key Functions:**
- `analyzeFeedback(feedbackList: Feedback[])` - Analyzes all user feedback
  - Identifies tone preferences (60% confidence threshold)
  - Calculates hashtag count preferences (50% confidence threshold)
  - Tracks post type performance
  - Returns learning signals: `{ preferredTone?, reduceHashtags?, preferredHashtagCount? }`

**Learning Logic:**
- Lines 10-40: Tone preference analysis
  - Counts positive feedback per tone
  - Requires 5+ feedback items minimum
  - Needs 60% confidence to recommend tone
  
- Lines 42-70: Hashtag count analysis
  - Tracks hashtag counts in positive feedback
  - Calculates average preferred count
  - Needs 50% confidence to adjust

**Influence on Generation:**
- Preferred tone → Used in prompt construction
- Hashtag count → Adjusts "approximately X hashtags" in prompt
- Currently called in generate-text route (line 95)

---

### 4. `/app/api/planner/route.ts`
**Weekly schedule** - Manages post type schedule for each day

**Key Functions:**
- `GET` handler - Returns weekly schedule (7 days)
  - Each day has: `{ day: 'mon'|'tue'|..., type: 'selling'|'informational'|'advice'|'news', enabled: boolean }`
  - Creates default schedule if none exists
  
- `POST` handler - Updates weekly schedule
  - Saves user's preferred post types per day

**Default Schedule:**
- Monday: Advice
- Tuesday: Informational
- Wednesday: Advice
- Thursday: Informational
- Friday: Advice
- Saturday: Informational
- Sunday: Selling

**Influence on Generation:**
- Dashboard checks planner for "auto" post type
- If auto, uses today's scheduled type
- Otherwise uses user-selected type

---

## UI Components That Shape Generation

### 5. `/app/dashboard/page.tsx`
**Main dashboard** - User interface for post generation

**Pre-flight Logic:**
- Lines 80-95: Determines effective post type
  - If "auto" → looks up today's day in planner
  - Otherwise uses selected type
  
- Lines 100-120: Determines effective tone
  - Uses customization override if provided
  - Falls back to profile tone
  
- Lines 130-150: Builds request payload
  - Includes: industry, tone, keywords, postType, profile data
  - Sends to `/api/generate-text`

**No prompt construction here** - just gathers inputs

---

### 6. `/components/TodayPanel.tsx`
**Post display & customization** - Shows generated post with options

**Customization Options:**
- Tone selector (Professional, Friendly, Authoritative, Inspirational, Conversational)
- Regenerate button (triggers new generation with same inputs)
- Customise button (opens modal for tone override)

**No generation logic** - just UI controls

---

### 7. `/app/train/page.tsx` + `/components/TrainForm.tsx`
**Profile training** - Collects business information

**Profile Fields That Affect Generation:**
- `business_name` - Used in prompt context
- `industry` - Shapes content relevance
- `tone` - Default voice (Professional, Friendly, etc.)
- `products_services` - What to talk about
- `target_audience` - Who to write for
- `usp` - Unique selling points to emphasize
- `keywords` - Terms to include/prioritize
- `rotation` - Content rotation strategy

**No generation logic** - just data collection

---

## Response Parsing & Validation

### 8. `/lib/contract.ts` (if exists)
**Response schema validation** - Ensures AI response matches expected shape

**Expected Schema:**
```typescript
{
  headline_options: string[],  // 3 headline choices
  post_text: string,           // Main post body
  hashtags: string[],          // ~8 hashtags
  visual_prompt: string,       // Image generation prompt
  best_time_uk: string         // Optimal posting time (HH:MM format)
}
```

**Note:** Currently validation is inline in generate-text route (lines 230-240)

---

## Summary of Generation Flow

```
User clicks "Generate" 
  ↓
Dashboard gathers inputs (profile, tone, postType, planner)
  ↓
POST /api/generate-text
  ↓
1. Check auth & usage limits
2. Load feedback → analyzeFeedback() → learning signals
3. Build prompt:
   - System: "You are a LinkedIn expert..."
   - User: "Generate post for [industry] about [products]..."
   - Include: tone, keywords, USP, target audience
   - Learning: preferred tone, hashtag count
4. Call OpenAI (gpt-4.1-mini)
5. Parse JSON response
6. Save to PostHistory
7. Return to UI
  ↓
TodayPanel displays post
```

---

## Current Issues & Hardcoded Values

### Hardcoded in `/app/api/generate-text/route.ts`:
- Model: `gpt-4.1-mini` (line 222)
- Hashtag count: "approximately 8" (line 190)
- Response format: Specific JSON fields (line 200)
- Learning thresholds: 60% for tone, 50% for hashtags (learning-engine.ts)
- Minimum feedback: 5 items (learning-engine.ts)

### Scattered Logic:
- Prompt construction: generate-text route (lines 152-220)
- Learning analysis: learning-engine.ts
- Post type resolution: dashboard page (lines 80-95)
- Default planner: planner route (lines 40-60)

### No Central Configuration:
- Can't change model without code deploy
- Can't adjust temperature
- Can't toggle features (headlines, visual prompt, hashtags)
- Can't adjust learning weights
- Can't enable/disable news mode

---

## Refactoring Goals

1. **Extract all generation logic** → `lib/ai/ai-service.ts`
2. **Create configuration** → `lib/ai/ai-config.ts` (DB-backed)
3. **Single entry point** → `buildAndGenerateDraft()`
4. **Admin controls** → `/admin/ai` to edit config live
5. **Versioning** → Track config changes in AdminConfigHistory

This will enable:
- ✅ Change AI model without deploy
- ✅ Adjust temperature, hashtag count
- ✅ Toggle features (headlines, visual prompt)
- ✅ Tune learning weights
- ✅ Enable/disable news mode
- ✅ Preview changes before saving
- ✅ Revert to previous versions
