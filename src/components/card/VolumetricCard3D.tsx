import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { use3DTilt } from '@/hooks/use3DTilt';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';

type Card = Database['public']['Tables']['cards']['Row'];

interface VolumetricCard3DProps {
  card: Card;
  onFreeze?: (cardId: string) => void;
}

/**
 * Premium volumetric 3D card with metal texture and dynamic sheen
 * "Titanium & Glass" aesthetic with physical depth simulation
 */
export function VolumetricCard3D({ card, onFreeze }: VolumetricCard3DProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { tiltStyle, sheenStyle, handleMouseMove, handleMouseLeave } = use3DTilt({
    maxTilt: 8,
    perspective: 1200,
    scale: 1.02,
    speed: 300,
    stiffness: 300,
    damping: 20
  });

  // Mock CVV for display (in production, fetch from secure endpoint)
  const cvv = '***';

  const isFrozen = card.status === 'frozen';

  return (
    <div className="space-y-4">
      {/* Volumetric 3D Card */}
      <div 
        className="perspective-1000 transform-style-preserve-3d"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          style={tiltStyle}
          className="relative w-full max-w-md mx-auto"
        >
          {/* Card Chassis - Layer 1 (Base) */}
          <div 
            className="relative w-full h-56 rounded-3xl overflow-hidden"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Metal Chassis with Anisotropic Brushed Texture */}
            <div 
              className={`absolute inset-0 ${
                isFrozen 
                  ? 'bg-gradient-to-br from-zinc-900 to-zinc-950' 
                  : 'bg-gradient-to-br from-zinc-100 to-zinc-200'
              }`}
              style={{
                transform: 'translateZ(0px)',
                backgroundImage: isFrozen 
                  ? 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.03) 2px, transparent 3px)'
                  : 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.02) 2px, transparent 3px)'
              }}
            />

            {/* Dynamic Sheen Layer - Layer 2 */}
            {!isFrozen && (
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: sheenStyle.sheenX && sheenStyle.sheenY 
                    ? `radial-gradient(circle at ${sheenStyle.sheenX}% ${sheenStyle.sheenY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, transparent 70%)`
                    : 'none',
                  transform: 'translateZ(2px)'
                }}
              />
            )}

            {/* Holographic Foil Edge - Active State Only */}
            {!isFrozen && (
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{
                  transform: 'translateZ(2.5px)',
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,0,255,0.15) 90deg, transparent 180deg, rgba(0,255,255,0.15) 270deg, transparent 360deg)',
                  mixBlendMode: 'screen'
                }}
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            )}

            {/* Card Face Content - Layer 3 */}
            <div 
              className="absolute inset-0 p-6 flex flex-col justify-between"
              style={{ transform: 'translateZ(3px)' }}
            >
              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl backdrop-blur-sm ${
                  isFrozen 
                    ? 'bg-white/10' 
                    : 'bg-black/10'
                }`}>
                  <CreditCard className={`w-6 h-6 ${
                    isFrozen ? 'text-zinc-400' : 'text-zinc-800'
                  }`} />
                </div>
                <div className={`text-right ${
                  isFrozen ? 'text-zinc-400' : 'text-zinc-800'
                }`}>
                  <div className="text-xs font-medium tracking-wider opacity-70">
                    {card.network?.toUpperCase() || '$AVE+'}
                  </div>
                  <div className="text-sm font-bold">{card.brand || 'TITANIUM'}</div>
                </div>
              </div>

              {/* Card Number */}
              <div className={`font-mono text-lg tracking-[0.3em] ${
                isFrozen ? 'text-zinc-400' : 'text-zinc-900'
              }`}>
                {showDetails ? (
                  <span>•••• •••• •••• {card.last4}</span>
                ) : (
                  <span>•••• •••• •••• ••••</span>
                )}
              </div>

              {/* Bottom Row */}
              <div className="flex justify-between items-end">
                <div>
                  <div className={`text-xs uppercase tracking-wider mb-1 ${
                    isFrozen ? 'text-zinc-500' : 'text-zinc-600'
                  }`}>
                    Expires
                  </div>
                  <div className={`text-sm font-bold font-mono ${
                    isFrozen ? 'text-zinc-400' : 'text-zinc-900'
                  }`}>
                    {showDetails ? (
                      <span>{String(card.exp_month).padStart(2, '0')}/{card.exp_year}</span>
                    ) : (
                      <span>••/••</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs uppercase tracking-wider mb-1 ${
                    isFrozen ? 'text-zinc-500' : 'text-zinc-600'
                  }`}>
                    CVV
                  </div>
                  <div className={`text-sm font-bold font-mono ${
                    isFrozen ? 'text-zinc-400' : 'text-zinc-900'
                  }`}>
                    {showDetails ? cvv : '•••'}
                  </div>
                </div>
              </div>
            </div>

            {/* Glass Highlights - Layer 4 */}
            {!isFrozen && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  transform: 'translateZ(4px)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.2) 100%)'
                }}
              />
            )}

            {/* Frozen Overlay */}
            {isFrozen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center"
                style={{ transform: 'translateZ(5px)' }}
              >
                <div className="text-center text-white">
                  <Lock className="w-10 h-10 mx-auto mb-3 drop-shadow-lg" />
                  <div className="text-sm font-bold tracking-wider">CARD FROZEN</div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="gap-2 active:scale-[0.95] transition-transform"
        >
          {showDetails ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide Details
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show Details
            </>
          )}
        </Button>

        {onFreeze && (
          <Button
            variant={isFrozen ? "default" : "destructive"}
            size="sm"
            onClick={() => onFreeze(card.id)}
            className="gap-2 active:scale-[0.95] transition-transform"
          >
            <Lock className="w-4 h-4" />
            {isFrozen ? 'Unfreeze' : 'Freeze'}
          </Button>
        )}
      </div>
    </div>
  );
}
