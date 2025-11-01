import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { MagicLinkOption } from '@/components/auth/MagicLinkOption';
import { SecurityBadge } from '@/components/auth/SecurityBadge';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getAuthErrorMessage, getReturnUrl } from '@/lib/auth-utils';
import { validatePasswordStrength } from '@/lib/password-strength';
import { 
  trackSignup, 
  trackLogin,
  trackEvent 
} from '@/lib/analytics';
import { announce } from '@/components/layout/LiveRegion';
import { Loader2, AlertCircle } from 'lucide-react';
import { NeutralConfetti } from '@/components/effects/NeutralConfetti';

type AuthMode = 'login' | 'signup' | 'reset-password';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
    setEmailError('');
    setPasswordError('');
    trackEvent(`auth_${newMode}_started`, {});
  };

  const handleForgotPassword = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
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
    setEmailError('');
    setPasswordError('');
    setError('');

    // Email validation
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }

    if (mode === 'signup') {
      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        setPasswordError('Password does not meet requirements');
        return false;
      }

      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
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
          setShowConfetti(true);
          trackSignup();
          announce('Account created successfully', 'polite');
          
          toast({
            title: 'Account created!',
            description: 'Welcome to $ave+. Redirecting to onboarding...',
          });

          // Redirect to onboarding
          setTimeout(() => {
            navigate('/onboarding');
          }, 1500);
        }
      } else {
        trackEvent('auth_login_started', { email });

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
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
      <NeutralConfetti show={showConfetti} />
      
      {/* Theme toggle */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Security badge */}
        <SecurityBadge />

        <AuthCard>
          <AuthHeader mode={mode === 'reset-password' ? 'login' : mode} />

          <AuthTabs mode={mode === 'reset-password' ? 'login' : mode} onModeChange={handleModeChange} />

          <form onSubmit={handleSubmit} className="space-y-4" id="auth-panel" role="tabpanel">
            <SocialAuth
              onError={setError}
              onSuccess={() => {
                const returnUrl = getReturnUrl();
                navigate(returnUrl);
              }}
            />

            <EmailInput
              value={email}
              onChange={setEmail}
              error={emailError}
            />

            <PasswordInput
              value={password}
              onChange={setPassword}
              error={passwordError}
              showStrengthMeter={mode === 'signup'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />

            {mode === 'signup' && (
              <>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  label="Confirm password"
                  id="confirm-password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                />

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
                    className="text-xs text-muted-foreground font-normal leading-relaxed cursor-pointer"
                  >
                    I agree to the Terms of Service and Privacy Policy
                  </Label>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2" role="alert">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </>
              ) : (
                mode === 'signup' ? 'Create account' : 'Sign in'
              )}
            </Button>

            {mode === 'login' && <MagicLinkOption email={email} />}
          </form>

          <AuthFooter mode={mode === 'reset-password' ? 'login' : mode} onForgotPassword={handleForgotPassword} />
        </AuthCard>
      </div>
    </div>
  );
}
