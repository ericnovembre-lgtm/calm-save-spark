import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { WalletNotificationSettings } from "@/components/wallet/WalletNotificationSettings";
import { DisplayCurrencySettings } from "@/components/wallet/settings/DisplayCurrencySettings";
import { PrivacySettings } from "@/components/wallet/settings/PrivacySettings";
import { GasAlertSettings } from "@/components/wallet/settings/GasAlertSettings";

export default function WalletSettings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950">
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
          <p className="text-slate-400">
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
  );
}
