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
import { ReceiveModal } from "@/components/wallet/ReceiveModal";
import { AddTokenDialog } from "@/components/wallet/AddTokenDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useActiveChain } from "@/hooks/useActiveChain";
import { useWalletTokenHoldings } from "@/hooks/useWalletTokenHoldings";
import { useTokenPriceWebSocket } from "@/hooks/useTokenPriceWebSocket";
import { AppLayout } from "@/components/layout/AppLayout";

type Tab = 'tokens' | 'nfts' | 'history';

export default function Wallet() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [showSmartSend, setShowSmartSend] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
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
    <AppLayout>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Ambient background elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[128px]" />
        </div>

        <WalletDemoModal />
        
        <div className="container mx-auto px-4 py-6 sm:py-10 max-w-2xl relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between mb-8 sm:mb-12"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-1.5 tracking-tight">
                Wallet
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Secure crypto management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/wallet/settings')}
                className="hover:bg-accent/50 transition-colors h-9 w-9"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <ChainSwitcher />
              <WalletNotificationCenter />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <DemoModeWarningBanner />
          </motion.div>

          {/* Holographic Wallet Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
          >
            <HolographicWalletCard
              address={walletAddress}
              balance={totalBalance}
              onCreateWallet={handleCreateWallet}
              isCreating={isCreatingWallet}
              onReceive={() => setShowReceiveModal(true)}
            />
          </motion.div>

          {walletAddress && (
            <>
              {/* Portfolio Balance Chart */}
              {wallet && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
                transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8"
              >
                <GasGuru />
              </motion.div>

              {/* Smart Tools Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="space-y-5 mb-10"
              >
                {/* Address Scanner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-border transition-all"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground tracking-tight">Address Detective</h2>
                      <p className="text-xs text-muted-foreground font-medium">Verify before you send</p>
                    </div>
                  </div>
                  <SmartAddressInput />
                </motion.div>

                {/* Smart Send */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-border transition-all"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-accent/10 flex items-center justify-center ring-1 ring-accent/20">
                      <Sparkles className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">Smart Send</h2>
                  </div>
                  <SmartSendInterface
                    onSend={handleSend}
                    onClose={() => {}}
                  />
                </motion.div>
              </motion.div>

              {/* Tabs Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-7"
              >
                <div className="flex justify-center">
                  <WalletTabsSwitcher
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>

                {/* Tab Content */}
                <div className="space-y-5">
                  {activeTab === 'tokens' && (
                    <>
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Holdings</h3>
                        <AddTokenDialog walletAddress={walletAddress} />
                      </div>
                      
                      {tokens.length > 0 ? (
                        <>
                          {isPricesFeedConnected && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1, duration: 0.4 }}
                              className="flex items-center gap-2.5 px-4 py-2.5 bg-success/10 border border-success/20 rounded-2xl"
                            >
                              <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-lg shadow-success/50" />
                              <span className="text-xs font-semibold text-success">Live prices connected</span>
                            </motion.div>
                          )}
                          <div className="space-y-3">
                            {tokens.map((token, i) => (
                              <motion.div
                                key={token.symbol}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ 
                                  delay: 0.65 + (i * 0.04),
                                  duration: 0.4,
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
                            transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <PortfolioRiskAnalyst tokens={tokens} />
                          </motion.div>
                        </>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="text-center py-20 px-4 bg-card/40 backdrop-blur-sm border border-border/50 rounded-3xl"
                        >
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                            className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-muted/60 to-muted/30 flex items-center justify-center ring-1 ring-border/50"
                          >
                            <Coins className="w-9 h-9 text-muted-foreground" />
                          </motion.div>
                          <p className="text-xl font-semibold text-foreground mb-2 tracking-tight">No tokens yet</p>
                          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">Add crypto holdings to start tracking your portfolio</p>
                          <AddTokenDialog walletAddress={walletAddress} />
                        </motion.div>
                      )}
                    </>
                  )}

                  {activeTab === 'nfts' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <NFTSentimentOracle />
                    </motion.div>
                  )}

                  {activeTab === 'history' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <TransactionHistory />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </div>
        
        {/* Receive Modal */}
        <ReceiveModal 
          open={showReceiveModal} 
          onClose={() => setShowReceiveModal(false)} 
        />
      </div>
    </AppLayout>
  );
}
