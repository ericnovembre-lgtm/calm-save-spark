import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PlaidInvestmentLinkProps {
  onSuccess?: () => void;
}

export function PlaidInvestmentLink({ onSuccess }: PlaidInvestmentLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('create-plaid-investment-link-token');
        
        if (error) throw error;
        
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error creating investment link token:', error);
        toast.error('Failed to initialize investment connection');
      }
    };

    createLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      setLoading(true);
      try {
        // Exchange the public token
        const { data: exchangeData, error: exchangeError } = await supabase.functions.invoke('plaid-exchange-token', {
          body: { 
            publicToken: public_token,
            userId: (await supabase.auth.getUser()).data.user?.id,
            metadata,
          },
        });

        if (exchangeError) throw exchangeError;

        toast.success('Investment account connected successfully!');

        // Trigger initial sync
        toast.loading('Syncing portfolio data...', { id: 'sync-portfolio' });
        
        const { error: syncError } = await supabase.functions.invoke('sync-investments');
        
        if (syncError) {
          console.error('Sync error:', syncError);
          toast.error('Connected but sync failed. Will retry automatically.', { id: 'sync-portfolio' });
        } else {
          toast.success('Portfolio synced successfully!', { id: 'sync-portfolio' });
        }

        // Fetch initial market data
        await supabase.functions.invoke('fetch-market-data');
        await supabase.functions.invoke('fetch-benchmark-data', {
          body: { initial: true }
        });

        // Invalidate queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['investment-accounts'] });
        queryClient.invalidateQueries({ queryKey: ['portfolio-holdings'] });
        
        onSuccess?.();
      } catch (error) {
        console.error('Error connecting investment account:', error);
        toast.error('Failed to connect investment account');
      } finally {
        setLoading(false);
      }
    },
    onExit: (err) => {
      if (err) {
        console.error('Plaid Link error:', err);
        toast.error('Investment connection cancelled');
      }
    },
  });

  return (
    <Button
      onClick={() => open()}
      disabled={!ready || loading}
      size="lg"
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <TrendingUp className="w-5 h-5" />
          Connect Brokerage Account
        </>
      )}
    </Button>
  );
}
