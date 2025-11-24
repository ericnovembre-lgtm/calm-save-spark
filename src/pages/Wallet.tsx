import { useState } from "react";
import { motion } from "framer-motion";
import { HolographicWalletCard } from "@/components/wallet/HolographicWalletCard";
import { SmartSendInterface } from "@/components/wallet/SmartSendInterface";
import { GasGuru } from "@/components/wallet/GasGuru";
import { WalletTabsSwitcher } from "@/components/wallet/WalletTabsSwitcher";
import { TokenBalanceCard } from "@/components/wallet/TokenBalanceCard";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import { DemoModeWarningBanner } from "@/components/wallet/DemoModeWarningBanner";
import { WalletDemoModal } from "@/components/wallet/WalletDemoModal";
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
    { symbol: 'ETH', name: 'Ethereum', balance: 1.45, usdValue: 3240.50, change24h: 2.4, sparklineData: [3100, 3150, 3120, 3200, 3180, 3240] },
    { symbol: 'USDC', name: 'USD Coin', balance: 450.00, usdValue: 450.00, change24h: 0.01, sparklineData: [450, 450, 450, 450, 450, 450] },
    { symbol: 'SOL', name: 'Solana', balance: 142, usdValue: 2840, change24h: -1.2, sparklineData: [2900, 2880, 2850, 2870, 2860, 2840] },
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
            {/* Smart Send Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              {!showSmartSend ? (
                <button
                  onClick={() => setShowSmartSend(true)}
                  className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-violet-500/50"
                >
                  💬 Smart Send
                </button>
              ) : (
                <SmartSendInterface
                  onSend={handleSend}
                  onClose={() => setShowSmartSend(false)}
                />
              )}
            </motion.div>

            {/* Gas Guru */}
            <GasGuru />

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
              <div className="space-y-3">
                {activeTab === 'tokens' && mockTokens.map((token, i) => (
                  <motion.div
                    key={token.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <TokenBalanceCard {...token} />
                  </motion.div>
                ))}

                {activeTab === 'nfts' && (
                  <div className="text-center py-12 text-slate-500">
                    <div className="text-4xl mb-4">🖼️</div>
                    <p className="text-lg font-medium mb-2">No NFTs yet</p>
                    <p className="text-sm">Your collectibles will appear here</p>
                  </div>
                )}

                {activeTab === 'history' && <TransactionHistory />}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
