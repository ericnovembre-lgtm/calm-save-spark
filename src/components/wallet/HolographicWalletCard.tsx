import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { QrCode, Copy, Check, Wallet, ArrowDownLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWalletSettings } from "@/hooks/useWalletSettings";
import { formatCurrency } from "@/lib/exchangeRates";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

interface HolographicWalletCardProps {
  address?: string;
  balance?: number;
  onCreateWallet: () => void;
  isCreating?: boolean;
  onReceive?: () => void;
}

export function HolographicWalletCard({
  address,
  balance = 0,
  onCreateWallet,
  isCreating = false,
  onReceive,
}: HolographicWalletCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const { settings } = useWalletSettings();
  
  const displayCurrency = settings?.display_currency || 'USD';
  const formattedBalance = formatCurrency(balance, displayCurrency);

  // 3D Tilt Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse position to rotation values (±15°)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  // Dynamic shadow based on tilt
  const shadowX = useTransform(mouseX, [-0.5, 0.5], [20, -20]);
  const shadowY = useTransform(mouseY, [-0.5, 0.5], [20, -20]);

  // Specular light position
  const lightX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const lightY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  // Edge reflection opacities
  const topEdgeOpacity = useTransform(rotateX, [-15, 15], [0.3, 0]);
  const bottomEdgeOpacity = useTransform(rotateX, [-15, 15], [0, 0.3]);

  // Combined transforms (must be at top level)
  const dynamicShadow = useTransform(
    [shadowX, shadowY],
    ([x, y]) => `${x}px ${y}px 40px rgba(0,0,0,0.3), 0 0 60px rgba(251, 191, 36, 0.2)`
  );

  const specularLight = useTransform(
    [lightX, lightY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.2), transparent 50%)`
  );

  // Handle mouse tracking for 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || isFlipped) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    mouseX.set(0);
    mouseY.set(0);
  };

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
              <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
                <div className="w-12 h-16 border-4 border-amber-500 rounded-lg" />
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
    <div 
      className="perspective-1000 relative h-56 w-full max-w-md mx-auto mb-10"
      style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        onClick={() => setIsFlipped(!isFlipped)}
        animate={prefersReducedMotion ? 
          { rotateY: isFlipped ? 180 : 0 } : 
          { 
            rotateY: isFlipped ? 180 : 0,
            y: isFlipped ? 0 : [0, -8, 0],
            rotateZ: isFlipped ? 0 : [0, 0.5, 0]
          }
        }
        style={!isFlipped && !prefersReducedMotion ? {
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY: rotateY,
        } : { transformStyle: 'preserve-3d' }}
        transition={prefersReducedMotion ? 
          { duration: 0.6, type: "spring", stiffness: 260, damping: 20 } :
          {
            rotateY: { duration: 0.6, type: "spring", stiffness: 260, damping: 20 },
            y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            rotateZ: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
          }
        }
        className="relative h-full w-full cursor-pointer"
      >
        {/* Front Face */}
        <motion.div 
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-950 via-yellow-900 to-amber-900 border border-amber-400/20 p-6 shadow-2xl overflow-hidden"
          style={prefersReducedMotion ? { backfaceVisibility: 'hidden' } : {
            backfaceVisibility: 'hidden',
            boxShadow: dynamicShadow as any,
          }}
        >
          {/* Specular light highlight that follows cursor */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: specularLight as any,
              transform: 'translateZ(5px)',
              display: prefersReducedMotion || isFlipped ? 'none' : 'block',
            }}
          />

          {/* Top edge reflection */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.3), transparent)',
              opacity: topEdgeOpacity,
              transform: 'translateZ(5px)',
              display: prefersReducedMotion || isFlipped ? 'none' : 'block',
            }}
          />

          {/* Bottom edge reflection */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{
              background: 'linear-gradient(0deg, rgba(251, 191, 36, 0.3), transparent)',
              opacity: bottomEdgeOpacity,
              transform: 'translateZ(5px)',
              display: prefersReducedMotion || isFlipped ? 'none' : 'block',
            }}
          />

          {/* Edge Glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 30px rgba(251, 191, 36, 0.1)',
              transform: 'translateZ(15px)',
            }}
            animate={prefersReducedMotion ? {} : {
              boxShadow: [
                'inset 0 0 30px rgba(251, 191, 36, 0.05)',
                'inset 0 0 40px rgba(251, 191, 36, 0.15)',
                'inset 0 0 30px rgba(251, 191, 36, 0.05)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          {/* Gold Shimmer Sweep Animation */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(
                105deg,
                transparent 20%,
                rgba(251, 191, 36, 0.1) 35%,
                rgba(245, 158, 11, 0.2) 50%,
                rgba(251, 191, 36, 0.1) 65%,
                transparent 80%
              )`,
              backgroundSize: '200% 100%',
              transform: 'translateZ(10px)',
            }}
            animate={prefersReducedMotion ? {} : {
              backgroundPosition: ['200% 0%', '-200% 0%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 2,
            }}
          />
          
          {/* Secondary Metallic Highlight */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: `radial-gradient(
                ellipse 80% 50% at 50% 50%,
                rgba(251, 191, 36, 0.3),
                transparent 70%
              )`,
              transform: 'translateZ(10px)',
            }}
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Holo Sheen */}
          <div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/10 to-transparent opacity-50 pointer-events-none"
            style={{ transform: 'translateZ(0px)' }}
          />
          <div 
            className="absolute -right-10 -top-10 h-32 w-32 bg-amber-400/30 blur-3xl rounded-full"
            style={{ transform: 'translateZ(-20px)' }}
          />

          <div 
            className="flex flex-col justify-between h-full relative z-10"
            style={{ transform: 'translateZ(20px)' }}
          >
            <div 
              className="flex justify-between items-start"
              style={{ transform: 'translateZ(15px)' }}
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <Wallet size={20} />
                </div>
                <span className="font-bold text-white tracking-wide">$ave+ Vault</span>
              </div>
              <span className="text-xs font-mono text-amber-200/80 bg-amber-950/50 px-2 py-1 rounded border border-amber-400/20">ETH Mainnet</span>
            </div>

            <div style={{ transform: 'translateZ(30px)' }}>
              <p className="text-amber-200/70 text-sm uppercase tracking-wider mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold text-white tracking-tight">
                {settings?.hide_balance ? '••••••' : formattedBalance}
              </h2>
            </div>

            <div 
              className="flex justify-between items-end"
              style={{ transform: 'translateZ(20px)' }}
            >
              <div className="flex items-center gap-2 text-amber-100/90 font-mono text-sm bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-colors">
                {address.slice(0, 6)}...{address.slice(-4)}
                <Copy 
                  size={14} 
                  className="text-amber-300/60 hover:text-amber-200 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                />
              </div>
              
              {onReceive && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReceive();
                  }}
                  className="bg-amber-500/20 border-amber-400/40 hover:bg-amber-500/30 text-amber-100 h-8 px-3"
                >
                  <ArrowDownLeft className="h-3 w-3 mr-1" />
                  Receive
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Back Face (QR Code) */}
        <div 
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-6 shadow-2xl flex flex-col items-center justify-center border border-slate-200"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="mb-3">
            <span className="text-slate-900 font-bold text-sm">$ave+ Wallet</span>
          </div>
          
          <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-200">
            <QRCodeSVG
              value={address}
              size={140}
              level="H"
              includeMargin={false}
              fgColor="#0f172a"
              bgColor="#ffffff"
            />
          </div>
          
          <p className="text-slate-500 text-xs font-mono text-center break-all px-4 mt-4 max-w-[280px]">
            {address}
          </p>
          <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-widest">Scan to Receive Crypto</p>
        </div>
      </motion.div>
    </div>
  );
}