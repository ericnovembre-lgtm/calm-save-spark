import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi } from 'lucide-react';
import { use3DTilt } from '@/hooks/use3DTilt';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EMVChip } from './EMVChip';
import { cn } from '@/lib/utils';

type CardVariant = 'matte-black' | 'matte-white' | 'metallic-gold' | 'metallic-silver';

interface PhysicalCreditCardProps {
  variant: CardVariant;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  showDetails?: boolean;
  isFlippable?: boolean;
  className?: string;
}

// Base64 noise texture for matte finish
const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const variantStyles = {
  'matte-black': {
    base: 'bg-neutral-900',
    texture: true,
    textColor: 'text-gray-200',
    textShadow: '0 1px 2px rgba(255,255,255,0.1)',
    emboss: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.2)',
    chipColor: 'gold' as const,
    shimmer: false,
  },
  'matte-white': {
    base: 'bg-[#FAFAFA]',
    texture: true,
    textColor: 'text-gray-900',
    textShadow: 'none',
    emboss: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.2)',
    chipColor: 'gold' as const,
    shimmer: false,
  },
  'metallic-gold': {
    base: 'bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728]',
    texture: false,
    textColor: 'text-yellow-900',
    textShadow: 'none',
    emboss: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.2)',
    chipColor: 'gold' as const,
    shimmer: true,
  },
  'metallic-silver': {
    base: 'bg-gradient-to-br from-[#E0E0E0] via-[#FFFFFF] to-[#B0B0B0]',
    texture: false,
    textColor: 'text-gray-900',
    textShadow: 'none',
    emboss: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.2)',
    chipColor: 'silver' as const,
    shimmer: true,
  },
};

export function PhysicalCreditCard({
  variant,
  cardNumber = '4242',
  cardHolder = 'YOUR NAME HERE',
  expiryDate = '12/28',
  cvv = '123',
  showDetails = true,
  isFlippable = true,
  className,
}: PhysicalCreditCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { tiltStyle, sheenStyle, handleMouseMove, handleMouseLeave } = use3DTilt({
    maxTilt: 12,
    perspective: 1000,
    scale: 1.03,
    stiffness: 300,
    damping: 20,
  });

  const style = variantStyles[variant];

  const handleFlip = () => {
    if (isFlippable) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <motion.div
      className={cn("w-[340px] h-[214px] relative group", className)}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="w-full h-full rounded-2xl relative cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          ...tiltStyle,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* FRONT FACE */}
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* ISO ID-1 compliant card container */}
          <div
            className={cn("relative w-full h-full rounded-2xl overflow-hidden", style.base)}
            style={{
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.25),
                0 12px 25px -8px rgba(0, 0, 0, 0.15),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.15)
              `,
              backgroundSize: style.shimmer ? '200% 100%' : 'auto',
            }}
          >
            {/* Layer 2: Matte Texture */}
            {style.texture && (
              <div
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: noiseTexture }}
              />
            )}

            {/* Layer 3: Dynamic Sheen */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${sheenStyle.sheenX}% ${sheenStyle.sheenY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                  opacity: 0.6,
                }}
              />
            )}

            {/* Layer 4: Shimmer Sweep */}
            {style.shimmer && !prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                  backgroundPosition: '0% 50%',
                }}
                whileHover={{
                  backgroundPosition: '100% 50%',
                  transition: { duration: 1.5, ease: 'easeInOut' },
                }}
              />
            )}

            {/* Layer 5: Card Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              {/* Top Row: Logo + NFC */}
              <div className="flex items-start justify-between">
                <div>
                  <div className={cn("text-xl font-bold tracking-wide", style.textColor)}>
                    $AVE+
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Wifi className={cn("w-6 h-6 rotate-90 opacity-60", style.textColor)} />
                  <div className={cn("text-sm font-semibold", style.textColor)}>VISA</div>
                </div>
              </div>

              {/* Middle: EMV Chip */}
              <div className="flex items-center gap-6">
                <EMVChip variant={style.chipColor} />
              </div>

              {/* Bottom: Card Number & Details */}
              <div className="space-y-3">
                {/* Card Number */}
                {showDetails && (
                  <div 
                    className={cn(
                      "font-mono text-lg tracking-[0.3em] select-none",
                      style.textColor
                    )}
                    style={{
                      textShadow: style.emboss,
                    }}
                  >
                    •••• •••• •••• {cardNumber}
                  </div>
                )}

                {/* Cardholder Name & Expiry */}
                <div className="flex justify-between items-end">
                  <div>
                    {showDetails && (
                      <div 
                        className={cn(
                          "font-medium tracking-widest uppercase text-sm",
                          style.textColor
                        )}
                        style={{
                          textShadow: style.emboss,
                        }}
                      >
                        {cardHolder}
                      </div>
                    )}
                  </div>
                  {showDetails && (
                    <div className="text-right">
                      <div className={cn("text-[10px] tracking-wide uppercase opacity-60", style.textColor)}>
                        Valid Thru
                      </div>
                      <div 
                        className={cn(
                          "font-mono text-sm tracking-wider",
                          style.textColor
                        )}
                        style={{
                          textShadow: style.emboss,
                        }}
                      >
                        {expiryDate}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Flip indicator */}
              {isFlippable && (
                <motion.div 
                  className={cn(
                    "absolute bottom-2 right-2 text-xs opacity-0 group-hover:opacity-60 transition-opacity",
                    style.textColor
                  )}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Tap to flip
                </motion.div>
              )}
            </div>

            {/* Layer 6: Glass Highlight */}
            <div
              className="absolute top-0 left-0 w-1/2 h-1/2 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              }}
            />
          </div>
        </div>

        {/* BACK FACE */}
        <div 
          className="absolute inset-0 rounded-2xl"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Base Surface */}
          <div className={cn("absolute inset-0 rounded-2xl", style.base)} />

          {/* Magnetic Stripe */}
          <div className={cn(
            "absolute top-6 left-0 right-0 h-12",
            variant === 'matte-black' ? 'bg-black' :
            variant === 'matte-white' ? 'bg-gray-700' :
            variant === 'metallic-gold' ? 'bg-gradient-to-r from-yellow-900 to-yellow-950' :
            'bg-gradient-to-r from-gray-700 to-gray-800'
          )}
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
            }}
          />

          {/* Signature Panel & CVV */}
          <div className="absolute top-24 left-6 right-6 space-y-3">
            {/* Signature Panel */}
            <div 
              className={cn(
                "h-10 rounded px-3 flex items-center relative overflow-hidden",
                variant === 'matte-black' ? 'bg-[#FFF8E7]' :
                variant === 'matte-white' ? 'bg-white' :
                variant === 'metallic-gold' ? 'bg-[#FFF8E7] border border-yellow-800/20' :
                'bg-white border border-gray-300'
              )}
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(0,0,0,0.02) 10px,
                  rgba(0,0,0,0.02) 20px
                )`
              }}
            >
              <div className={cn(
                "text-xs italic opacity-40",
                variant === 'metallic-gold' ? 'text-yellow-900' : 'text-gray-600'
              )}>
                Authorized Signature
              </div>
            </div>

            {/* CVV & Security Text */}
            <div className="flex justify-between items-start">
              <div className={cn(
                "text-[9px] uppercase tracking-wide max-w-[180px] leading-tight",
                style.textColor,
                "opacity-60"
              )}>
                Authorized signature - Not valid unless signed
              </div>
              
              {showDetails && (
                <div 
                  className={cn(
                    "bg-white px-3 py-1.5 rounded",
                    "border"
                  )}
                  style={{
                    borderColor: variant === 'metallic-gold' ? '#B38728' : 
                                 variant === 'metallic-silver' ? '#B0B0B0' : 
                                 'rgba(0,0,0,0.1)'
                  }}
                >
                  <div className="text-[8px] text-gray-500 mb-0.5">CVV</div>
                  <div className="font-mono text-sm text-gray-900 font-bold tracking-wider">
                    {cvv}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hologram Strip */}
          <div 
            className="absolute bottom-6 left-6 right-6 h-8 rounded-sm overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #0080ff, #ff0080)',
              backgroundSize: '200% 100%',
              opacity: 0.7,
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
            }}
          />

          {/* Network Logo */}
          <div className="absolute top-6 right-6">
            <div className={cn(
              "text-xs font-bold tracking-wider",
              style.textColor
            )}>
              VISA ®
            </div>
          </div>

          {/* Small print */}
          <div className={cn(
            "absolute bottom-2 left-6 right-6 text-[8px] opacity-40 text-center",
            style.textColor
          )}>
            This card is property of $AVE+ Bank. If found, please return.
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
