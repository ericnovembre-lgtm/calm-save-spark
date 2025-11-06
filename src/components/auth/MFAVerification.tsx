import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import { Loader2, Shield, AlertCircle } from 'lucide-react';

interface MFAVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function MFAVerification({ onSuccess, onCancel }: MFAVerificationProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');

      // Get the list of factors
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.find(f => f.status === 'verified');

      if (!totpFactor) {
        throw new Error('No verified 2FA method found');
      }

      // Challenge the factor
      const challenge = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challenge.error) throw challenge.error;

      // Verify the challenge with the code
      const verify = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.data.id,
        code: code,
      });

      if (verify.error) throw verify.error;

      toast({
        title: 'Verification successful',
        description: 'Welcome back to $ave+',
      });

      trackEvent('2fa_login_success', {});
      onSuccess();
    } catch (error: any) {
      console.error('MFA verification error:', error);
      setError(error.message || 'Invalid verification code. Please try again.');
      
      trackEvent('2fa_login_failed', { 
        error: error.message 
      });
      
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid code',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Two-Factor Authentication</h2>
        <p className="text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code">Verification Code</Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
            autoComplete="one-time-code"
            autoFocus
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isVerifying || code.length !== 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </div>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        Having trouble? Contact support for assistance.
      </p>
    </div>
  );
}
