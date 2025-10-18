# Admin Manual User Creation Feature

## Overview
Added the ability for admins to manually create users with trial subscriptions directly from the Admin → User Management page, without requiring Stripe integration.

## Feature Summary

### What Was Added

1. **"Create User" Button** - Primary blue button above the user table
2. **Create User Modal** - Full-featured form with all required fields
3. **Server Action** - Type-safe server-side user creation with validation
4. **Trial Duration Support** - Flexible trial periods in minutes, hours, or days
5. **Password Generator** - One-click secure password generation
6. **Optional Email** - Choose whether to send activation email
7. **Reset Link** - Automatic copy to clipboard on success

## Implementation Details

### Files Created

#### 1. `app/admin/users/actions.ts` (NEW)
Server actions for user creation with trial support.

**Key Functions**:
- `createUserWithTrial(input)` - Main creation function
- `generateSecurePassword()` - Secure random password generator

**Features**:
- ✅ Input validation with Zod schema
- ✅ Duplicate email detection
- ✅ Password hashing with bcrypt (same as signup)
- ✅ Transaction-safe User + Subscription creation
- ✅ Trial period calculation (minutes/hours/days → milliseconds)
- ✅ Usage limit mapping from plan-map.ts
- ✅ Optional activation email sending
- ✅ Reset link generation
- ✅ Comprehensive error handling

**Validation Rules**:
```typescript
const CreateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  plan: z.enum(['starter', 'pro']).default('pro'),
  trialAmount: z.number().min(0.001).max(365, 'Trial amount must be between 0.001 and 365'),
  trialUnit: z.enum(['minutes', 'hours', 'days']).default('days'),
  sendEmail: z.boolean().default(false),
})
```

**Trial Duration Conversion**:
```typescript
function trialToMilliseconds(amount: number, unit: 'minutes' | 'hours' | 'days'): number {
  switch (unit) {
    case 'minutes': return amount * 60_000
    case 'hours': return amount * 3_600_000
    case 'days': return amount * 86_400_000
  }
}
```

**Password Generation**:
- 16 characters long
- Includes uppercase, lowercase, numbers, and special characters
- Guarantees at least one of each character type
- Randomized order

### Files Modified

#### 2. `app/admin/users/page.tsx` (MODIFIED)
Added UI components for the create user feature.

**Changes**:
1. **Imports**: Added `createUserWithTrial` and `generateSecurePassword` actions
2. **State**: Added `showCreateModal`, `createForm`, and `creating` states
3. **Button**: Added "+ Create User" button above the table
4. **Modal**: Added complete create user form modal

**Form Fields**:
- **Name** (optional text input)
- **Email** (required email input with validation)
- **Password** (required text input with "Generate" button)
- **Plan** (radio buttons: Starter or Pro)
- **Trial Duration** (number input + unit selector)
- **Send Email** (checkbox, default off)

**Form Behavior**:
- Validates all inputs before submission
- Shows inline validation errors
- Disables submit while processing
- Copies reset link to clipboard on success
- Shows success/error messages
- Refreshes user list on success
- Resets form and closes modal on success

## Usage

### Creating a User

1. **Navigate** to Admin → User Management
2. **Click** the "+ Create User" button (blue, above the table)
3. **Fill in the form**:
   - Name (optional): User's display name
   - Email (required): User's email address
   - Password (required): At least 8 characters, or click "Generate"
   - Plan (required): Choose Starter (8 posts/month) or Pro (30 posts/month)
   - Trial Duration (required): Enter amount and select unit
   - Send Email (optional): Check to send activation email
4. **Click** "Create User"
5. **Success**: User created, reset link copied to clipboard, table refreshes

### Trial Duration Examples

| Input | Unit | Actual Duration |
|-------|------|-----------------|
| 5 | Minutes | 5 minutes |
| 0.5 | Hours | 30 minutes |
| 1 | Days | 24 hours |
| 7 | Days | 1 week |
| 0.001 | Days | ~1.44 minutes |

**Common Use Cases**:
- **Quick testing**: 5 Minutes
- **Demo accounts**: 1 Hour or 0.5 Days
- **Trial users**: 7 Days or 14 Days
- **Extended trials**: 30 Days

### Password Generation

**Manual Entry**:
- Type password directly (minimum 8 characters)
- Shows inline validation

**Auto-Generate**:
1. Click "Generate" button
2. Secure 16-character password is generated
3. Password appears in the field
4. Copy and share with user

**Generated Password Format**:
- Example: `aB3!xY9@mN2#pQ5$`
- 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Cryptographically random

### Email Behavior

**Checkbox Unchecked (Default)**:
- No email sent
- User created silently
- Admin shares reset link manually

**Checkbox Checked**:
- Activation email sent using existing email helper
- Uses EmailLog for idempotency (no duplicates)
- Standard onboarding email template

## Technical Details

### Database Records Created

#### User Record
```typescript
{
  email: string,
  name: string | null,
  passwordHash: string, // bcrypt hash
  role: 'USER',
  isSuspended: false,
  createdAt: Date,
}
```

#### Subscription Record
```typescript
{
  userId: string,
  plan: 'starter' | 'pro',
  status: 'active',
  usageCount: 0,
  usageLimit: 8 | 30, // from limitsFor(plan)
  currentPeriodStart: Date, // now (UTC)
  currentPeriodEnd: Date, // now + duration (UTC)
  stripeCustomerId: null, // no Stripe for manual trials
  stripeSubscriptionId: null,
}
```

### Security Features

1. **Password Hashing**:
   - Uses bcrypt with 10 rounds (same as signup)
   - Never stores plain text passwords
   - Secure against rainbow table attacks

2. **Input Validation**:
   - Zod schema validation on server
   - Type-safe inputs
   - SQL injection protection (Prisma)

3. **Duplicate Prevention**:
   - Checks for existing email before creation
   - Shows friendly error with link to existing user
   - No silent failures

4. **Transaction Safety**:
   - User + Subscription created atomically
   - Rollback on failure
   - No orphaned records

5. **Role Assignment**:
   - Always creates as 'USER' role
   - Admin must explicitly change roles elsewhere
   - Prevents privilege escalation

### Consistency with Existing Patterns

✅ **Password Hashing**: Uses bcrypt (same as `/api/auth/signup`)
✅ **Plan Limits**: Uses `limitsFor()` from `lib/billing/plan-map.ts`
✅ **Email Sending**: Uses `sendSecureBillingEmailSafe()` from `lib/billing/secure-email.ts`
✅ **Database Access**: Uses Prisma client from `lib/prisma.ts`
✅ **Validation**: Uses Zod schemas (same pattern as API routes)
✅ **Error Handling**: Comprehensive try/catch with user-friendly messages
✅ **UI Components**: Uses existing Button, Input, Checkbox, Dialog components

### No Impact on Existing Flows

✅ **Stripe Webhooks**: Not affected (stripeCustomerId is null)
✅ **Normal Signup**: Not affected (uses different route)
✅ **Marketing Pages**: Not affected (no changes to marketing layout)
✅ **App Headers**: Not affected (no changes to NavBar/Header)
✅ **Billing Portal**: Not affected (only shows for Stripe customers)

## Trial Expiry Behavior

### During Trial
- User has full access to their plan features
- Can create posts up to their usage limit
- Status: `active`
- Plan: `starter` or `pro`

### After Trial Expires
- **Manual Action Required**: Admin or user must upgrade
- **Expected Flow**:
  1. User tries to access app
  2. System detects expired trial (currentPeriodEnd < now)
  3. User prompted to upgrade via Stripe Checkout
  4. Stripe webhook sets them back to active with Stripe IDs

### Optional: End Trial Early
*Nice-to-have feature (not implemented yet)*:
- Add "End Trial Now" button on user row
- Sets `plan='none'`, `status='canceled'`
- No emails sent
- User must upgrade through normal flow

## Testing

### Test Scenario 1: Quick Test User
```
Name: Test User
Email: test@example.com
Password: [Generate]
Plan: Pro
Trial: 5 Minutes
Send Email: No
```

**Expected Result**:
- User created with Pro plan
- Status: active
- Usage: 0/30
- Period End: ~now + 5 minutes
- No Stripe records
- Reset link copied to clipboard

### Test Scenario 2: Demo Account
```
Name: Demo Account
Email: demo@example.com
Password: DemoPass123!
Plan: Starter
Trial: 1 Hour
Send Email: Yes
```

**Expected Result**:
- User created with Starter plan
- Status: active
- Usage: 0/8
- Period End: ~now + 1 hour
- Activation email sent
- Reset link copied to clipboard

### Test Scenario 3: Extended Trial
```
Name: John Doe
Email: john@example.com
Password: [Generate]
Plan: Pro
Trial: 14 Days
Send Email: Yes
```

**Expected Result**:
- User created with Pro plan
- Status: active
- Usage: 0/30
- Period End: ~now + 14 days
- Activation email sent
- Reset link copied to clipboard

### Test Scenario 4: Duplicate Email
```
Email: existing@example.com (already exists)
```

**Expected Result**:
- Error message: "A user with this email already exists"
- No user created
- No database changes
- Modal stays open for correction

### Verification Steps

1. **Check Database**:
   ```sql
   SELECT u.id, u.email, u.name, s.plan, s.status, s.usageCount, s.usageLimit, s.currentPeriodEnd
   FROM "User" u
   LEFT JOIN "Subscription" s ON s."userId" = u.id
   WHERE u.email = 'test@example.com';
   ```

2. **Check User Can Log In**:
   - Go to `/signin`
   - Enter email and password
   - Should log in successfully

3. **Check Trial Period**:
   - User detail shows correct period end date
   - Countdown shows remaining time (if implemented)

4. **Check Usage Limits**:
   - User can create posts
   - Usage count increments correctly
   - Stops at limit (8 for Starter, 30 for Pro)

5. **Check Email** (if sent):
   - Check EmailLog table for record
   - Check user's inbox for activation email
   - Verify no duplicates on replay

## Acceptance Criteria

✅ Admin can create a user with password and manual trial in minutes/hours/days
✅ Records saved with UTC period dates (currentPeriodStart, currentPeriodEnd)
✅ No emails sent unless checkbox is ticked
✅ No changes to non-admin flows (marketing, app headers unchanged)
✅ Type-safe, lint-clean, no console errors
✅ Duplicate email detection with friendly error
✅ Password hashing uses same method as signup
✅ Usage limits use centralized plan-map
✅ Reset link copied to clipboard on success
✅ Form validates inputs before submission
✅ Modal is mobile-friendly with large tap targets
✅ Success toast shows trial end date/time
✅ User list refreshes after creation

## Future Enhancements (Nice-to-Have)

### 1. End Trial Now Action
Add button on user row to immediately end trial:
```typescript
async function endTrial(userId: string) {
  await prisma.subscription.update({
    where: { userId },
    data: {
      plan: 'none',
      status: 'canceled',
      currentPeriodEnd: new Date(),
    }
  })
}
```

### 2. Trial Countdown Display
Show remaining time in user detail:
```typescript
function getTrialCountdown(periodEnd: Date): string {
  const now = new Date()
  const diff = periodEnd.getTime() - now.getTime()
  
  if (diff <= 0) return 'Expired'
  
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  
  return `${days}d ${hours}h ${minutes}m`
}
```

### 3. Bulk Trial Creation
Upload CSV to create multiple trial users at once:
```csv
name,email,plan,trialDays
John Doe,john@example.com,pro,7
Jane Smith,jane@example.com,starter,14
```

### 4. Trial Templates
Save common trial configurations:
- "5-Minute Test" (Pro, 5 minutes)
- "1-Hour Demo" (Pro, 1 hour)
- "7-Day Trial" (Pro, 7 days)
- "14-Day Trial" (Starter, 14 days)

### 5. Auto-Expiry Notifications
Send email X days before trial expires:
- 3 days before: "Your trial expires soon"
- 1 day before: "Last day of your trial"
- On expiry: "Your trial has ended"

## Deployment

**Status**: ✅ Ready to deploy

**Steps**:
1. Commit changes to Git
2. Push to GitHub main branch
3. Render auto-deploys (~3-5 minutes)
4. Test on production URL

**Rollback**: If issues occur, revert commits for:
- `app/admin/users/actions.ts` (new file)
- `app/admin/users/page.tsx` (modifications)

## References

- [Zod Validation](https://zod.dev/)
- [bcrypt Hashing](https://www.npmjs.com/package/bcrypt)
- [Prisma Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

**Last Updated**: October 18, 2025
**Version**: Admin Create User Feature v1.0
**Status**: ✅ Implemented and Ready for Deployment

