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

  // Mock tokens data
  const mockTokens = [
    { symbol: 'ETH', name: 'Ethereum', balance: 2.5431, usdValue: 8234.12, change24h: 3.24 },
    { symbol: 'USDC', name: 'USD Coin', balance: 1500.00, usdValue: 1500.00, change24h: 0.01 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', balance: 0.15, usdValue: 6234.50, change24h: -1.82 },
  ];

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
    // Demo mode: simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="min-h-screen bg-background">
      <WalletDemoModal />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold text-foreground">
            Smart Crypto Command Center
          </h1>
          <p className="text-muted-foreground">
            AI-powered wallet with intelligent transaction parsing and security scanning
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
              className="bg-card/60 backdrop-blur-xl rounded-2xl border-2 border-border p-6"
            >
              {!showSmartSend ? (
                <button
                  onClick={() => setShowSmartSend(true)}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-medium hover:shadow-lg transition-shadow"
                >
                  Send Transaction
                </button>
              ) : (
                <SmartSendInterface
                  onSend={handleSend}
                  onClose={() => setShowSmartSend(false)}
                />
              )}
            </motion.div>

            {/* Gas Guru */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GasGuru />
            </motion.div>

            {/* Tabs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="flex justify-center">
                <WalletTabsSwitcher
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'tokens' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
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
                  </motion.div>
                )}

                {activeTab === 'nfts' && (
                  <div className="text-center py-20">
                    <div className="text-muted-foreground">
                      <div className="text-4xl mb-4">🖼️</div>
                      <p className="text-lg font-medium">NFT Gallery Coming Soon</p>
                      <p className="text-sm mt-2">Manage your digital collectibles</p>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <TransactionHistory />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
