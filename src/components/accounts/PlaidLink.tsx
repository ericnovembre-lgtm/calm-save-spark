import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PlaidLinkProps {
  onSuccess?: () => void;
}

export function PlaidLink({ onSuccess }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('create-plaid-link-token');
        
        if (error) throw error;
        
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error creating link token:', error);
        toast.error('Failed to initialize account connection');
      }
    };

    createLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('exchange-plaid-token', {
          body: { public_token },
        });

        if (error) throw error;

        toast.success(`Successfully connected ${data.accounts_connected} account(s) from ${data.institution}`);
        
        // Trigger achievement check
        await supabase.functions.invoke('check-achievements', {
          body: { 
            event_type: 'account_connected',
            metadata: { accounts: data.accounts_connected },
          },
        });

        onSuccess?.();
      } catch (error) {
        console.error('Error exchanging token:', error);
        toast.error('Failed to connect account');
      } finally {
        setLoading(false);
      }
    },
    onExit: (err) => {
      if (err) {
        console.error('Plaid Link error:', err);
        toast.error('Account connection cancelled');
      }
    },
  });

  return (
    <Button
      onClick={() => open()}
      disabled={!ready || loading}
      className="w-full sm:w-auto"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4 mr-2" />
          Connect Bank Account
        </>
      )}
    </Button>
  );
}