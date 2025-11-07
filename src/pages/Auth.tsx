import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTabs } from '@/components/auth/AuthTabs';
import { SocialAuth } from '@/components/auth/SocialAuth';
import { EmailInput } from '@/components/auth/EmailInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { SecurityBadge } from '@/components/auth/SecurityBadge';
import { Input } from '@/components/ui/input';
import { SignupProgress } from '@/components/auth/SignupProgress';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getAuthErrorMessage, getReturnUrl } from '@/lib/auth-utils';
import { validatePasswordStrength } from '@/lib/password-strength';
import { setRememberMe, markSessionActive } from '@/lib/session';
import { trackSignup, trackLogin, trackEvent } from '@/lib/analytics';
import { announce } from '@/components/layout/LiveRegion';
import { Loader2, AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [rememberMe, setRememberMeState] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs for focus management
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const returnUrl = getReturnUrl();
        navigate(returnUrl);
      }
    };
    checkAuth();
  }, [navigate]);

  // Track page view
  useEffect(() => {
    trackEvent('auth_page_viewed', { mode });
  }, [mode]);

  const handleModeChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
    setAgreeToTerms(false);
    trackEvent(`auth_${newMode}_started`, {});
  };

  const handleForgotPassword = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      emailInputRef.current?.focus();
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: 'Reset link sent',
        description: 'Check your email for password reset instructions',
      });

      trackEvent('auth_password_reset_email_sent', { email });
      announce('Password reset email sent', 'polite');
    } catch (error: any) {
      const message = getAuthErrorMessage(error);
      setError(message);
      toast({
        title: 'Failed to send reset link',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    setError('');

    // Email validation
    if (!email) {
      setError('Email is required');
      emailInputRef.current?.focus();
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      setError('Please enter a valid email address');
      emailInputRef.current?.focus();
      return false;
    }

    // Password validation
    if (!password) {
      setError('Password is required');
      passwordInputRef.current?.focus();
      return false;
    }

    if (mode === 'signup') {
      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        setError('Password does not meet requirements');
        passwordInputRef.current?.focus();
        return false;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        confirmPasswordInputRef.current?.focus();
        return false;
      }

      if (!agreeToTerms) {
        setError('You must agree to the terms and conditions');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError('');

      if (mode === 'signup') {
        trackEvent('auth_signup_started', { email });

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });

        if (error) throw error;

        if (data.user) {
          trackSignup();
          announce('Account created successfully', 'polite');

          toast({
            title: 'Account created!',
            description: 'Welcome to $ave+. Redirecting to onboarding...',
          });

          setTimeout(() => {
            navigate('/onboarding');
          }, 1000);
        }
      } else {
        trackEvent('auth_login_started', { email });

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setRememberMe(rememberMe);
          markSessionActive();

          trackLogin();
          announce('Logged in successfully', 'polite');

          const returnUrl = getReturnUrl();
          navigate(returnUrl);
        }
      }
    } catch (error: any) {
      const message = getAuthErrorMessage(error);
      setError(message);

      trackEvent(`auth_${mode}_failed`, {
        email,
        error_code: error.code || 'unknown',
      });

      toast({
        title: mode === 'signup' ? 'Signup failed' : 'Login failed',
        description: message,
        variant: 'destructive',
      });

      announce(`Authentication failed: ${message}`, 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Security badge */}
        <SecurityBadge />

        <AuthCard>
          <AuthHeader mode={mode} />

          <AuthTabs mode={mode} onModeChange={handleModeChange} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <SocialAuth
              onError={setError}
              onSuccess={() => {
                const returnUrl = getReturnUrl();
                navigate(returnUrl);
              }}
            />

            {/* Signup progress indicator */}
            {mode === 'signup' && (
              <SignupProgress
                email={email}
                password={password}
                confirmPassword={confirmPassword}
                agreeToTerms={agreeToTerms}
              />
            )}

            <EmailInput
              ref={emailInputRef}
              value={email}
              onChange={setEmail}
              autoFocus={true}
            />

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                ref={passwordInputRef}
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  const v = e.target.value;
                  setPassword(v);
                  if (import.meta.env.DEV) console.log('[auth] password length:', v.length);
                }}
                placeholder="••••••••"
                className="relative z-10 pointer-events-auto"
                aria-invalid={!!error}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                spellCheck={false}
                autoCapitalize="none"
              />
            </div>

            {/* Remember me checkbox - login only */}
            {mode === 'login' && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMeState(checked === true)}
                />
                <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
            )}

            {/* Confirm password - signup only */}
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm password</Label>
                  <Input
                    ref={confirmPasswordInputRef}
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="relative z-10 pointer-events-auto"
                    autoComplete="new-password"
                    spellCheck={false}
                    autoCapitalize="none"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    aria-describedby="terms-description"
                  />
                  <Label
                    htmlFor="terms"
                    id="terms-description"
                    className="text-xs font-normal leading-relaxed cursor-pointer"
                  >
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </>
            )}

            {/* Error display */}
            {error && (
              <div
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </>
              ) : mode === 'signup' ? (
                'Create account'
              ) : (
                'Sign in'
              )}
            </Button>

            {/* Forgot password - login only */}
            {mode === 'login' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            {mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                New to $ave+?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('signup')}
                  className="text-primary hover:underline"
                >
                  Create account
                </button>
              </p>
            )}
          </div>
        </AuthCard>
      </div>
    </div>
  );
}
