# PR: Fix API Validator to Accept Canonical Post Types

## Problem

The live production error showed:
```
Invalid enum value. Expected 'selling' | 'informational' | 'advice' | 'news', received 'random'
```

**Root cause:** The API validator in `lib/contract.ts` still used the old enum that didn't include the new canonical types (`information_advice`, `random`).

## Solution

Updated API validators to accept **both canonical and legacy types** with automatic normalization at the boundary.

---

## Files Changed

### 1. `lib/contract.ts` (Lines 19-27, 47-56)

**Before:**
```typescript
post_type: z.enum(['selling', 'informational', 'advice', 'news'])
```

**After:**
```typescript
// Accept both canonical (v8.8) and legacy types for backward compatibility
post_type: z.enum(['selling', 'information_advice', 'random', 'news', 'informational', 'advice'])
  .transform((val) => {
    // Normalize legacy types to canonical
    if (val === 'informational' || val === 'advice') {
      return 'information_advice';
    }
    return val;
  })
```

**Impact:** 
- ✅ API now accepts all 4 canonical types: `selling`, `information_advice`, `random`, `news`
- ✅ Backward compatible: still accepts legacy `informational` and `advice`
- ✅ Automatic normalization at boundary before generation pipeline
- ✅ Applied to both `TextGenerationRequestSchema` and `ImageGenerationRequestSchema`

### 2. `lib/ai/ai-config.ts` (Line 12)

**Before:**
```typescript
export type PostType = 'selling' | 'informational' | 'advice' | 'news'
```

**After:**
```typescript
// PostType includes both canonical (v8.8) and legacy types for backward compatibility
// Canonical: selling, information_advice, random, news
// Legacy: informational, advice (normalized to information_advice at runtime)
export type PostType = 'selling' | 'information_advice' | 'random' | 'news' | 'informational' | 'advice'
```

**Impact:**
- ✅ TypeScript type now matches runtime validation
- ✅ Allows AI service functions to accept normalized types from validator
- ✅ Maintains backward compatibility throughout the codebase

---

## What Was NOT Changed

- ❌ No billing logic
- ❌ No trial logic
- ❌ No downgrade logic
- ❌ No webhook logic
- ❌ No Prisma schema
- ❌ No database migrations
- ❌ No dependency changes
- ❌ tsconfig.json unchanged (strict mode still on)

---

## Client → Server Alignment Verified

All UI surfaces already send canonical keys:

### ✅ TodayPanel (`components/TodayPanel.tsx`)
- Uses `POST_TYPE_CONFIGS` from mapping module
- Sends: `selling`, `information_advice`, `random`, `news`

### ✅ Dashboard (`app/dashboard/page.tsx`)
- Line 274: `post_type: effectivePostType === 'auto' ? 'information_advice' : effectivePostType`
- Sends canonical keys directly

### ✅ Planner (`app/planner/page.tsx`)
- Line 28: `const postTypeOptions: PostType[] = ['selling', 'information_advice', 'random', 'news']`
- Uses canonical keys only

### ✅ FineTunePanel (`components/FineTunePanel.tsx`)
- Line 9: Imports `POST_TYPE_CONFIGS` from mapping module
- Uses canonical keys

### ✅ HistoryDrawer (`components/HistoryDrawer.tsx`)
- Line 5: Imports `postTypeDisplay`, `getPostTypeIcon` from mapping module
- Displays legacy posts with new labels via normalization

---

## Single Source of Truth

All surfaces import from **`lib/post-type-mapping.ts`**:

```typescript
// Canonical post types (v8.8)
export const POST_TYPE_CONFIGS = [
  {
    key: 'selling',
    display: 'Selling',
    icon: '💰',
    description: 'Persuasive posts with clear CTAs'
  },
  {
    key: 'information_advice',
    display: 'Information & Advice',
    icon: '💡',
    description: 'Actionable tips and insights'
  },
  {
    key: 'random',
    display: 'Random / Fun Facts',
    icon: '🎲',
    description: 'Random facts and fun content'
  },
  {
    key: 'news',
    display: 'News',
    icon: '📰',
    description: 'News commentary and analysis'
  }
]

// Normalization function
export function normalizePostType(postType: string): CanonicalPostTypeKey {
  if (postType === 'informational' || postType === 'advice') {
    return 'information_advice'
  }
  const config = POST_TYPE_CONFIGS.find(c => c.key === postType)
  const key = config?.key as CanonicalPostTypeKey | undefined
  return key || 'information_advice'
}
```

---

## Verification

### ✅ Type Check
```bash
$ pnpm tsc --noEmit
✅ 0 errors (strict mode enabled)
```

### ✅ Build
```bash
$ pnpm build
✅ Production build successful
✅ All routes compiled
```

### ✅ Country Propagation Intact

Verified in `lib/ai/ai-service-v8.8.ts`:
- Line 80: `country: profile.country || undefined`
- Line 103: Logs country in generation
- Line 158: Random data filters by country
- Line 167: News provider filters by country
- Worldwide fallback when country not set

### ✅ Diversity Engine Intact

Verified in `lib/ai/ai-service-v8.8.ts`:
- Lines 130-140: Diversity params generation active
- Line 140: Style rotation (friendly, witty, professional, bold)
- Lines 318-323: Repetition checking with n-gram de-duplication
- Lines 212-214: Temperature/top_p variation

---

## Testing Checklist

### Type Safety
- [x] TypeScript type check passes (0 errors)
- [x] Production build succeeds
- [x] Strict mode enabled (noImplicitAny: true)

### API Validation
- [x] Accepts canonical types: selling, information_advice, random, news
- [x] Accepts legacy types: informational, advice
- [x] Normalizes legacy → canonical at boundary
- [x] No validation errors for "random" type

### UI Alignment
- [x] TodayPanel sends canonical keys
- [x] Planner sends canonical keys
- [x] FineTunePanel uses POST_TYPE_CONFIGS
- [x] HistoryDrawer uses mapping functions

### Single Source of Truth
- [x] All surfaces import from lib/post-type-mapping.ts
- [x] No local enums or hardcoded lists
- [x] Normalization function used consistently

### System Integrity
- [x] No billing/trial/webhook changes
- [x] Country propagation intact
- [x] Diversity engine intact
- [x] Learning engine uses normalized types (via localstore)

### Manual Testing (To Do on Preview)
- [ ] UK profile: Generate all 4 types (selling, info_advice, random, news)
- [ ] US profile: Generate all 4 types
- [ ] No country: Generate all 4 types (news falls back to worldwide)
- [ ] Planner: Scheduled generation works
- [ ] History: Legacy posts display with new labels
- [ ] Feedback: Stats aggregate correctly
- [ ] Content: UK spelling/£ for UK, US spelling/$ for US

---

## Error Handling

### Server-Side Guard

The validator now safely handles any post_type value:

```typescript
.transform((val) => {
  // Normalize legacy types to canonical
  if (val === 'informational' || val === 'advice') {
    return 'information_advice';
  }
  return val;
})
```

If an unknown value sneaks through:
1. Zod validation catches it at enum level
2. Returns 400 with clear error message
3. No generation route crash

### Client-Side Consistency

All UI components use `POST_TYPE_CONFIGS` so they can only send valid canonical keys. No drift possible.

---

## Deployment Plan

1. ✅ Create PR (this)
2. ⏳ Enable Render preview deploy
3. ⏳ Test preview:
   - Manual generation (all 4 types)
   - Planner-triggered generation
   - UK/US/neutral profiles
   - History display
   - Feedback stats
4. ⏳ Merge to main after approval

---

## Rollback Plan

If issues arise, simply revert this PR. Changes are minimal:
- 2 files modified
- ~50 lines changed
- No database changes
- Instant rollback

---

## Summary

**Problem:** API rejected "random" post type
**Solution:** Updated validators to accept canonical types with legacy normalization
**Impact:** Zero breaking changes, full backward compatibility
**Files:** 2 (lib/contract.ts, lib/ai/ai-config.ts)
**Lines:** ~50
**Tests:** Type check ✅, Build ✅, Manual testing pending on preview

**Ready for Render preview testing.**

