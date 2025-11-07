# News Service Critical Fix V2 - Industry-Specific Queries & Enhanced Filtering

**Date**: November 7, 2025  
**Issue**: Rob (Financial Services user) consistently receiving irrelevant AI/tech adoption news instead of industry-specific content  
**Severity**: CRITICAL - 100% failure rate on news posts for Financial Services users

---

## Problem Analysis

### Test Results
Generated 2 consecutive news posts for Rob's account:

**Post #1:**
- Headlines: "Ready to Join the AI Revolution? UK SMEs Are Leading the Charge!"
- Content: UK SMEs embracing AI tools, 40% adoption, 20-30% productivity gains
- Hashtags: #AIRevolution #UKSMEs #DigitalTransformation
- **Relevance to Financial Services/Leasing**: 0%

**Post #2:**
- Headlines: "UK SMEs Race Ahead with AI Adoption – Are You Keeping Up?"
- Content: Nearly identical to Post #1 - AI adoption by UK SMEs
- Hashtags: #UKBusiness #AIInnovation #Productivity
- **Relevance to Financial Services/Leasing**: 0%

### Root Causes Identified

1. **Generic Search Queries**
   - Previous queries: "Financial Services UK", "Financial Services news UK"
   - Too broad - returns generic SME business news
   - No specific regulatory or industry terms

2. **Insufficient Negative Filtering**
   - Previous penalty: -5 for AI/tech keywords
   - AI adoption stories have high base scores (recency +5, audience match +5)
   - Net result: AI stories still score higher than relevant news

3. **No Positive Boosting**
   - No bonus for industry-specific terms (FCA, regulations, lending, asset finance)
   - Regulatory news scored the same as generic business news

4. **Query Strategy Flaws**
   - All industries treated equally with generic "{industry} UK" queries
   - Regulated industries need specific regulatory/compliance queries
   - Financial services needs FCA, lending rules, asset finance specific searches

---

## Solution Implemented

### 1. Industry-Specific Query Builder

Added `buildIndustrySpecificQueries()` function with targeted queries for each sector:

**Financial Services / Leasing / Lending:**
```typescript
- 'FCA regulations UK'
- 'UK lending rules'
- 'asset finance UK news'
- 'leasing industry UK'
- 'consumer credit UK'
- 'financial services regulation UK'
- 'UK banking compliance'
- 'financial conduct authority news'
```

**Healthcare / Medical:**
```typescript
- 'NHS news UK'
- 'healthcare regulation UK'
- 'MHRA updates'
- 'CQC inspection UK'
- 'medical device regulation UK'
- 'pharmaceutical industry UK'
```

**Legal Services:**
```typescript
- 'UK law changes'
- 'legal sector UK news'
- 'court ruling UK'
- 'legislation UK'
- 'Law Society news'
```

**Other Industries:** Construction, Manufacturing, Retail, Hospitality also covered

### 2. Strong Positive Keyword Boosting

Added +15 score boost for industry-specific terms:

**Financial Services Boost Keywords:**
- FCA, Financial Conduct Authority, regulation, compliance
- Lending, loan, credit, asset finance, leasing
- Fintech regulation, banking rules, consumer credit
- Prudential, capital requirements, financial services act
- Mortgage, interest rate, Bank of England, monetary policy

**Impact:** Regulatory news now scores 15-25 points higher than generic business news

### 3. Enhanced Negative Filtering

**Increased AI/tech penalty from -5 to -25** for non-tech industries:
- Artificial intelligence, AI adoption, AI tools, AI revolution
- Machine learning, ChatGPT, generative AI, AI-powered
- Automation software, tech startup, software development
- Digital transformation, AI integration, embracing AI

**Additional -15 penalty** for generic "SME adopts tech" stories:
- Detects patterns like "SME + adopt/embrace/integrate"
- Prevents generic adoption stories from ranking high

**Total Penalty:** Up to -40 for AI adoption stories in traditional industries

### 4. Query Priority System

New query order:
1. **Industry-specific queries FIRST** (FCA regulations, asset finance, etc.)
2. Generic industry queries (only if no specific queries available)
3. Keyword-based queries
4. Product/service queries
5. Regulation/compliance queries (for regulated industries)

---

## Technical Changes

### File Modified
`/home/ubuntu/social-echo/lib/news/enhanced-news-service.ts`

### Key Functions Updated

1. **`calculateRelevanceScore()`** (Lines 29-178)
   - Added positive keyword boosting (+15 for industry terms)
   - Increased negative penalty from -5 to -25
   - Added secondary penalty for generic SME adoption stories (-15)

2. **`buildIndustrySpecificQueries()`** (Lines 180-254) - NEW
   - Industry detection logic
   - Specific query generation for 8+ industry categories
   - Regulatory and compliance focus for regulated industries

3. **`buildSearchQueries()`** (Lines 259-312)
   - Prioritizes industry-specific queries
   - Adds regulation/compliance queries for regulated industries
   - Improved product/service term extraction

### Scoring Examples

**Before Fix:**
- AI adoption story: +5 (recency) +5 (audience) -5 (penalty) = **+5 score** ✅ Selected
- FCA regulation story: +10 (industry) +5 (recency) = **+15 score** ✅ Selected

**After Fix:**
- AI adoption story: +5 (recency) +5 (audience) -25 (AI penalty) -15 (SME adoption) = **-30 score** ❌ Filtered out
- FCA regulation story: +10 (industry) +15 (FCA boost) +5 (recency) = **+30 score** ✅ Selected

**Result:** FCA news now scores 60 points higher than AI adoption stories

---

## Expected Outcomes

### For Financial Services Users (Rob)
- News posts about FCA regulations, lending rules, asset finance
- No more AI adoption or tech transformation stories
- Industry-specific regulatory updates
- Compliance and banking news

### For Tech Companies
- No change - AI/tech news remains relevant
- No penalty applied (isTechCompany detection)
- Continues to receive AI innovation news

### For Other Industries
- Healthcare: NHS, MHRA, CQC news
- Legal: Court rulings, legislation changes
- Construction: Building regulations, property market
- Retail: Consumer spending, high street news

---

## Testing Plan

1. **Generate 5-10 news posts** for Rob's account
2. **Verify content relevance**: Should be about FCA, lending, asset finance, leasing
3. **Check for AI content**: Should be ZERO AI adoption stories
4. **Test other industries**: Ensure tech companies still get AI news
5. **Monitor logs**: Check query results and relevance scores

---

## Deployment Steps

1. ✅ Code updated in `enhanced-news-service.ts`
2. ⏳ Commit and push to GitHub
3. ⏳ Render auto-deploy
4. ⏳ Test with Rob's account
5. ⏳ Generate comprehensive test report

---

## Monitoring

### Server Logs to Check
```
[news-service] Search queries: [array of queries]
[news-service] Top headlines by relevance: [titles and scores]
[news-service] Result: { hasRelevantNews, relevantCount }
```

### Success Metrics
- **Relevance Rate**: >80% of news posts should be industry-specific
- **AI Content Rate**: <5% for non-tech industries (emergency fallback only)
- **User Feedback**: Reduction in "Needs Work" feedback on news posts
- **Engagement**: Higher "Good" feedback rate on news posts

---

## Rollback Plan

If issues occur:
1. Revert to previous version from Git history
2. Adjust minRelevanceScore threshold (currently 5)
3. Fine-tune penalty values (-25 can be adjusted to -15 or -20)
4. Add more industry-specific boost keywords

---

## Related Files

- `/home/ubuntu/social-echo/lib/news/enhanced-news-service.ts` - Main fix
- `/home/ubuntu/social-echo/test_results_rob_news_post_1.md` - Test evidence
- `/home/ubuntu/social-echo/test_results_rob_news_post_2.md` - Test evidence
- `/home/ubuntu/social-echo/NEWS_SERVICE_FIX_REPORT.md` - Previous fix attempt
- `/home/ubuntu/social-echo/lib/rss/custom-rss-service.ts` - RSS feeds (working correctly)

---

## Next Steps

1. Deploy to production
2. Test with Rob's account (generate 10 posts)
3. Verify no AI content appears
4. Check other test accounts (tech companies should still get AI news)
5. Monitor user feedback over next 24-48 hours
6. Document final results

---

## Notes

- RSS Feed Manager is working correctly (40% probability)
- This fix addresses the 60% Google News probability
- Combined with RSS feeds, Rob should get 100% relevant content
- Tech companies unaffected by this change
- All other industries benefit from specific query strategies
