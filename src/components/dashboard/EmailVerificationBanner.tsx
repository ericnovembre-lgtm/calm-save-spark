import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function EmailVerificationBanner() {
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if email is verified
          const verified = user.email_confirmed_at !== null;
          setIsEmailVerified(verified);
          
          if (!verified) {
            trackEvent('email_verification_banner_shown', { 
              user_id: user.id,
              email: user.email 
            });
          }
        }
      } catch (error) {
        console.error('Error checking email verification:', error);
      }
    };

    checkEmailVerification();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const verified = session.user.email_confirmed_at !== null;
        setIsEmailVerified(verified);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        throw new Error('No email found');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Verification email sent',
        description: 'Check your inbox for the verification link',
      });

      trackEvent('email_verification_resent', { 
        email: user.email 
      });
    } catch (error: any) {
      toast({
        title: 'Failed to resend email',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });

      trackEvent('email_verification_resend_failed', { 
        error: error.message 
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    trackEvent('email_verification_banner_dismissed', {});
  };

  // Don't show if verified or dismissed
  if (isEmailVerified || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        {...(!prefersReducedMotion && {
          initial: { opacity: 0, y: -10 },
          exit: { opacity: 0, y: -10 },
        })}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Alert className="bg-accent/50 border-primary/30">
          <Mail className="h-5 w-5 text-primary" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium text-foreground mb-1">
                Verify your email address
              </p>
              <p className="text-sm text-muted-foreground">
                Please check your inbox and click the verification link to secure your account and unlock all features.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResending}
                className="shrink-0"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" aria-hidden="true" />
                    Sending...
                  </>
                ) : (
                  'Resend Email'
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="shrink-0 h-8 w-8 p-0"
                aria-label="Dismiss verification reminder"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
