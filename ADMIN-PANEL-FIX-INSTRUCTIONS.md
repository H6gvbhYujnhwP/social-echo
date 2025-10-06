# Admin Panel Fix Instructions - User Management Error

**Issue:** Admin user management page shows error: `The column 'User.agencyId' does not exist in the current database`

**Cause:** The production database is missing the `agencyId` column that was added to the Prisma schema but the migration was never applied to production.

**Impact:** Admin panel `/admin/users` page is completely broken and cannot display users.

**Severity:** 🔴 **HIGH** - Admin functionality is broken

---

## 🚨 Immediate Fix (5 minutes)

### Option 1: Run SQL Script Directly (Fastest)

1. **Access your production database:**
   - If using Render: Go to your database dashboard
   - If using Supabase: Go to SQL Editor
   - If using direct PostgreSQL: Use `psql` or pgAdmin

2. **Run the emergency fix SQL:**
   ```sql
   -- Copy and paste the contents of EMERGENCY-DATABASE-FIX.sql
   -- Or run it directly if you have file access:
   psql $DATABASE_URL -f EMERGENCY-DATABASE-FIX.sql
   ```

3. **Verify the fix:**
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns 
   WHERE table_name = 'User' 
   AND column_name = 'agencyId';
   ```

   **Expected output:**
   ```
   column_name | data_type | is_nullable
   agencyId    | text      | YES
   ```

4. **Refresh the admin panel:**
   - Go back to https://www.socialecho.ai/admin/users
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - The user list should now load correctly

---

### Option 2: Use Prisma Migrate (Recommended for Long-term)

If you have SSH access to your production server or can run commands via your hosting provider:

1. **Deploy the migration:**
   ```bash
   cd /path/to/social-echo
   npx prisma migrate deploy
   ```

2. **Verify:**
   ```bash
   npx prisma db pull
   ```

3. **Restart your application:**
   ```bash
   # On Render: Trigger manual deploy
   # On Vercel: Redeploy
   # On custom server: restart Node process
   ```

---

## 🔍 What This Fix Does

The SQL script will:

1. ✅ Add `agencyId` column to the `User` table (nullable TEXT field)
2. ✅ Create an index on `agencyId` for query performance
3. ✅ Add foreign key constraint to `Agency` table (if it exists)
4. ✅ Handle cases where changes already exist (idempotent)

**Safe to run multiple times** - The script checks if changes already exist before applying them.

---

## 📊 Technical Details

### Schema Change

**Before:**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String
  role          UserRole  @default(USER)
  // ... other fields
}
```

**After:**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String
  role          UserRole  @default(USER)
  
  // Agency relationships
  agencyId      String?   // NEW FIELD
  agency        Agency?   @relation("AgencyCustomers", fields: [agencyId], references: [id])
  
  // ... other fields
  
  @@index([agencyId])  // NEW INDEX
}
```

### Why This Happened

The `agencyId` field was added to the Prisma schema during Phase 3 development, but the migration was never applied to the production database. The code was deployed expecting this column to exist, but it doesn't, causing the admin panel to fail.

---

## 🧪 Testing After Fix

After applying the fix, test the following:

### 1. Admin User Management Page
- [ ] Navigate to `/admin/users`
- [ ] Page loads without errors
- [ ] User list displays correctly
- [ ] Search functionality works
- [ ] Export CSV works

### 2. User Creation
- [ ] Create a new test user
- [ ] Verify `agencyId` is null for regular users
- [ ] No errors in console

### 3. Agency Relationships (if applicable)
- [ ] Agency admins can see their customers
- [ ] Customer users have correct `agencyId` set
- [ ] Agency dashboard works correctly

---

## 🚨 If Fix Doesn't Work

### Check 1: Verify Database Connection

```sql
SELECT current_database();
```

Make sure you're connected to the correct production database.

### Check 2: Check for Other Missing Columns

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'User';
```

Compare this list with the Prisma schema to see if other columns are missing.

### Check 3: Check Application Logs

Look for other Prisma errors that might indicate more missing migrations:
- Check Render/Vercel logs
- Look for `P2010` or `P2021` error codes
- Check for other "column does not exist" errors

### Check 4: Full Migration Reset (Last Resort)

⚠️ **WARNING: This will reset your database. Backup first!**

```bash
# Backup database first!
pg_dump $DATABASE_URL > backup.sql

# Reset migrations
npx prisma migrate reset --force

# Restore data if needed
psql $DATABASE_URL < backup.sql
```

---

## 📞 Support

If the fix doesn't work or you encounter other issues:

1. **Check the error logs:**
   - Browser console (F12)
   - Server logs (Render/Vercel dashboard)
   - Database logs

2. **Verify database state:**
   ```sql
   \d "User"  -- Shows table structure
   ```

3. **Check Prisma client:**
   ```bash
   npx prisma generate
   ```

---

## 🔄 Prevention for Future

To prevent this from happening again:

### 1. Always Run Migrations on Deploy

Add to your deployment script:
```bash
# In package.json or deploy script
"deploy": "prisma migrate deploy && npm run build"
```

### 2. Use CI/CD Checks

Add migration check to CI:
```bash
# Check for pending migrations
npx prisma migrate status
```

### 3. Document Schema Changes

Always document schema changes in:
- Migration files
- Deployment guides
- Release notes

---

## ✅ Success Criteria

After applying the fix, you should see:

- ✅ Admin user management page loads without errors
- ✅ User list displays correctly
- ✅ No "column does not exist" errors in console
- ✅ All admin functions work normally
- ✅ Database has `agencyId` column on `User` table

---

**Fix Created:** October 6, 2025  
**Priority:** 🔴 HIGH  
**Estimated Fix Time:** 5 minutes  
**Risk Level:** 🟢 LOW (Safe, idempotent SQL)  

**Files Included:**
- `EMERGENCY-DATABASE-FIX.sql` - SQL script to run
- `ADMIN-PANEL-FIX-INSTRUCTIONS.md` - This file
