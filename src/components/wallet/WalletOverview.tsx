import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function WalletOverview() {
  const [isCreating, setIsCreating] = useState(false);

  const { data: wallet, isLoading, refetch } = useQuery({
    queryKey: ['user-wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('chain', 'ethereum')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { data: tokens } = useQuery({
    queryKey: ['wallet-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_tokens')
        .select('*')
        .eq('is_active', true)
        .order('symbol');

      if (error) throw error;
      return data;
    },
  });

  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('wallet-create', {
        body: { chain: 'ethereum' },
      });

      if (response.error) throw response.error;

      toast.success('Wallet created successfully!');
      refetch();
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast.error('Failed to create wallet');
    } finally {
      setIsCreating(false);
    }
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast.success('Address copied to clipboard');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <Card className="p-6 mb-8">
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card className="p-8 mb-8 text-center">
        <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Wallet Yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your secure wallet to start sending and receiving crypto
        </p>
        <Button onClick={handleCreateWallet} disabled={isCreating} size="lg">
          {isCreating ? 'Creating...' : 'Create Wallet'}
        </Button>
      </Card>
    );
  }

  // Demo balances
  const demoBalance = {
    ETH: 1.5432,
    USDC: 2500.00,
    USDT: 1000.00,
    totalUSD: 7543.21
  };

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Badge variant="outline" className="mb-2">
            <AlertCircle className="h-3 w-3 mr-1" />
            Demo Mode
          </Badge>
          <h2 className="text-3xl font-bold">${demoBalance.totalUSD.toLocaleString()}</h2>
          <p className="text-muted-foreground">Total Balance</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {formatAddress(wallet.address)}
            </code>
            <Button variant="ghost" size="icon" onClick={copyAddress}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a 
                href={`https://etherscan.io/address/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Ethereum Mainnet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">Ξ</span>
            <span className="font-semibold">ETH</span>
          </div>
          <p className="text-2xl font-bold">{demoBalance.ETH}</p>
          <p className="text-sm text-muted-foreground">
            ≈ ${(demoBalance.ETH * 3000).toLocaleString()}
          </p>
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💵</span>
            <span className="font-semibold">USDC</span>
          </div>
          <p className="text-2xl font-bold">{demoBalance.USDC.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            ≈ ${demoBalance.USDC.toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💰</span>
            <span className="font-semibold">USDT</span>
          </div>
          <p className="text-2xl font-bold">{demoBalance.USDT.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            ≈ ${demoBalance.USDT.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
