import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getAuthErrorMessage } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';

interface MagicLinkOptionProps {
  email: string;
}

export function MagicLinkOption({ email }: MagicLinkOptionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSendMagicLink = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      setSent(true);
      toast({
        title: 'Magic link sent!',
        description: 'Check your email for a sign-in link',
      });
    } catch (error: any) {
      const message = getAuthErrorMessage(error);
      toast({
        title: 'Failed to send magic link',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center p-4 bg-accent/50 rounded-lg border border-border">
        <Mail className="h-8 w-8 mx-auto mb-2 text-primary" aria-hidden="true" />
        <p className="text-sm font-medium">Check your email</p>
        <p className="text-xs text-muted-foreground mt-1">
          We sent a sign-in link to {email}
        </p>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full"
      onClick={handleSendMagicLink}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
      )}
      Send magic link instead
    </Button>
  );
}
