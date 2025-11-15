# Authentication System Documentation

## Overview

$ave+ implements a complete authentication system using Supabase Auth with the following features:

- ✅ Email/Password signup and login
- ✅ Password strength validation
- ✅ Password recovery flow
- ✅ Remember me functionality
- ✅ Session management with auto-cleanup
- ✅ Protected routes
- ✅ Onboarding flow integration
- ✅ Centralized auth state management
- ✅ Welcome back notifications

## Architecture

### Core Components

#### 1. AuthContext (`src/contexts/AuthContext.tsx`)
Centralized authentication state management using React Context.

**Features:**
- Global user and session state
- Automatic session refresh
- Auth state listeners
- Sign out functionality

**Usage:**
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, session, loading, signOut } = useAuth();
  
  if (loading) return <LoadingState />;
  if (!user) return <Login />;
  
  return <div>Welcome, {user.email}!</div>;
}
```

#### 2. Auth Page (`src/pages/Auth.tsx`)
Complete authentication UI with:
- Login tab
- Signup tab with full name field
- Password recovery
- Password update during recovery
- Email validation (zod)
- Password strength meter
- Remember me checkbox
- Proper error handling

#### 3. Protected Routes

**ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`)
- Blocks unauthenticated users
- Redirects to `/auth` with return URL
- Shows loading state during auth check

**AuthRedirect** (`src/components/auth/AuthRedirect.tsx`)
- Redirects authenticated users to dashboard
- Used on landing/public pages

**AuthGuard** (`src/components/auth/AuthGuard.tsx`)
- Flexible guard with options:
  - `requireAuth`: true/false
  - `redirectTo`: custom redirect path

#### 4. Session Management (`src/lib/session.ts`)

**Features:**
- Remember me persistence
- Session active tracking
- Auto-clear on browser close (if not remembered)
- Session initialization

**Functions:**
```typescript
setRememberMe(remember: boolean)      // Store preference
getRememberMe(): boolean               // Get preference
clearRememberMe()                      // Clear preference
markSessionActive()                    // Mark session as active
shouldClearSession(): Promise<boolean> // Check if should clear
initializeSessionManagement()          // Initialize on app start
```

### Database Schema

#### Profiles Table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Automatic Profile Creation
Trigger function creates profile on user signup:

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

#### RLS Policies
```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can insert own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);
```

## User Flows

### Signup Flow
```
1. User navigates to /auth
2. Clicks "Sign Up" tab
3. Enters full name, email, password
4. Password validated (zod + strength meter)
5. Supabase creates user + profile (via trigger)
6. Auto-redirects to /onboarding
7. User completes onboarding steps
8. Redirects to /dashboard
```

### Login Flow
```
1. User navigates to /auth
2. Enters email and password
3. Checks "Remember me" (optional)
4. Supabase validates credentials
5. Session stored in localStorage
6. If returnTo exists, redirect there
7. Otherwise redirect to /dashboard
```

### Password Recovery Flow
```
1. User clicks "Forgot Password?"
2. Enters email address
3. Supabase sends reset link
4. User clicks link in email
5. Redirected to /auth with recovery token
6. Shows password update form
7. User enters new password
8. Redirects to /dashboard
```

### Session Management Flow
```
On App Start:
1. initializeSessionManagement() runs
2. Checks if session should clear
3. If rememberMe = false AND browser was closed
   → Clear session and redirect to /auth
4. Otherwise, mark session as active

On Login:
1. Set rememberMe preference
2. Mark session as active
3. Session persists based on preference

On Browser Close:
- If rememberMe = true → Session persists
- If rememberMe = false → Session clears on next open
```

## Onboarding Integration

### Hook: useOnboardingStatus
```typescript
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';

function ProtectedPage() {
  // Auto-redirects to onboarding if not completed
  const { completed, currentStep, loading } = useOnboardingStatus(true);
  
  if (!completed) return null; // Will redirect
  
  return <PageContent />;
}
```

### Dashboard Integration
Dashboard automatically:
1. Checks onboarding status on load
2. Redirects incomplete users to /onboarding
3. Shows welcome back banner on first visit each day

## UI Components

### WelcomeBackBanner
Shows personalized welcome message:
- Displays once per day
- Uses user's first name
- Auto-dismisses after 5 seconds
- Can be manually closed

### PasswordStrengthMeter
Real-time password strength indicator:
- Weak (red)
- Medium (yellow)
- Strong (green)
- Shows requirements checklist

## Configuration

### Auth Settings
Current configuration (via Lovable Cloud):
```typescript
{
  auto_confirm_email: true,      // For development/testing
  disable_signup: false,         // Allow new signups
  external_anonymous_users_enabled: false
}
```

### Supabase Client
Configured in `src/integrations/supabase/client.ts`:
```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

## Security Best Practices

✅ **Implemented:**
- Row Level Security (RLS) on profiles table
- Security definer functions for auth checks
- Input validation using zod schemas
- Password strength requirements
- No PII logging
- Proper error handling without leaking info

⚠️ **To Review:**
- Enable leaked password protection (currently disabled)
- Add rate limiting on auth endpoints
- Consider 2FA for sensitive accounts
- Add audit logging for auth events

## Testing

### Manual Testing Checklist
- [ ] Signup with new email
- [ ] Login with existing credentials
- [ ] Password recovery flow
- [ ] Remember me persistence
- [ ] Session clears on browser close (without remember me)
- [ ] Protected routes redirect to auth
- [ ] Auth pages redirect to dashboard when logged in
- [ ] Onboarding triggers after signup
- [ ] Welcome back banner shows next day
- [ ] Sign out clears session

### Test Users
Create test users via Supabase dashboard or signup flow.

## Troubleshooting

### User Can't Log In
1. Check Supabase auth logs
2. Verify email is confirmed (or auto-confirm enabled)
3. Check RLS policies aren't blocking
4. Verify credentials are correct

### Session Not Persisting
1. Check remember me is enabled
2. Verify localStorage is working
3. Check browser privacy settings
4. Look for token refresh errors

### Onboarding Loops
1. Check `onboarding_completed` in profiles table
2. Verify onboarding completion handler updates DB
3. Check for race conditions in status check

### Profile Not Created
1. Check handle_new_user trigger exists
2. Verify trigger fires on user creation
3. Check database logs for errors
4. Ensure RLS allows INSERT

## Future Enhancements

### Planned Features
- [ ] Social login (Google, GitHub)
- [ ] Magic link authentication
- [ ] Two-factor authentication (2FA)
- [ ] Biometric authentication (WebAuthn)
- [ ] Session device management
- [ ] Login history and security logs
- [ ] Account lockout after failed attempts
- [ ] Email verification requirement toggle

### Performance Optimizations
- [ ] Lazy load auth components
- [ ] Optimize auth state updates
- [ ] Cache user profile data
- [ ] Reduce auth check frequency

## API Reference

### useAuth Hook
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const { user, session, loading, signOut } = useAuth();
```

### Session Functions
```typescript
// Store remember me preference
setRememberMe(remember: boolean): void

// Get remember me preference
getRememberMe(): boolean

// Clear remember me and session data
clearRememberMe(): void

// Mark current session as active
markSessionActive(): void

// Check if session should be cleared
shouldClearSession(): Promise<boolean>

// Initialize session management on app start
initializeSessionManagement(): Promise<void>

// Sign out user
signOut(): Promise<void>
```

### User Functions
```typescript
// Get current user (client-side)
getClientUser(): Promise<ClientUser | null>

// Check if user is authenticated
isAuthenticated(): Promise<boolean>
```

## Support

For authentication issues:
1. Check console logs for errors
2. Review Supabase auth logs
3. Verify database schema and policies
4. Check this documentation
5. Contact support team

---

**Last Updated:** 2025-11-15
**Version:** 1.0.0
