# Setting Up Admin Users

## Quick Setup

To grant admin access to users in your $ave+ application:

### Option 1: Using Supabase SQL Editor (Recommended)

1. Navigate to your backend dashboard (click Cloud → SQL Editor in Lovable)
2. Run this SQL query to grant admin role to a user:

```sql
-- Replace 'user@example.com' with the actual user email
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### Option 2: Bulk Admin Creation

To grant admin access to multiple users at once:

```sql
-- Grant admin role to multiple users
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
)
ON CONFLICT (user_id, role) DO NOTHING;
```

## Verification

To verify admin users have been set up correctly:

```sql
-- List all admin users
SELECT 
  ur.user_id,
  au.email,
  ur.role,
  ur.created_at
FROM user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;
```

## Testing Admin Access

1. **Login as Admin User**: Sign in with an account that has admin role
2. **Access Admin Monitoring**: Navigate to `/admin-monitoring`
3. **Verify Dashboard**: You should see:
   - System health metrics
   - Active breaches (if any)
   - Notification center
   - Recent performance metrics

## Troubleshooting

### "Access Denied" or Redirect to Dashboard

**Problem**: User cannot access `/admin-monitoring` even after being granted admin role.

**Solution**:
1. Ensure the user_roles table exists (it should, as it was created with the migration)
2. Verify the user is in the user_roles table with role='admin'
3. Have the user log out and log back in to refresh their session
4. Check browser console for any errors

### No Notifications Showing

**Problem**: Notification center is empty.

**Solution**:
1. Wait for Aegis to run (every 5 minutes)
2. Or manually trigger Aegis:
   ```bash
   curl -X POST https://gmnpjgelzsmcidwrwbcg.supabase.co/functions/v1/aegis-monitor \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```
3. Check that Web Vitals are being collected in the analytics_events table

### Email Alerts Not Sending

**Problem**: Admin is not receiving email alerts.

**Solution**:
1. Verify RESEND_API_KEY is configured in secrets
2. Check that admin user has a valid email in the profiles table
3. Verify domain is set up in Resend dashboard
4. Check edge function logs for send-hephaestus-alert

## Admin Roles Table Structure

The `user_roles` table has the following structure:

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL, -- enum: 'admin', 'moderator', 'user'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);
```

## Security Notes

✅ **Proper Implementation**:
- Roles are stored server-side in the database
- RLS policies enforce admin-only access
- SECURITY DEFINER functions prevent privilege escalation

❌ **Never Do**:
- Store admin status in localStorage or sessionStorage
- Check admin status client-side only
- Hardcode admin credentials

## Additional Admin Features

Once you have admin access, you can also access:
- `/admin` - General admin dashboard
- `/security-monitoring` - Security monitoring dashboard
- `/admin-monitoring` - Multi-agent system monitoring (new!)

## Next Steps

1. Grant admin role to your primary user account
2. Log out and log back in
3. Navigate to `/admin-monitoring`
4. Explore the multi-agent system features
5. Check documentation in `MULTI_AGENT_SYSTEM.md`
