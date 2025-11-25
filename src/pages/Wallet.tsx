import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Clock, TrendingUp, Plus, Sparkles, Coins } from "lucide-react";
import { HolographicWalletCard } from "@/components/wallet/HolographicWalletCard";
import { SmartAddressInput } from "@/components/wallet/SmartAddressInput";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SmartSendInterface } from "@/components/wallet/SmartSendInterface";
import { GasGuru } from "@/components/wallet/GasGuru";
import { WalletTabsSwitcher } from "@/components/wallet/WalletTabsSwitcher";
import { TokenBalanceCard } from "@/components/wallet/TokenBalanceCard";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import { DemoModeWarningBanner } from "@/components/wallet/DemoModeWarningBanner";
import { WalletDemoModal } from "@/components/wallet/WalletDemoModal";
import { PortfolioRiskAnalyst } from "@/components/wallet/PortfolioRiskAnalyst";
import { NFTSentimentOracle } from "@/components/wallet/NFTSentimentOracle";
import { PortfolioBalanceChart } from "@/components/wallet/PortfolioBalanceChart";
import { WalletNotificationCenter } from "@/components/wallet/WalletNotificationCenter";
import { ChainSwitcher } from "@/components/wallet/ChainSwitcher";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useActiveChain } from "@/hooks/useActiveChain";
import { useWalletTokenHoldings } from "@/hooks/useWalletTokenHoldings";
import { useTokenPriceWebSocket } from "@/hooks/useTokenPriceWebSocket";

type Tab = 'tokens' | 'nfts' | 'history';

export default function Wallet() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [showSmartSend, setShowSmartSend] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('tokens');
  const { toast } = useToast();
  const { selectedChain } = useActiveChain();
  const navigate = useNavigate();

  // Fetch wallet data for balance chart
  const { data: wallet } = useQuery({
    queryKey: ['user-wallet', selectedChain],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .eq('chain', selectedChain)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Sync wallet address from fetched data
  useEffect(() => {
    if (wallet?.address) {
      setWalletAddress(wallet.address);
    }
  }, [wallet]);

  // Fetch user's actual token holdings
  const { data: tokenHoldings = [] } = useWalletTokenHoldings(walletAddress);

  // Subscribe to real-time prices for user's tokens
  const tokenSymbols = tokenHoldings.map(h => h.symbol);
  const { prices: livePrices, isConnected: isPricesFeedConnected } = useTokenPriceWebSocket(tokenSymbols);

  // Combine holdings with live prices
  const tokens = tokenHoldings.map(holding => {
    const livePrice = livePrices.get(holding.symbol);
    const currentPrice = livePrice?.price || holding.current_price || 0;
    const usdValue = holding.quantity * currentPrice;
    const change24h = livePrice?.changePercent || 0;

    return {
      symbol: holding.symbol,
      name: holding.name,
      balance: holding.quantity,
      usdValue,
      change24h,
      livePrice: livePrice?.price,
      lastUpdate: livePrice?.timestamp,
      isLive: !!livePrice,
      sparklineData: [], // Could be populated from price history
      isStablecoin: ['USDC', 'USDT', 'DAI'].includes(holding.symbol.toUpperCase()),
    };
  });

  const totalBalance = tokens.reduce((sum, token) => sum + token.usdValue, 0);

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true);
    try {
      const { data, error } = await supabase.functions.invoke('wallet-create', {
        body: { chain: 'ethereum' }
      });

      if (error) throw error;
      if (data.wallet?.address) {
        setWalletAddress(data.wallet.address);
        toast({ title: "Wallet created successfully!" });
      }
    } catch (error) {
      toast({
        title: "Failed to create wallet",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleSend = async (data: any) => {
    console.log('Sending transaction:', data);
    toast({ title: "Transaction submitted", description: "Your transaction is being processed" });
    setShowSmartSend(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <WalletDemoModal />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Wallet
            </h1>
            <p className="text-muted-foreground text-sm">
              Secure crypto management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/wallet/settings')}
              className="hover:bg-accent"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <ChainSwitcher />
            <WalletNotificationCenter />
          </div>
        </motion.div>

        <DemoModeWarningBanner />

        {/* Holographic Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <HolographicWalletCard
            address={walletAddress}
            balance={totalBalance}
            onCreateWallet={handleCreateWallet}
            isCreating={isCreatingWallet}
          />
        </motion.div>

        {walletAddress && (
          <>
            {/* Portfolio Balance Chart */}
            {wallet && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8"
              >
                <PortfolioBalanceChart 
                  walletId={wallet.id} 
                  currentBalance={totalBalance}
                />
              </motion.div>
            )}

            {/* Gas Guru */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <GasGuru />
            </motion.div>

            {/* Smart Tools Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 mb-8"
            >
              {/* Address Scanner */}
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Address Detective</h2>
                    <p className="text-xs text-muted-foreground">Verify before you send</p>
                  </div>
                </div>
                <SmartAddressInput />
              </div>

              {/* Smart Send */}
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Smart Send</h2>
                </div>
                <SmartSendInterface
                  onSend={handleSend}
                  onClose={() => {}}
                />
              </div>
            </motion.div>

            {/* Tabs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <WalletTabsSwitcher
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
              {activeTab === 'tokens' && (
                  <>
                    {tokens.length > 0 ? (
                      <>
                        {isPricesFeedConnected && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-xl"
                          >
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-xs font-medium text-success">Live prices connected</span>
                          </motion.div>
                        )}
                        <div className="space-y-3">
                          {tokens.map((token, i) => (
                            <motion.div
                              key={token.symbol}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ 
                                delay: i * 0.05,
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1]
                              }}
                            >
                              <TokenBalanceCard {...token} />
                            </motion.div>
                          ))}
                        </div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <PortfolioRiskAnalyst tokens={tokens} />
                        </motion.div>
                      </>
                    ) : (
                      <div className="text-center py-16 px-4">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                          <Coins className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium text-foreground mb-1">No tokens yet</p>
                        <p className="text-sm text-muted-foreground">Add crypto holdings to get started</p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'nfts' && <NFTSentimentOracle />}

                {activeTab === 'history' && <TransactionHistory />}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
