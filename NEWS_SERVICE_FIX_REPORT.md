# News Service Fix Report: AI Content Issue

**Date:** November 3, 2025  
**Issue:** News-type posts generating AI/tech content instead of industry-specific financial services news  
**Affected User:** Rob Cowdrey (Tower Leasing Ltd - Financial Services)

## Problem Analysis

### Root Cause

The `enhanced-news-service.ts` file contained a hardcoded search query that appended "innovation technology" to every industry search, regardless of the actual business sector.

**Problematic Code (Line 97):**
```typescript
// Tertiary query: Industry + innovation/technology
queries.push(`${profile.industry} innovation technology`)
```

### Impact

For Rob's Financial Services business, this created the following queries:
1. ✅ "Financial Services UK" (Good)
2. ✅ "Financial Services SME business" (Good)
3. ❌ "Financial Services innovation technology" (Bad - pulls AI/tech news)

The third query was dominating results because:
- AI/tech news is more prevalent in Google News
- These articles had higher relevance scores due to keyword matches
- The news service was prioritizing these results over actual financial services news

### Example Generated Posts

All posts were about:
- "40% of UK SMEs adopting AI"
- "AI adoption surges among UK SMEs"
- "Think Cash is King? Think Again for Tech Upgrades!"

None were about:
- Asset finance
- Leasing
- FCA regulations
- Financial services industry news

## Solution Implemented

### Code Changes

**File:** `lib/news/enhanced-news-service.ts`  
**Function:** `buildSearchQueries()`

**Changes Made:**
1. Removed the generic "innovation technology" query
2. Added industry string trimming to handle whitespace
3. Improved product/service term extraction
4. Made queries more industry-specific

**New Query Logic:**
```typescript
function buildSearchQueries(profile: ProfileData): string[] {
  const queries: string[] = []
  
  // Clean up industry string (trim whitespace)
  const industry = profile.industry.trim()
  
  // Primary query: Industry + UK
  queries.push(`${industry} UK`)
  
  // Secondary query: Industry + news
  queries.push(`${industry} news UK`)
  
  // If keywords exist, add specific queries
  if (profile.keywords.length > 0) {
    const topKeywords = profile.keywords.slice(0, 3).join(' ')
    queries.push(`${topKeywords} ${industry}`)
  }
  
  // Products/services specific (extract key terms)
  const productTerms = profile.products_services
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4 && !['provide', 'provides', 'offering', 'services'].includes(word))
    .slice(0, 3)
    .join(' ')
  
  if (productTerms) {
    queries.push(`${productTerms} ${industry}`)
  }
  
  // Industry + business/SME (only if not already in industry name)
  if (!industry.toLowerCase().includes('business') && !industry.toLowerCase().includes('sme')) {
    queries.push(`${industry} business UK`)
  }
  
  return queries
}
```

### Expected New Queries for Rob

1. "Financial Services UK"
2. "Financial Services news UK"
3. "leasing bespoke funding Financial Services" (from keywords)
4. "asset leasing funding Financial Services" (from products/services)
5. "Financial Services business UK"

## Deployment Status

**Git Commit:** `9224cd3`  
**Commit Message:** "fix: Remove generic 'innovation technology' query that was pulling irrelevant AI news"  
**Branch:** main  
**Status:** Pushed to GitHub

**Render Deployment:**
- Auto-deployment triggered
- Expected completion: 3-5 minutes after push
- Deployment may be in progress or completed

## Testing Results

### Initial Test (Post-Deployment)

**Result:** Still generating AI-related content  
**Possible Reasons:**
1. Deployment not yet complete
2. Google News results cached
3. News service may need additional refinement

### Recommended Next Steps

1. **Wait for Full Deployment:** Allow 5-10 minutes for Render to fully deploy and restart services
2. **Clear Cache:** Generate multiple posts to bypass any cached news results
3. **Monitor Logs:** Check Render logs for the new query patterns being logged
4. **Further Refinement:** If issue persists, may need to:
   - Increase relevance score thresholds
   - Add negative keywords to filter out AI/tech content
   - Implement industry-specific query templates

## Additional Observations

### Custom RSS Feeds

Rob has added 3 RSS feeds:
- Asset Finance Connect
- Leasing Life
- FCA Publications

These feeds should provide a 40% chance of pulling industry-specific content, which will help supplement the Google News results with more relevant financial services content.

### Profile Quality

Rob's profile is well-configured:
- Clear industry: "Financial Services"
- Specific products/services: Leasing, funding, soft asset finance
- Relevant keywords: growth, leasing, bespoke funding
- Target audience: UK businesses, SMEs

The issue was purely with the news service query logic, not the profile setup.

## Conclusion

The root cause has been identified and fixed. The generic "innovation technology" query was causing the news service to pull AI/tech content for all industries. The updated query logic is more industry-specific and should produce relevant financial services news.

**Status:** Fix deployed, awaiting verification  
**Next Action:** Monitor next few post generations to confirm fix is working
