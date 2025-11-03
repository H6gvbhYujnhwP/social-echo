# Social Echo: Feedback-to-Training Loop - Technical Design

**Date:** November 2, 2025  
**Author:** Manus AI  
**Purpose:** Technical design and architecture for implementing the feedback-to-training loop that makes the AI learn from user feedback.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. User generates post → 2. User gives feedback (👍/👎 + note) │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FEEDBACK STORAGE (Existing)                   │
│  • Feedback table: rating, note, postType, tone, keywords, etc. │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              LEARNING SIGNALS DERIVATION (New!)                  │
│  • Analyze all user feedback                                     │
│  • Extract preferred/avoided terms                               │
│  • Calculate preferred tone and post types                       │
│  • Calculate confidence level                                    │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                 AI GENERATION WITH LEARNING                      │
│  • Load learning signals before generation                       │
│  • Enhance prompts with preferred/avoided terms                  │
│  • Bias tone and post type selection                             │
│  • Generate personalized content                                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    IMPROVED POST GENERATED                       │
│  • User sees better, more personalized content                   │
│  • Cycle continues with more feedback                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Existing: Feedback Table

```prisma
model Feedback {
  id       String   @id @default(cuid())
  userId   String
  postId   String   @unique
  feedback String   // 'up' | 'down'
  note     String?  @db.Text
  
  // Context at time of feedback
  postType String
  tone     String
  keywords String[]
  hashtags String[]
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([postId])
}
```

### New: LearningSignals Interface

```typescript
export interface LearningSignals {
  // Derived from feedback analysis
  preferredTerms: string[]        // Terms from upvoted posts (keywords + hashtags)
  avoidedTerms: string[]          // Terms from downvoted posts
  preferredTone: string | null    // Tone with highest success rate
  preferredPostTypes: string[]    // Post types with highest success rate
  
  // Metadata
  confidence: number              // 0-100, based on feedback count
  totalFeedback: number           // Total feedback items
  upvoteRate: number              // Percentage of upvotes
  
  // Timestamps
  lastCalculated: Date            // When signals were last derived
  feedbackSince: Date | null      // Date of oldest feedback used
}
```

### Optional: LearningSignalsCache Table

For performance optimization, we could cache learning signals:

```prisma
model LearningSignalsCache {
  id              String   @id @default(cuid())
  userId          String   @unique
  
  // Cached signals (JSON)
  signals         Json
  
  // Cache metadata
  calculatedAt    DateTime @default(now())
  feedbackCount   Int      // Number of feedback items when calculated
  
  @@index([userId])
}
```

**Benefits:**
- Avoid recalculating signals on every generation
- Can invalidate cache when new feedback is added
- Improves generation speed

**Tradeoffs:**
- Adds complexity
- Requires cache invalidation logic
- May show stale data if not invalidated properly

**Decision:** Start without cache, add later if performance becomes an issue.

---

## Core Algorithms

### 1. Derive Learning Signals

```typescript
async function deriveLearningSignals(userId: string): Promise<LearningSignals> {
  // 1. Fetch all feedback for user
  const allFeedback = await prisma.feedback.findMany({
    where: { userId },
    include: { post: true },
    orderBy: { createdAt: 'desc' }
  })
  
  if (allFeedback.length === 0) {
    return getDefaultSignals()
  }
  
  // 2. Separate by rating
  const upvoted = allFeedback.filter(f => f.feedback === 'up')
  const downvoted = allFeedback.filter(f => f.feedback === 'down')
  
  // 3. Extract terms
  const preferredTerms = extractTermsFromFeedback(upvoted)
  const avoidedTerms = extractTermsFromFeedback(downvoted)
  
  // 4. Calculate preferred tone
  const preferredTone = calculatePreferredTone(allFeedback)
  
  // 5. Calculate preferred post types
  const preferredPostTypes = calculatePreferredPostTypes(allFeedback)
  
  // 6. Calculate confidence
  const confidence = calculateConfidence(allFeedback.length)
  
  // 7. Calculate upvote rate
  const upvoteRate = (upvoted.length / allFeedback.length) * 100
  
  return {
    preferredTerms,
    avoidedTerms,
    preferredTone,
    preferredPostTypes,
    confidence,
    totalFeedback: allFeedback.length,
    upvoteRate,
    lastCalculated: new Date(),
    feedbackSince: allFeedback[allFeedback.length - 1]?.createdAt || null
  }
}
```

### 2. Extract Terms from Feedback

```typescript
function extractTermsFromFeedback(
  feedback: Feedback[], 
  minFrequency: number = 2
): string[] {
  const termCounts = new Map<string, number>()
  
  feedback.forEach(f => {
    // Extract from keywords
    f.keywords.forEach(keyword => {
      const normalized = keyword.toLowerCase().trim()
      termCounts.set(normalized, (termCounts.get(normalized) || 0) + 1)
    })
    
    // Extract from hashtags (remove # symbol)
    f.hashtags.forEach(hashtag => {
      const normalized = hashtag.replace('#', '').toLowerCase().trim()
      termCounts.set(normalized, (termCounts.get(normalized) || 0) + 1)
    })
  })
  
  // Filter by minimum frequency and sort by count
  return Array.from(termCounts.entries())
    .filter(([_, count]) => count >= minFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([term, _]) => term)
    .slice(0, 20) // Top 20 terms
}
```

### 3. Calculate Preferred Tone

```typescript
function calculatePreferredTone(feedback: Feedback[]): string | null {
  const toneStats = new Map<string, { up: number; down: number }>()
  
  feedback.forEach(f => {
    if (!toneStats.has(f.tone)) {
      toneStats.set(f.tone, { up: 0, down: 0 })
    }
    
    const stats = toneStats.get(f.tone)!
    if (f.feedback === 'up') {
      stats.up++
    } else {
      stats.down++
    }
  })
  
  // Calculate success rate for each tone
  const toneRates = Array.from(toneStats.entries()).map(([tone, stats]) => {
    const total = stats.up + stats.down
    const successRate = total > 0 ? (stats.up / total) * 100 : 0
    return { tone, successRate, total }
  })
  
  // Require at least 3 feedback items for a tone to be preferred
  const validTones = toneRates.filter(t => t.total >= 3)
  
  if (validTones.length === 0) return null
  
  // Return tone with highest success rate
  validTones.sort((a, b) => b.successRate - a.successRate)
  return validTones[0].successRate >= 60 ? validTones[0].tone : null
}
```

### 4. Calculate Preferred Post Types

```typescript
function calculatePreferredPostTypes(feedback: Feedback[]): string[] {
  const typeStats = new Map<string, { up: number; down: number }>()
  
  feedback.forEach(f => {
    if (!typeStats.has(f.postType)) {
      typeStats.set(f.postType, { up: 0, down: 0 })
    }
    
    const stats = typeStats.get(f.postType)!
    if (f.feedback === 'up') {
      stats.up++
    } else {
      stats.down++
    }
  })
  
  // Calculate success rate for each type
  const typeRates = Array.from(typeStats.entries()).map(([type, stats]) => {
    const total = stats.up + stats.down
    const successRate = total > 0 ? (stats.up / total) * 100 : 0
    return { type, successRate, total }
  })
  
  // Require at least 3 feedback items for a type to be preferred
  const validTypes = typeRates.filter(t => t.total >= 3 && t.successRate >= 60)
  
  // Sort by success rate
  validTypes.sort((a, b) => b.successRate - a.successRate)
  
  return validTypes.map(t => t.type)
}
```

### 5. Calculate Confidence

```typescript
function calculateConfidence(feedbackCount: number): number {
  if (feedbackCount === 0) return 0
  
  // Confidence grows logarithmically
  // 0 feedback = 0%
  // 5 feedback = 30%
  // 10 feedback = 50%
  // 20 feedback = 70%
  // 50+ feedback = 100%
  
  if (feedbackCount >= 50) return 100
  if (feedbackCount >= 20) return 70 + ((feedbackCount - 20) / 30) * 30
  if (feedbackCount >= 10) return 50 + ((feedbackCount - 10) / 10) * 20
  if (feedbackCount >= 5) return 30 + ((feedbackCount - 5) / 5) * 20
  
  return (feedbackCount / 5) * 30
}
```

---

## Prompt Enhancement Strategy

### Confidence-Based Influence

The learning signals should influence prompts based on confidence level:

| Confidence | Influence Level | Strategy |
|------------|----------------|----------|
| 0-20% | None | Don't use learning signals (not enough data) |
| 21-40% | Subtle | Mention preferred terms as suggestions |
| 41-60% | Moderate | Emphasize preferred terms and tone |
| 61-80% | Strong | Prioritize preferred terms, avoid avoided terms |
| 81-100% | Very Strong | Heavily bias towards learned preferences |

### Prompt Enhancement Examples

**Base Prompt (No Learning):**
```
Generate a professional LinkedIn post for a marketing agency.
Target audience: SME owners.
Include these keywords: marketing, growth, ROI.
```

**Enhanced Prompt (60% Confidence):**
```
Generate a professional LinkedIn post for a marketing agency.
Target audience: SME owners.
Include these keywords: marketing, growth, ROI.

IMPORTANT LEARNING SIGNALS (Confidence: 60%):
- The user loves these terms: "data-driven", "results", "strategy", "proven"
- The user prefers a "professional" tone with occasional wit
- The user's most successful posts are "information_advice" type
- Avoid these terms: "game-changer", "revolutionary", "disruption"

Incorporate the preferred terms naturally and maintain the preferred tone.
```

**Enhanced Prompt (90% Confidence):**
```
Generate a professional LinkedIn post for a marketing agency.
Target audience: SME owners.
Include these keywords: marketing, growth, ROI.

CRITICAL LEARNING SIGNALS (Confidence: 90% - High Priority):
- MUST include these user-preferred terms: "data-driven", "results", "strategy", "proven", "actionable"
- MUST use a "professional" tone with subtle wit (user's strong preference)
- MUST follow "information_advice" post structure (user's favorite type)
- MUST AVOID these terms: "game-changer", "revolutionary", "disruption", "synergy"
- User loves posts with: specific statistics, actionable tips, real-world examples

This user has provided extensive feedback. Prioritize their learned preferences heavily.
```

---

## API Endpoints

### New: GET /api/learning-signals

**Purpose:** Fetch learning signals for the current user

**Response:**
```json
{
  "preferredTerms": ["data-driven", "results", "strategy"],
  "avoidedTerms": ["game-changer", "revolutionary"],
  "preferredTone": "professional",
  "preferredPostTypes": ["information_advice", "selling"],
  "confidence": 75,
  "totalFeedback": 32,
  "upvoteRate": 78.1,
  "lastCalculated": "2025-11-02T10:30:00Z",
  "feedbackSince": "2025-10-15T08:00:00Z"
}
```

**Usage:**
- Called by the AI Insights Dashboard to display learning status
- Called by the generation service before generating posts
- Can be cached on the frontend for performance

### Modified: POST /api/generate-text

**Before:**
```typescript
// No learning signals
const draft = await buildAndGenerateDraftV8({
  userId,
  postType,
  profile,
  plannerType,
  twists
})
```

**After:**
```typescript
// Derive learning signals
const learningSignals = await deriveLearningSignals(userId)

// Pass to generation
const draft = await buildAndGenerateDraftV8({
  userId,
  postType,
  profile,
  plannerType,
  learningSignals,  // ← Now populated!
  twists
})
```

---

## UI Enhancements

### 1. Learning Progress Component

**New Features:**
- **"Learning Active" Badge** - Shown when confidence > 30%
- **Preferred Terms Display** - Show as colored tags/chips
- **Avoided Terms Display** - Show with strikethrough
- **Learning Status Message** - "Your feedback is now influencing post generation!"

**Example:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Learning Progress              🔄 Learning Active (75%)  │
├─────────────────────────────────────────────────────────────┤
│ Your AI is getting smarter with every feedback              │
│                                                              │
│ ✨ Your feedback is now influencing post generation!        │
│                                                              │
│ Preferred Terms:                                            │
│ [data-driven] [results] [strategy] [proven] [actionable]    │
│                                                              │
│ Avoided Terms:                                              │
│ [game-changer] [revolutionary] [disruption]                 │
│                                                              │
│ Preferred Tone: Professional (85% success rate)             │
│ Preferred Post Type: Information & Advice (90% success)     │
└─────────────────────────────────────────────────────────────┘
```

### 2. Feedback Buttons Component

**New Feature:**
- Add a small info message: "💡 Your feedback helps the AI learn your style"
- After submission: "✅ Learning from your feedback! Next post will be even better."

---

## Testing Strategy

### Unit Tests

1. **extractTermsFromFeedback()**
   - Empty feedback → empty array
   - Single feedback → correct term extraction
   - Multiple feedback → correct frequency counting
   - Duplicate terms → correct deduplication

2. **calculatePreferredTone()**
   - No feedback → null
   - Insufficient feedback per tone → null
   - Clear winner → correct tone
   - Tie → highest count wins

3. **calculateConfidence()**
   - 0 feedback → 0%
   - 5 feedback → 30%
   - 50 feedback → 100%

### Integration Tests

1. **Feedback → Signals → Generation Flow**
   - Create user with profile
   - Generate 10 posts
   - Provide feedback (7 up, 3 down)
   - Verify learning signals are derived correctly
   - Generate new post with signals
   - Verify preferred terms appear in new post

2. **Confidence Thresholds**
   - 0-5 feedback → No influence on generation
   - 10 feedback → Moderate influence
   - 30 feedback → Strong influence

### User Acceptance Tests

1. **User Journey:**
   - New user generates first post → No learning signals
   - User provides 5 feedback items → Low confidence, subtle influence
   - User provides 20 feedback items → High confidence, strong influence
   - User sees "Learning Active" badge and preferred terms

2. **Feedback Quality:**
   - User upvotes posts with specific terms → Those terms appear more often
   - User downvotes posts with specific terms → Those terms appear less often
   - User prefers specific tone → That tone is used more often

---

## Performance Considerations

### Query Optimization

**Problem:** Fetching all feedback for a user could be slow for power users

**Solution:**
- Add index on `userId` and `createdAt` for fast sorting
- Limit to most recent 100 feedback items (older feedback has less weight)
- Consider caching learning signals (invalidate on new feedback)

### Generation Speed

**Problem:** Deriving learning signals on every generation adds latency

**Solution:**
- Cache learning signals in memory or Redis
- Invalidate cache when new feedback is added
- Recalculate signals asynchronously after feedback submission

---

## Rollout Plan

### Phase 1: Backend Implementation (Week 1)
- Create `lib/ai/learning-signals.ts`
- Create `/api/learning-signals` endpoint
- Add unit tests

### Phase 2: AI Integration (Week 1-2)
- Modify `ai-service-v8.8.ts` to call learning signals
- Enhance prompt builders with learning signals
- Add integration tests

### Phase 3: UI Enhancements (Week 2)
- Update LearningProgress component
- Add "Learning Active" badge
- Display preferred/avoided terms

### Phase 4: Testing & Validation (Week 2-3)
- User acceptance testing
- A/B test: generation with vs without learning signals
- Measure feedback quality improvement

### Phase 5: Production Deployment (Week 3)
- Deploy to production
- Monitor performance and error rates
- Gather user feedback

---

## Success Metrics

**Quantitative:**
- 50%+ of users provide feedback on 50%+ of posts
- 70%+ success rate (upvotes) after 20 feedback items
- 15% increase in 30-day user retention
- 20% increase in posts generated per user

**Qualitative:**
- User survey: "Does the AI feel like it's learning your style?" (80% agree)
- User survey: "Are posts improving over time?" (75% agree)
- User testimonials mentioning personalization

---

## Future Enhancements

1. **Semantic Analysis** - Use NLP to analyze feedback notes and extract themes
2. **Trend Analysis** - Show how preferences change over time
3. **Comparative Insights** - "Your AI is 25% more personalized than the average user"
4. **Export Learning Profile** - Allow users to download their learning signals
5. **Reset Learning** - Allow users to reset their AI if they want to start fresh

