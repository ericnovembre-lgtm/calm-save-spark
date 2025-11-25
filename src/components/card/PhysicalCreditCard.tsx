import { motion } from 'framer-motion';
import { Wifi } from 'lucide-react';
import { use3DTilt } from '@/hooks/use3DTilt';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EMVChip } from './EMVChip';

type CardVariant = 'matte-black' | 'matte-white' | 'metallic-gold' | 'metallic-silver';

interface PhysicalCreditCardProps {
  variant: CardVariant;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  showDetails?: boolean;
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
    chipColor: 'gold' as const,
    shimmer: false,
  },
  'matte-white': {
    base: 'bg-[#FAFAFA]',
    texture: true,
    textColor: 'text-gray-900',
    textShadow: 'none',
    chipColor: 'gold' as const,
    shimmer: false,
  },
  'metallic-gold': {
    base: 'bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728]',
    texture: false,
    textColor: 'text-yellow-900',
    textShadow: 'none',
    chipColor: 'gold' as const,
    shimmer: true,
  },
  'metallic-silver': {
    base: 'bg-gradient-to-br from-[#E0E0E0] via-[#FFFFFF] to-[#B0B0B0]',
    texture: false,
    textColor: 'text-gray-900',
    textShadow: 'none',
    chipColor: 'silver' as const,
    shimmer: true,
  },
};

export const PhysicalCreditCard = ({
  variant,
  cardNumber = '4242',
  cardHolder = 'YOUR NAME HERE',
  expiryDate = '12/28',
  showDetails = true,
  className = '',
}: PhysicalCreditCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { tiltStyle, sheenStyle, handleMouseMove, handleMouseLeave } = use3DTilt({
    maxTilt: 12,
    perspective: 1000,
    scale: 1.03,
    stiffness: 300,
    damping: 20,
  });

  const style = variantStyles[variant];

  return (
    <motion.div
      className={`relative ${className}`}
      style={prefersReducedMotion ? {} : tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ISO ID-1 compliant card container */}
      <div
        className={`relative w-[340px] h-[214px] rounded-2xl overflow-hidden ${style.base}`}
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
        {/* Layer 2: Matte Texture (for matte variants only) */}
        {style.texture && (
          <div
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: noiseTexture }}
          />
        )}

        {/* Layer 3: Dynamic Sheen (follows cursor) */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${sheenStyle.sheenX}% ${sheenStyle.sheenY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
              opacity: 0.6,
            }}
          />
        )}

        {/* Layer 4: Shimmer Sweep (metallic only, hover) */}
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
        <div className="relative z-10 h-full p-6 flex flex-col justify-between">
          {/* Top Row: Logo + NFC */}
          <div className="flex items-start justify-between">
            <div>
              <div className={`text-xl font-bold tracking-wide ${style.textColor}`}>
                $AVE+
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Wifi className={`w-6 h-6 rotate-90 ${style.textColor} opacity-60`} />
              <div className={`text-sm font-semibold ${style.textColor}`}>VISA</div>
            </div>
          </div>

          {/* Middle: EMV Chip */}
          <div className="flex items-center gap-6">
            <EMVChip variant={style.chipColor} />
          </div>

          {/* Bottom: Card Details */}
          {showDetails && (
            <div className="space-y-3">
              {/* Card Number */}
              <div
                className={`font-mono text-lg tracking-[0.3em] select-none ${style.textColor}`}
                style={{
                  textShadow: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.2)',
                }}
              >
                •••• •••• •••• {cardNumber}
              </div>

              {/* Cardholder and Expiry */}
              <div className="flex items-end justify-between">
                <div>
                  <div className={`text-[10px] uppercase tracking-wide opacity-60 ${style.textColor}`}>
                    Valid Thru
                  </div>
                  <div
                    className={`font-mono text-sm tracking-widest ${style.textColor}`}
                    style={{
                      textShadow: style.textShadow,
                    }}
                  >
                    {expiryDate}
                  </div>
                </div>
                <div
                  className={`font-medium tracking-widest uppercase text-sm ${style.textColor}`}
                  style={{
                    textShadow: style.textShadow,
                  }}
                >
                  {cardHolder}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Layer 6: Glass Highlight (top-left subtle glow) */}
        <div
          className="absolute top-0 left-0 w-1/2 h-1/2 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          }}
        />
      </div>
    </motion.div>
  );
};
