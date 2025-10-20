# Hidden Admin URL Implementation

## Overview

This implementation adds a hidden admin URL (`/admin73636`) with MASTER_ADMIN-only access control and role-based post-login redirects.

## Features Implemented

### 1. Hidden Admin URL (`/admin73636`)
- Acts as an alias to `/admin` routes
- Accessible at: `https://socialecho.ai/admin73636`
- All sub-routes work: `/admin73636/ai-config`, etc.

### 2. URL Rewrites (next.config.js)
```javascript
async rewrites() {
  return [
    { source: '/admin73636', destination: '/admin' },
    { source: '/admin73636/signin', destination: '/admin/signin' },
    { source: '/admin73636/:path*', destination: '/admin/:path*' },
  ];
}
```

### 3. Route Protection Middleware (middleware.ts)
- Protects both `/admin` and `/admin73636` routes
- Checks authentication via NextAuth JWT
- Verifies MASTER_ADMIN role
- Redirects unauthenticated users to `/admin/signin`
- Returns 403 for non-MASTER_ADMIN users

### 4. Separate Admin Sign-In Page
- Located at: `/admin/signin` (also accessible via `/admin73636/signin`)
- Dark themed admin-style login
- Supports 2FA authentication
- Role-based redirect after login

### 5. Role-Based Redirects
- MASTER_ADMIN → `/admin` (after signing in at `/admin/signin`)
- Regular USER → `/dashboard` (after signing in at `/signin`)

## Files Created/Modified

### Created:
1. `middleware.ts` - Route protection middleware
2. `app/admin/signin/page.tsx` - Admin sign-in page
3. `app/admin/layout.tsx` - Admin layout with header/footer

### Modified:
1. `next.config.js` - Added URL rewrites
2. `lib/auth.ts` - Added redirect callback

## Testing Guide

### Test 1: Hidden URL Access (Unauthenticated)
```
1. Visit: https://socialecho.ai/admin73636
2. Expected: Redirect to /admin/signin
```

### Test 2: Admin Sign-In
```
1. Visit: https://socialecho.ai/admin/signin
2. Enter MASTER_ADMIN credentials
3. Expected: Redirect to /admin dashboard
```

### Test 3: Hidden Sign-In URL
```
1. Visit: https://socialecho.ai/admin73636/signin
2. Enter MASTER_ADMIN credentials
3. Expected: Redirect to /admin dashboard
```

### Test 4: Non-Admin Access
```
1. Sign in as regular USER at /signin
2. Try to visit: https://socialecho.ai/admin
3. Expected: 403 Forbidden error
```

### Test 5: Direct Admin URL
```
1. Visit: https://socialecho.ai/admin
2. Expected: Redirect to /admin/signin if not logged in
3. After login as MASTER_ADMIN: Show admin dashboard
```

### Test 6: Admin Sub-Routes
```
1. Visit: https://socialecho.ai/admin73636/ai-config
2. Expected: Redirect to /admin/signin if not logged in
3. After login as MASTER_ADMIN: Show AI config page
```

## Security Features

✅ **Authentication Required** - All admin routes require valid session  
✅ **Role Verification** - Only MASTER_ADMIN role can access  
✅ **JWT Token Validation** - Middleware checks JWT tokens  
✅ **2FA Support** - Admin sign-in supports 2FA codes  
✅ **Secure Redirects** - Proper callback URL handling  
✅ **403 Forbidden** - Non-admins get clear error message  

## Access Patterns

### For MASTER_ADMIN:
```
/admin73636 → /admin (via rewrite) → ✅ Access granted
/admin73636/signin → /admin/signin (via rewrite) → ✅ Sign-in page
/admin → ✅ Access granted
/admin/signin → ✅ Sign-in page
/admin/ai-config → ✅ Access granted
```

### For Regular USER:
```
/admin73636 → /admin (via rewrite) → ❌ 403 Forbidden
/admin → ❌ 403 Forbidden
/dashboard → ✅ Access granted
/signin → ✅ Sign-in page
```

### For Unauthenticated:
```
/admin73636 → Redirect to /admin/signin
/admin → Redirect to /admin/signin
/admin/signin → ✅ Sign-in page
/signin → ✅ Sign-in page
```

## Environment Variables Required

Ensure these are set in Render:

```bash
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="https://socialecho.ai"
DATABASE_URL="your-postgres-url"
OPENAI_API_KEY="your-openai-key"
```

## Deployment Steps

1. **Commit changes**:
```bash
git add .
git commit -m "feat: Add hidden admin URL with MASTER_ADMIN-only access"
git push origin main
```

2. **Render auto-deploys** (if enabled)

3. **Test all access patterns** using the testing guide above

## Troubleshooting

### Issue: Middleware not working
**Cause**: `middleware.ts` not in root directory  
**Fix**: Ensure file is at `/middleware.ts` (same level as `app/`)

### Issue: 403 for MASTER_ADMIN
**Cause**: Stale session with old role  
**Fix**: Sign out, clear cookies, sign in again

### Issue: Rewrites not working
**Cause**: Next.js cache  
**Fix**: Restart dev server or clear `.next` folder

### Issue: Redirect loop
**Cause**: Middleware redirecting signin page  
**Fix**: Ensure signin pages are excluded in middleware

## URLs Summary

| URL | Access | Redirect |
|-----|--------|----------|
| `/admin73636` | MASTER_ADMIN only | → `/admin/signin` if not logged in |
| `/admin73636/signin` | Anyone | Sign-in page |
| `/admin73636/ai-config` | MASTER_ADMIN only | → `/admin/signin` if not logged in |
| `/admin` | MASTER_ADMIN only | → `/admin/signin` if not logged in |
| `/admin/signin` | Anyone | Sign-in page |
| `/signin` | Anyone | Regular user sign-in |
| `/dashboard` | Authenticated users | Regular dashboard |

## Success Criteria

✅ `/admin73636` is only accessible to MASTER_ADMIN  
✅ Regular users cannot access `/admin` or `/admin73636`  
✅ MASTER_ADMIN signs in via `/admin/signin` or `/admin73636/signin`  
✅ After admin sign-in, redirects to `/admin` dashboard  
✅ After regular sign-in, redirects to `/dashboard`  
✅ Middleware protects all admin routes  
✅ 403 error shown to non-admins  
✅ 2FA authentication works  

## Notes

- The hidden URL `/admin73636` is security through obscurity - keep it private
- Both `/admin` and `/admin73636` have identical protection
- Middleware runs on every request to admin routes
- JWT tokens include role information for verification
- Admin layout provides consistent styling across all admin pages
