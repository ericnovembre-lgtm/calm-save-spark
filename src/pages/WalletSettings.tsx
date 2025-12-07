import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { WalletNotificationSettings } from "@/components/wallet/WalletNotificationSettings";
import { DisplayCurrencySettings } from "@/components/wallet/settings/DisplayCurrencySettings";
import { PrivacySettings } from "@/components/wallet/settings/PrivacySettings";
import { GasAlertSettings } from "@/components/wallet/settings/GasAlertSettings";
import { WalletBackupSettings } from "@/components/wallet/settings/WalletBackupSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveChain } from "@/hooks/useActiveChain";
import { AppLayout } from "@/components/layout/AppLayout";

export default function WalletSettings() {
  const navigate = useNavigate();
  const { selectedChain } = useActiveChain();

  // Fetch wallet data
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
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  return (
    <AppLayout>
      <div className="min-h-screen bg-card">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/wallet')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wallet
            </Button>
            <h1 className="text-3xl font-bold text-white mb-2">
              Wallet Settings
            </h1>
            <p className="text-muted-foreground">
              Customize your wallet experience and preferences
            </p>
          </motion.div>

          {/* Settings Sections */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <WalletNotificationSettings />
            </motion.div>

            {wallet && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <WalletBackupSettings 
                  walletId={wallet.id}
                  walletAddress={wallet.address}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GasAlertSettings />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <DisplayCurrencySettings />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <PrivacySettings />
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
