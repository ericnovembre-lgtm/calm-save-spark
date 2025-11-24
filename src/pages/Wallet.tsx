import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Clock, TrendingUp, Plus, Sparkles } from "lucide-react";
import { HolographicWalletCard } from "@/components/wallet/HolographicWalletCard";
import { SmartAddressInput } from "@/components/wallet/SmartAddressInput";
import { SmartSendInterface } from "@/components/wallet/SmartSendInterface";
import { GasGuru } from "@/components/wallet/GasGuru";
import { WalletTabsSwitcher } from "@/components/wallet/WalletTabsSwitcher";
import { TokenBalanceCard } from "@/components/wallet/TokenBalanceCard";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import { DemoModeWarningBanner } from "@/components/wallet/DemoModeWarningBanner";
import { WalletDemoModal } from "@/components/wallet/WalletDemoModal";
import { PortfolioRiskAnalyst } from "@/components/wallet/PortfolioRiskAnalyst";
import { NFTSentimentOracle } from "@/components/wallet/NFTSentimentOracle";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Tab = 'tokens' | 'nfts' | 'history';

export default function Wallet() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [showSmartSend, setShowSmartSend] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('tokens');
  const { toast } = useToast();

  // Mock tokens data with sparkline
  const mockTokens = [
    { symbol: 'ETH', name: 'Ethereum', balance: 1.45, usdValue: 3240.50, change24h: 2.4, sparklineData: [3100, 3150, 3120, 3200, 3180, 3240], isStablecoin: false },
    { symbol: 'USDC', name: 'USD Coin', balance: 450.00, usdValue: 450.00, change24h: 0.01, sparklineData: [450, 450, 450, 450, 450, 450], isStablecoin: true },
    { symbol: 'SOL', name: 'Solana', balance: 142, usdValue: 2840, change24h: -1.2, sparklineData: [2900, 2880, 2850, 2870, 2860, 2840], isStablecoin: false },
  ];

  const totalBalance = mockTokens.reduce((sum, token) => sum + token.usdValue, 0);

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true);
    try {
      const { data, error } = await supabase.functions.invoke('wallet-create', {
        body: { chain: 'ethereum' }
      });

      if (error) throw error;
      if (data.address) {
        setWalletAddress(data.address);
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
    <div className="min-h-screen bg-slate-950">
      <WalletDemoModal />
      
      <div className="container mx-auto px-4 py-12 max-w-xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            My Wallet
          </h1>
          <p className="text-slate-400 text-sm">
            AI-powered crypto command center
          </p>
        </motion.div>

        <DemoModeWarningBanner />

        {/* Holographic Wallet Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
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
            {/* Gas Guru - Compact witty traffic report */}
            <GasGuru />

            {/* Address Scanner - Standalone safety check */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Address Detective</h2>
                <span className="text-xs text-slate-400">Verify before you send</span>
              </div>
              <SmartAddressInput />
            </motion.div>

            {/* Smart Send - Natural Language input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-bold text-white">Smart Send</h2>
              </div>
              <SmartSendInterface
                onSend={handleSend}
                onClose={() => {}}
              />
            </motion.div>

            {/* Tabs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <WalletTabsSwitcher
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'tokens' && (
                  <>
                    <div className="space-y-3">
                      {mockTokens.map((token, i) => (
                        <motion.div
                          key={token.symbol}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <TokenBalanceCard {...token} />
                        </motion.div>
                      ))}
                    </div>
                    <PortfolioRiskAnalyst tokens={mockTokens} />
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
