import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface HolographicWalletCardProps {
  address?: string;
  onCreateWallet: () => void;
  isCreating?: boolean;
}

export function HolographicWalletCard({
  address,
  onCreateWallet,
  isCreating = false,
}: HolographicWalletCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();

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
    <motion.div
      className="relative w-full max-w-md mx-auto h-64"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onHoverStart={() => setShowQR(true)}
      onHoverEnd={() => setShowQR(false)}
    >
      {/* Active State Card */}
      <motion.div
        className="absolute inset-0 rounded-3xl overflow-hidden"
        animate={prefersReducedMotion ? {} : {
          rotateY: showQR ? 0 : 0,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div 
          className="absolute inset-0 bg-card/80 backdrop-blur-xl border-2 border-accent/30"
          style={{ backdropFilter: 'blur(20px)' }}
        />
        
        {/* Gradient Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5" />
        
        {/* Border Glow Animation */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          animate={prefersReducedMotion ? {} : {
            boxShadow: [
              '0 0 20px rgba(233, 223, 206, 0.2)',
              '0 0 40px rgba(233, 223, 206, 0.4)',
              '0 0 20px rgba(233, 223, 206, 0.2)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-8">
          <motion.div
            animate={prefersReducedMotion ? {} : { 
              y: [-2, 2, -2],
              rotateZ: [-1, 1, -1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {showQR ? (
              <div className="space-y-4 text-center">
                <div className="w-32 h-32 bg-card rounded-xl flex items-center justify-center border border-border">
                  <QrCode className="w-24 h-24 text-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Scan to Receive</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="text-xs text-muted-foreground mb-1">Your Wallet Address</div>
                  <div className="text-lg font-mono font-medium bg-muted/20 px-4 py-2 rounded-lg text-foreground">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg text-sm font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Address
                    </>
                  )}
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}