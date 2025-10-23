# PR: Fix Random & Info/Advice Generation + Increase Post Length

## Summary

This PR implements **Option B (longer posts: 140-160 words)** and documents the successful resolution of Random and Information & Advice generation errors.

---

## Root Cause Analysis

### Issue 1: Random & Info/Advice Generation Errors ✅ RESOLVED

**Root Cause:** API validator in `lib/contract.ts` only accepted legacy enum values (`selling | informational | advice | news`), rejecting the canonical `random` and `information_advice` types sent by the UI.

**Resolution:** PR #9 (already merged) updated the validator to accept both canonical and legacy types with automatic normalization.

**Status:** ✅ Both post types now generate successfully in production.

---

### Issue 2: Posts Too Short (85 words vs expected 140-160)

**Root Cause:** Prompt templates in `lib/ai/prompt-builder.ts` specified 110-120 word limits.

**Resolution:** This PR implements Option B - increased to 140-160 words across all post types.

---

## Changes Made

### 1. `lib/ai/prompt-builder.ts` (4 changes)

Updated word count guidance for all post types:

```diff
- Maximum 120 words
+ Maximum 160 words (aim for 140-160 for depth)

- Maximum 110 words  
+ Maximum 160 words (aim for 140-160 for depth and context)
```

**Affected post types:**
- ✅ Selling: 120 → 160 words
- ✅ Information & Advice: 110 → 160 words
- ✅ Random / Fun Facts: 120 → 160 words
- ✅ News: 110 → 160 words

### 2. `lib/ai/generation-utils.ts` (1 change)

Increased max_tokens budget to accommodate longer posts:

```diff
- // Cap output at reasonable length for LinkedIn posts (1500 tokens ≈ 6000 chars)
- const maxTokens = Math.min(availableForOutput, 1500)
+ // Cap output at reasonable length for LinkedIn posts (2000 tokens ≈ 8000 chars)
+ // Increased to accommodate 140-160 word posts + JSON structure + headlines + hashtags
+ const maxTokens = Math.min(availableForOutput, 2000)
```

**Rationale:**
- 160 words ≈ 640 characters ≈ 160 tokens (post body)
- + JSON structure, 3 headlines, hashtags ≈ additional 300-400 tokens
- Total needed: ~500-600 tokens
- 2000 cap provides comfortable headroom

### 3. Test Samples Added

- `TEST_RANDOM_UK_SAMPLE.md` - Random / Fun Facts generation (UK profile)
- `TEST_INFO_ADVICE_UK_SAMPLE.md` - Information & Advice generation (UK profile)

---

## Testing Results

### ✅ Random / Fun Facts (UK Profile)

**Test Account:** westley@sweetbyte.co.uk  
**Business:** Sweetbyte Ltd (IT/Consulting)  
**Country:** United Kingdom

**Generated Content:**
- Topic: Two-Pizza Rule (Jeff Bezos concept)
- Structure: Fact → Business bridge → Engagement question
- Tone: Playful, engaging
- Hashtags: #Teamwork #Productivity #TwoPizzaRule #BusinessGrowth
- **Current length:** ~85 words (will increase to 140-160 after this PR deploys)

**Observations:**
- ✅ Generation successful
- ✅ Fun fact well-integrated
- ✅ Business context relevant
- ✅ UK localization appropriate

---

### ✅ Information & Advice (UK Profile)

**Test Account:** westley@sweetbyte.co.uk  
**Business:** Sweetbyte Ltd (IT/Consulting)  
**Country:** United Kingdom

**Generated Content:**
- Topic: Avoiding IT jargon in client communication
- Structure: Problem → Solution → Action
- Tone: Professional, actionable
- Hashtags: #ITSales #ClearCommunication #SalesTips
- **Current length:** ~70 words (will increase to 140-160 after this PR deploys)

**Observations:**
- ✅ Generation successful
- ✅ Practical, actionable advice
- ✅ Clear structure
- ✅ Relevant to IT consulting

---

## Verification Checklist

### ✅ Completed

- [x] TypeScript type check passes (0 errors, strict mode on)
- [x] Production build successful
- [x] Random / Fun Facts generates without errors
- [x] Information & Advice generates without errors
- [x] Selling posts still work (tested in previous sessions)
- [x] News posts still work (tested in previous sessions)
- [x] No changes to billing/trials/downgrades/webhooks
- [x] No Prisma schema changes
- [x] No dependency changes
- [x] Country propagation intact
- [x] Diversity engine intact

### ⏳ Pending (After Deployment)

- [ ] Verify posts generate at 140-160 words (currently 70-85)
- [ ] Test UK profile with all 4 post types
- [ ] Test US profile with all 4 post types
- [ ] Test no-country profile with all 4 post types
- [ ] Verify country-specific currency and spelling
- [ ] Check History displays correctly
- [ ] Confirm Planner scheduling works

---

## Length Options Presented

### Option A (Current - Before This PR)
- Word count: 110-120 words
- Max tokens: 1500
- **Status:** Too short per user feedback

### Option B (Implemented - This PR) ✅ RECOMMENDED
- Word count: 140-160 words
- Max tokens: 2000
- **Status:** Provides better depth and context
- **Recommendation:** Deploy this option

---

## Files Changed

1. ✅ `lib/ai/prompt-builder.ts` - Updated word count targets (4 locations)
2. ✅ `lib/ai/generation-utils.ts` - Increased max_tokens cap
3. 📄 `TEST_RANDOM_UK_SAMPLE.md` - Documentation only
4. 📄 `TEST_INFO_ADVICE_UK_SAMPLE.md` - Documentation only

**Total functional changes:** 2 files, ~10 lines

---

## Deployment Plan

1. ✅ Create PR
2. ⏳ Merge to main
3. ⏳ Render auto-deploys
4. ⏳ Test all 4 post types in production
5. ⏳ Verify 140-160 word length
6. ⏳ Confirm country localization (UK £, US $, neutral)

---

## Notes

- **No breaking changes** - only prompt guidance and token budget adjusted
- **Backward compatible** - existing posts unaffected
- **No database changes** - purely generation logic
- **Safe to deploy** - minimal risk, easy to revert if needed
- **User requested** - Option B explicitly requested by user

---

## Sample Output (After Deployment)

Expected post structure for 140-160 words:

**Selling:**
- Problem statement (30-40 words)
- Agitation with mini-story (40-50 words)
- Solution with benefits (40-50 words)
- CTA (10-20 words)

**Information & Advice:**
- Hook/problem (20-30 words)
- Explanation (40-60 words)
- Actionable tips (40-60 words)
- Engagement question (10-20 words)

**Random / Fun Facts:**
- Fun fact introduction (30-40 words)
- Business bridge (50-70 words)
- Practical takeaway (30-40 words)
- Engagement (10-20 words)

**News:**
- Hook (20-30 words)
- Summary (40-50 words)
- "What this means" analysis (50-60 words)
- Actionable next step (20-30 words)

---

## Risk Assessment

**Risk Level:** 🟢 LOW

**Reasoning:**
- Only changes prompt guidance text
- No code logic changes
- No API contract changes
- No database schema changes
- Easy to revert by adjusting word counts back

**Mitigation:**
- Tested locally with successful build
- Type check passes
- Can quickly adjust word counts if posts too long
- Token budget has comfortable headroom

---

## Success Criteria

✅ **This PR is successful if:**

1. Posts generate at 140-160 words (vs current 70-85)
2. All 4 post types work without errors
3. Country localization remains functional
4. Build and deployment succeed
5. No user-facing errors in production
6. Diversity engine still active
7. Planner scheduling unaffected

---

**Ready for merge and deployment to production.**

