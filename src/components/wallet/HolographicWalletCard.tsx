import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Copy, Check, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWalletSettings } from "@/hooks/useWalletSettings";
import { formatCurrency } from "@/lib/exchangeRates";

interface HolographicWalletCardProps {
  address?: string;
  balance?: number;
  onCreateWallet: () => void;
  isCreating?: boolean;
}

export function HolographicWalletCard({
  address,
  balance = 0,
  onCreateWallet,
  isCreating = false,
}: HolographicWalletCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const { settings } = useWalletSettings();
  
  const displayCurrency = settings?.display_currency || 'USD';
  const formattedBalance = formatCurrency(balance, displayCurrency);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast({ title: "Address copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!address) {
    return (
      <motion.div
        className="relative w-full max-w-md mx-auto h-64"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Locked State Card */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div 
            className="absolute inset-0 bg-card/60 backdrop-blur-xl border-2 border-border/50"
            style={{ backdropFilter: 'blur(20px)' }}
          />
          
          {/* Frosted Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-card/80 to-card/40" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
            <motion.div
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                <div className="w-12 h-16 border-4 border-accent rounded-lg" />
              </div>
            </motion.div>
            
            <h3 className="text-2xl font-bold mb-2 text-foreground">
              Create Your Wallet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Initialize your secure crypto wallet to start managing digital assets
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateWallet}
              disabled={isCreating}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Wallet"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="perspective-1000 relative h-56 w-full max-w-md mx-auto mb-10">
      <motion.div
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative h-full w-full cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face */}
        <div 
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 p-6 shadow-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Holo Sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50 pointer-events-none" />
          <div className="absolute -right-10 -top-10 h-32 w-32 bg-cyan-500/20 blur-3xl rounded-full" />

          <div className="flex flex-col justify-between h-full relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Wallet size={20} />
                </div>
                <span className="font-bold text-white tracking-wide">$ave+ Vault</span>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-black/30 px-2 py-1 rounded border border-white/5">ETH Mainnet</span>
            </div>

            <div>
              <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold text-white tracking-tight">
                {settings?.hide_balance ? '••••••' : formattedBalance}
              </h2>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-300 font-mono text-sm bg-white/5 px-3 py-1.5 rounded-lg">
                {address.slice(0, 6)}...{address.slice(-4)}
                <Copy 
                  size={14} 
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </div>
            </div>
          </div>
        </div>

        {/* Back Face (QR Code) */}
        <div 
          className="absolute inset-0 rounded-3xl bg-white p-6 shadow-2xl flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <QrCode size={120} className="text-slate-900 mb-4" />
          <p className="text-slate-500 text-xs font-mono text-center break-all px-4">
            {address}
          </p>
          <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-widest">Scan to Deposit</p>
        </div>
      </motion.div>
    </div>
  );
}