import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import { Loader2, Shield, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function TwoFactorAuth() {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [enrollmentError, setEnrollmentError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      // Check if user has any TOTP factors enrolled and verified
      const hasVerifiedFactor = data?.totp?.some(factor => factor.status === 'verified');
      setIsEnrolled(hasVerifiedFactor || false);
    } catch (error) {
      console.error('Error checking MFA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true);
      setEnrollmentError('');

      // Enroll a new TOTP factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setShowEnrollDialog(true);
        
        trackEvent('2fa_enrollment_started', {});
      }
    } catch (error: any) {
      console.error('Error enrolling in MFA:', error);
      toast({
        title: 'Enrollment failed',
        description: error.message || 'Failed to start 2FA enrollment',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setEnrollmentError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsEnrolling(true);
      setEnrollmentError('');

      // Get the most recent factor (the one we just enrolled)
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const latestFactor = factors?.totp?.[factors.totp.length - 1];
      
      if (!latestFactor) {
        throw new Error('No factor found');
      }

      // Verify the factor with the challenge
      const challenge = await supabase.auth.mfa.challenge({
        factorId: latestFactor.id,
      });

      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: latestFactor.id,
        challengeId: challenge.data.id,
        code: verificationCode,
      });

      if (verify.error) throw verify.error;

      setShowEnrollDialog(false);
      setIsEnrolled(true);
      setVerificationCode('');
      
      toast({
        title: '2FA enabled',
        description: 'Two-factor authentication has been successfully enabled',
      });

      trackEvent('2fa_enabled', {});
    } catch (error: any) {
      console.error('Error verifying MFA:', error);
      setEnrollmentError(error.message || 'Invalid verification code. Please try again.');
      
      trackEvent('2fa_verification_failed', { 
        error: error.message 
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDisable = async () => {
    try {
      setIsDisabling(true);

      // Get all factors and unenroll them
      const { data: factors } = await supabase.auth.mfa.listFactors();
      
      if (factors?.totp) {
        for (const factor of factors.totp) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      setIsEnrolled(false);
      
      toast({
        title: '2FA disabled',
        description: 'Two-factor authentication has been disabled',
      });

      trackEvent('2fa_disabled', {});
    } catch (error: any) {
      console.error('Error disabling MFA:', error);
      toast({
        title: 'Failed to disable 2FA',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDisabling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
              {isEnrolled && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account by requiring a verification code from your authenticator app
            </p>
          </div>
          <Button
            onClick={isEnrolled ? handleDisable : handleEnroll}
            variant={isEnrolled ? 'outline' : 'default'}
            disabled={isEnrolling || isDisabling}
            className="ml-4"
          >
            {(isEnrolling || isDisabling) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEnrolled ? 'Disable' : 'Enable 2FA'}
          </Button>
        </div>

        {isEnrolled && (
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900 dark:text-green-100">
              Two-factor authentication is active. You'll need to enter a code from your authenticator app when signing in.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Set up Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Scan the QR code below with your authenticator app, then enter the verification code
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code */}
            {qrCode && (
              <div className="flex flex-col items-center space-y-4">
                <Card className="p-4 bg-white dark:bg-gray-900">
                  <img 
                    src={qrCode} 
                    alt="2FA QR Code" 
                    className="w-48 h-48"
                  />
                </Card>
                
                <div className="space-y-2 w-full">
                  <Label className="text-xs text-muted-foreground">
                    Or enter this code manually:
                  </Label>
                  <code className="block p-2 text-xs bg-accent rounded text-center font-mono">
                    {secret}
                  </code>
                </div>
              </div>
            )}

            {/* Verification Input */}
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            {enrollmentError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{enrollmentError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEnrollDialog(false);
                  setVerificationCode('');
                  setEnrollmentError('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyAndEnable}
                disabled={isEnrolling || verificationCode.length !== 6}
                className="flex-1"
              >
                {isEnrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Enable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
