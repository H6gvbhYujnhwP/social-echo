# PR: Fix v8.8 Post Type Normalization Build Errors

## Summary

Fixes TypeScript build errors related to v8.8 post type canonicalization while maintaining strict typing and zero functional changes to billing/trials/webhooks.

## Problem

The v8.8 post type restructure introduced canonical keys (`selling`, `information_advice`, `random`, `news`) but some internal defaults still used legacy keys (`informational`, `advice`), causing TypeScript compilation errors.

## Solution

**Minimal, surgical fixes to 2 files only:**

### 1. `lib/localstore.ts` (Lines 249-281)

**Before:**
```typescript
byPostType: {
  selling: { up: 0, down: 0 },
  informational: { up: 0, down: 0 },  // ❌ Legacy key
  advice: { up: 0, down: 0 },          // ❌ Legacy key
  news: { up: 0, down: 0 }
}
```

**After:**
```typescript
byPostType: {
  selling: { up: 0, down: 0 },
  information_advice: { up: 0, down: 0 },  // ✅ Canonical key
  random: { up: 0, down: 0 },              // ✅ Canonical key
  news: { up: 0, down: 0 }
}

// Normalize legacy types at boundary when reading from history
const rawType = post.postType as string;
const normalizedType: PostType = 
  (rawType === 'informational' || rawType === 'advice') 
    ? 'information_advice' 
    : (post.postType as PostType);
```

**Impact:** Feedback stats now correctly aggregate legacy post types into `information_advice` bucket.

### 2. `lib/post-type-mapping.ts` (Line 148)

**Before:**
```typescript
return config?.key || 'information_advice'  // ❌ Type error
```

**After:**
```typescript
const key = config?.key as CanonicalPostTypeKey | undefined
return key || 'information_advice'  // ✅ Explicit type cast
```

**Impact:** TypeScript now correctly infers the return type.

## What Was NOT Changed

- ❌ No billing logic modified
- ❌ No trial logic modified
- ❌ No downgrade logic modified
- ❌ No webhook logic modified
- ❌ No Prisma schema changes
- ❌ No database migrations
- ❌ No dependency additions/removals
- ❌ tsconfig.json remains strict (noImplicitAny: true)

## Verification

### Type Check
```bash
$ pnpm tsc --noEmit
✅ 0 errors
```

### Build
```bash
$ pnpm build
✅ Production build successful
✅ All routes compiled
```

### Canonical Post Types Verified

**Internal defaults now use:**
- ✅ `selling` - Persuasive posts with CTAs
- ✅ `information_advice` - Actionable tips and insights
- ✅ `random` - Random / Fun Facts
- ✅ `news` - News commentary

**Legacy types normalized at boundaries:**
- `informational` → `information_advice`
- `advice` → `information_advice`

### Country Propagation Verified

✅ **lib/ai/ai-service-v8.8.ts** (Lines 80, 103, 158, 167)
- Country flows from Profile → GenInputs → Prompt builders
- Random data filters by country
- News provider filters by country
- Worldwide fallback when country not set

### Diversity Engine Verified

✅ **lib/ai/ai-service-v8.8.ts** (Lines 130-323)
- Style rotation active (friendly, witty, professional, bold)
- Banned phrase checking enabled
- N-gram de-duplication working
- Temperature/top_p variation applied

### Components Using Unified Mapping

All components import from `lib/post-type-mapping.ts`:
- ✅ Planner (app/planner/page.tsx)
- ✅ TodayPanel (app/dashboard/page.tsx)
- ✅ HistoryDrawer (via mapping functions)
- ✅ FineTunePanel (via mapping functions)
- ✅ Learning Engine (via normalization in localstore)

## Testing Checklist

- [x] TypeScript type check passes (0 errors)
- [x] Production build succeeds
- [x] Strict mode enabled (noImplicitAny: true)
- [x] No billing/trial/webhook changes
- [x] Country propagation intact
- [x] Diversity engine intact
- [x] Canonical keys used in all internal defaults
- [x] Legacy normalization at boundaries only
- [ ] Manual smoke test (UK profile)
- [ ] Manual smoke test (US profile)
- [ ] Manual smoke test (No country)
- [ ] Render preview deploy passes

## Files Changed

1. **lib/localstore.ts** - Fixed feedback stats to use canonical keys + normalize legacy at boundary
2. **lib/post-type-mapping.ts** - Fixed return type annotation in normalizePostType()

**Total lines changed:** ~40 lines across 2 files

## Deployment Plan

1. ✅ Create PR (this)
2. ⏳ Enable Render preview deploy
3. ⏳ Test preview with UK/US/neutral profiles
4. ⏳ Verify all 4 post types generate correctly
5. ⏳ Check history displays legacy posts with new labels
6. ⏳ Confirm feedback stats aggregate properly
7. ⏳ Merge to main after approval

## Rollback Plan

If issues arise, simply revert this PR. No database changes were made, so rollback is instant.

## Related Documentation

- See `lib/post-type-mapping.ts` for full normalization logic
- See blueprints for v8.8 post type restructure details
- See `lib/ai/ai-service-v8.8.ts` for country-aware generation

---

**Ready for review and Render preview testing.**

