# Post Type Canonicalization Audit Checklist

## Critical Issues (Build Breaks)

### lib/localstore.ts
- **Line 251-253**: `byPostType` uses legacy keys `informational` and `advice` in Record<PostType, ...>
- **Type**: PostType is defined as canonical only (line 50), but feedback stats use legacy keys
- **Fix**: Replace with canonical keys or normalize at boundary

## Files Using Legacy Post Types

### Type Definitions (Need to stay as-is for backward compat in some cases)
- ✅ `lib/post-type-mapping.ts` - Correctly handles legacy types (normalization module)
- ❌ `lib/ai/ai-config.ts:9` - PostType still includes legacy types
- ❌ `lib/contract.ts:19,39` - Zod schemas include legacy types

### API Routes
- ⚠️ `app/api/planner/route.ts:13` - Accepts both legacy and canonical (OK for boundary)
- ❌ `app/api/generate-text/route.backup.ts` - Backup file, may need cleanup

### UI Components
- ⚠️ `app/admin/ai-config/page.tsx:275` - Admin page uses legacy types (may be intentional)
- ⚠️ `app/planner/page.tsx:33` - Has legacy color mapping (unused?)

### AI Services
- ❌ `lib/ai/ai-service.ts:273` - Uses 'informational' in condition
- ❌ `lib/ai/ai-service.ts:268` - Uses 'advice' in condition
- ❌ `lib/ai/image-service.ts:146,153` - Uses legacy types in conditions

### Database Seeds
- ⚠️ `prisma/seed.ts:53-59` - Uses legacy types (OK for seeding old data)
- ⚠️ `prisma/seed-admin.ts:19` - Uses legacy types
- ⚠️ `scripts/seed-demo.ts:85` - Uses legacy types

## Canonical Post Types (v8.8)
- `selling`
- `information_advice`
- `random`
- `news`

## Legacy Post Types (to be normalized at boundary)
- `informational` → `information_advice`
- `advice` → `information_advice`

## Action Plan

1. **Fix lib/localstore.ts** (CRITICAL - breaks build)
   - Update feedback stats to use canonical keys
   - Normalize legacy types when reading from history

2. **Update lib/ai/ai-config.ts**
   - Change PostType to canonical only
   - Keep backward compat in schemas if needed

3. **Update lib/contract.ts**
   - Keep legacy types in Zod schemas (boundary normalization)
   - Add normalization in API handlers

4. **Update lib/ai/ai-service.ts**
   - Replace legacy type checks with normalized types
   - Use normalizePostType() before logic

5. **Update lib/ai/image-service.ts**
   - Replace legacy type checks with normalized types

6. **Verify all components use mapping functions**
   - Planner, TodayPanel, HistoryDrawer, FineTunePanel
   - All should import from lib/post-type-mapping.ts

7. **Add CI guard**
   - Prevent raw legacy strings outside mapping module

