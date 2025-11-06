import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, Loader2, Shield } from 'lucide-react';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  authenticateBiometric,
} from '@/lib/webauthn';
import { announce } from '@/components/layout/LiveRegion';
import { trackEvent } from '@/lib/analytics';
import { markSessionActive, setRememberMe } from '@/lib/session';

interface BiometricAuthProps {
  email: string;
  onSuccess: () => void;
}

export function BiometricAuth({ email, onSuccess }: BiometricAuthProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAvailability = async () => {
      const supported = isWebAuthnSupported();
      const available = await isPlatformAuthenticatorAvailable();
      setIsAvailable(supported && available);
    };
    checkAvailability();
  }, []);

  const handleBiometricAuth = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      trackEvent('biometric_auth_started', { email });

      const redirectUrl = await authenticateBiometric(email);
      
      // Mark session as active and set remember me
      setRememberMe(true);
      markSessionActive();

      trackEvent('biometric_auth_success', { email });
      announce('Authenticated successfully with biometric', 'polite');
      
      toast({
        title: 'Success!',
        description: 'You have been signed in with biometric authentication',
      });

      // Navigate to the redirect URL (magiclink)
      window.location.href = redirectUrl;
      onSuccess();
    } catch (error: any) {
      console.error('Biometric auth error:', error);
      trackEvent('biometric_auth_failed', { email, error: error.message });
      
      let message = 'Failed to authenticate with biometric';
      
      if (error.message?.includes('No biometric credentials found')) {
        message = 'No biometric credentials found. Please sign in with password and enable biometric authentication in settings.';
      } else if (error.message?.includes('User not found')) {
        message = 'No account found with this email address.';
      } else if (error.message?.includes('cancelled')) {
        message = 'Biometric authentication was cancelled';
      }

      toast({
        title: 'Authentication failed',
        description: message,
        variant: 'destructive',
      });
      announce(`Authentication failed: ${message}`, 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or use biometric
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleBiometricAuth}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Authenticating...
          </>
        ) : (
          <>
            <Fingerprint className="mr-2 h-4 w-4" aria-hidden="true" />
            Sign in with Face ID / Touch ID
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
        <Shield className="h-3 w-3" aria-hidden="true" />
        Biometric data stays on your device
      </p>
    </div>
  );
}