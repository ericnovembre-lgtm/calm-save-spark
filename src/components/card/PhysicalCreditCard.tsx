import { useState } from 'react';
import { motion, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { use3DTilt } from '@/hooks/use3DTilt';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EMVChip } from './EMVChip';
import { cn } from '@/lib/utils';

type CardVariant = 'matte-black' | 'matte-white' | 'metallic-gold' | 'metallic-silver';

// Decorative flowing lines
const FlowingLines = ({ variant }: { variant: CardVariant }) => {
  const lineColor = variant === 'matte-white' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)';
  
  return (
    <svg className="absolute top-0 left-0 w-full h-1/2 overflow-visible pointer-events-none" viewBox="0 0 214 170" preserveAspectRatio="none">
      <path d="M107,80 Q70,50 20,70" stroke={lineColor} fill="none" strokeWidth="1" />
      <path d="M107,80 Q60,40 15,50" stroke={lineColor} fill="none" strokeWidth="1" />
      <path d="M107,80 Q50,60 10,100" stroke={lineColor} fill="none" strokeWidth="1" />
      <path d="M107,80 Q140,50 190,70" stroke={lineColor} fill="none" strokeWidth="1" />
      <path d="M107,80 Q150,35 200,45" stroke={lineColor} fill="none" strokeWidth="1" />
      <path d="M107,80 Q170,60 205,100" stroke={lineColor} fill="none" strokeWidth="1" />
    </svg>
  );
};

// Wireframe globe
const WireframeGlobe = ({ variant }: { variant: CardVariant }) => {
  const strokeColor = variant === 'matte-white' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)';
  
  return (
    <svg className="w-16 h-16" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" stroke={strokeColor} fill="none" strokeWidth="1" />
      <ellipse cx="32" cy="32" rx="28" ry="10" stroke={strokeColor} fill="none" strokeWidth="0.5" />
      <ellipse cx="32" cy="32" rx="28" ry="20" stroke={strokeColor} fill="none" strokeWidth="0.5" />
      <ellipse cx="32" cy="32" rx="10" ry="28" stroke={strokeColor} fill="none" strokeWidth="0.5" />
      <ellipse cx="32" cy="32" rx="20" ry="28" stroke={strokeColor} fill="none" strokeWidth="0.5" />
      <line x1="32" y1="4" x2="32" y2="60" stroke={strokeColor} strokeWidth="0.5" />
      <line x1="4" y1="32" x2="60" y2="32" stroke={strokeColor} strokeWidth="0.5" />
    </svg>
  );
};

// Mastercard logo with official brand colors
const MastercardLogo = ({ variant }: { variant: CardVariant }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center -space-x-3">
        <div className="w-8 h-8 rounded-full" style={{ background: '#EB001B' }} />
        <div className="w-8 h-8 rounded-full" style={{ background: '#F79E1B' }} />
      </div>
      <span className="text-[8px] font-semibold tracking-wide" style={{ 
        color: variant === 'matte-white' ? '#000' : '#fff' 
      }}>
        mastercard
      </span>
    </div>
  );
};

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

// Brushed metal texture for anisotropic reflections
const brushedMetalTexture = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.01 0.5' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const variantStyles = {
  'matte-black': {
    base: 'bg-neutral-900',
    texture: true,
    textColor: 'text-gray-200',
    textShadow: '0 1px 2px rgba(255,255,255,0.1)',
    emboss: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.2)',
    chipColor: 'gold' as const,
    shimmer: false,
    edgeColor: '#1a1a1a',
    edgeColorDarker: '#0a0a0a',
    brushedMetal: false,
  },
  'matte-white': {
    base: 'bg-[#FAFAFA]',
    texture: true,
    textColor: 'text-gray-900',
    textShadow: 'none',
    emboss: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.2)',
    chipColor: 'gold' as const,
    shimmer: false,
    edgeColor: '#e5e5e5',
    edgeColorDarker: '#d4d4d4',
    brushedMetal: false,
  },
  'metallic-gold': {
    base: 'bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728]',
    texture: false,
    textColor: 'text-yellow-900',
    textShadow: 'none',
    emboss: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.2)',
    chipColor: 'gold' as const,
    shimmer: true,
    edgeColor: '#B38728',
    edgeColorDarker: '#8B6914',
    brushedMetal: true,
  },
  'metallic-silver': {
    base: 'bg-gradient-to-br from-[#E0E0E0] via-[#FFFFFF] to-[#B0B0B0]',
    texture: false,
    textColor: 'text-gray-900',
    textShadow: 'none',
    emboss: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.2)',
    chipColor: 'silver' as const,
    shimmer: true,
    edgeColor: '#A0A0A0',
    edgeColorDarker: '#808080',
    brushedMetal: true,
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

  // Motion values for advanced effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 400, damping: 25 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 400, damping: 25 });

  // Dynamic shadow system
  const shadowX = useTransform(mouseX, [-0.5, 0.5], [25, -25]);
  const shadowY = useTransform(mouseY, [-0.5, 0.5], [25, -25]);
  const dynamicShadow = useTransform(
    [shadowX, shadowY],
    ([x, y]) => `
      ${x}px ${y}px 40px rgba(0,0,0,0.35),
      ${(x as number)*0.5}px ${(y as number)*0.5}px 20px rgba(0,0,0,0.2),
      0 0 80px rgba(0,0,0,0.1)
    `
  );

  // Fresnel effect (edge brightness at angles)
  const fresnelOpacity = useTransform(
    rotateX,
    [-15, 0, 15],
    [0.4, 0, 0.4]
  );

  // Edge reflections based on tilt
  const topEdgeOpacity = useTransform(rotateX, [-15, 15], [0.4, 0]);
  const bottomEdgeOpacity = useTransform(rotateX, [-15, 15], [0, 0.4]);
  const leftEdgeOpacity = useTransform(rotateY, [-15, 15], [0, 0.3]);
  const rightEdgeOpacity = useTransform(rotateY, [-15, 15], [0.3, 0]);

  // Iridescent hologram hue shift
  const hueShift = useTransform(rotateY, [-15, 15], [0, 360]);
  const hologramOpacity = useTransform(rotateY, [-5, 0, 5], [0, 1, 0]);

  const handleFlip = () => {
    if (isFlippable) {
      setIsFlipped(!isFlipped);
    }
  };

  const enhancedHandleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseMove(e);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    rotateX.set(y * 15);
    rotateY.set(x * 15);
  };

  const enhancedHandleMouseLeave = () => {
    handleMouseLeave();
    mouseX.set(0);
    mouseY.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      className={cn("w-[214px] h-[340px] relative group", className)}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={prefersReducedMotion ? { opacity: 1, scale: 1 } : { 
        opacity: 1, 
        scale: 1,
        y: [0, -4, 0],
        rotateZ: [0, 0.3, 0],
      }}
      transition={prefersReducedMotion ? 
        { duration: 0.5, ease: [0.22, 1, 0.36, 1] } :
        { 
          opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          rotateZ: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
        }
      }
    >
      <motion.div
        className="w-full h-full rounded-2xl relative cursor-pointer"
        onMouseMove={enhancedHandleMouseMove}
        onMouseLeave={enhancedHandleMouseLeave}
        onClick={handleFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{
          ...tiltStyle,
          transformStyle: 'preserve-3d',
          boxShadow: dynamicShadow,
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
                inset 0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.15)
              `,
              backgroundSize: style.shimmer ? '200% 100%' : 'auto',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Card Edge Thickness (visible when tilted) */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow: `
                  0 2px 0 0 ${style.edgeColor},
                  0 4px 0 0 ${style.edgeColorDarker}
                `,
                transform: 'translateZ(-2px)',
              }}
            />
            {/* Layer 2: Matte Texture */}
            {style.texture && (
              <div
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
                style={{ 
                  backgroundImage: noiseTexture,
                  transform: 'translateZ(2px)',
                }}
              />
            )}

            {/* Layer 2b: Brushed Metal Texture (Anisotropic for metallic variants) */}
            {style.brushedMetal && (
              <div
                className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                style={{ 
                  backgroundImage: brushedMetalTexture,
                  transform: 'translateZ(2px) scaleX(20) scaleY(1)',
                }}
              />
            )}

            {/* Layer 3: Dynamic Sheen (Primary Specular) */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${sheenStyle.sheenX}% ${sheenStyle.sheenY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                  opacity: 0.6,
                  transform: 'translateZ(15px)',
                }}
              />
            )}

            {/* Layer 3b: Secondary Specular Highlight (Ambient) */}
            <div 
              className="absolute top-0 left-0 w-1/2 h-1/2 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.15), transparent 60%)',
                transform: 'translateZ(15px)',
              }}
            />

            {/* Layer 3c: Tertiary Rim Light */}
            <div 
              className="absolute bottom-0 right-0 w-1/3 h-1/3 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.08), transparent 50%)',
                transform: 'translateZ(15px)',
              }}
            />

            {/* Fresnel Effect (Edge Brightness at Angles) */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 40px rgba(255,255,255,0.1)',
                  opacity: fresnelOpacity,
                }}
              />
            )}

            {/* Edge Reflections Based on Tilt */}
            {!prefersReducedMotion && (
              <>
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)',
                    opacity: topEdgeOpacity,
                  }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to top, rgba(255,255,255,0.4), transparent)',
                    opacity: bottomEdgeOpacity,
                  }}
                />
                <motion.div
                  className="absolute top-0 bottom-0 left-0 w-1 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)',
                    opacity: leftEdgeOpacity,
                  }}
                />
                <motion.div
                  className="absolute top-0 bottom-0 right-0 w-1 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to left, rgba(255,255,255,0.3), transparent)',
                    opacity: rightEdgeOpacity,
                  }}
                />
              </>
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

            {/* Flowing lines - with depth */}
            <div style={{ transform: 'translateZ(2px)' }}>
              <FlowingLines variant={variant} />
            </div>

            {/* Layer 5: Card Content - Vertical Layout */}
            <div className="absolute inset-0 p-6 flex flex-col z-10">
              {/* EMV Chip - top left with enhanced depth */}
              <motion.div 
                className="mb-8"
                style={{
                  transform: 'translateZ(8px)',
                  filter: !prefersReducedMotion ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : undefined,
                }}
              >
                <EMVChip variant={style.chipColor} size="sm" />
              </motion.div>

              {/* Wireframe globe - upper center with parallax */}
              <div 
                className="flex justify-center mb-8"
                style={{ transform: 'translateZ(4px)' }}
              >
                <WireframeGlobe variant={variant} />
              </div>

              {/* Brand name - center with embossed effect */}
              <div 
                className="flex-1 flex items-center justify-center"
                style={{ transform: 'translateZ(4px)' }}
              >
                <div 
                  className={cn("text-3xl font-bold tracking-wider", style.textColor)}
                  style={{ 
                    textShadow: style.emboss,
                    letterSpacing: '0.1em'
                  }}
                >
                  $AVE+
                </div>
              </div>

              {/* Mastercard logo - bottom center with depth */}
              <div 
                className="flex justify-center"
                style={{ transform: 'translateZ(4px)' }}
              >
                <MastercardLogo variant={variant} />
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

          {/* Enhanced Magnetic Stripe with horizontal lines */}
          <div className={cn(
            "absolute top-6 left-0 right-0 h-12",
            variant === 'matte-black' ? 'bg-black' :
            variant === 'matte-white' ? 'bg-gray-700' :
            variant === 'metallic-gold' ? 'bg-gradient-to-r from-yellow-900 to-yellow-950' :
            'bg-gradient-to-r from-gray-700 to-gray-800'
          )}
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
              backgroundImage: `repeating-linear-gradient(
                0deg,
                rgba(0,0,0,0.3),
                rgba(0,0,0,0.3) 1px,
                transparent 1px,
                transparent 3px
              )`,
            }}
          />

          {/* Card Details Section */}
          <div className="absolute top-24 left-6 right-6 space-y-4">
            {/* Card Number */}
            {showDetails && (
              <div 
                className={cn(
                  "font-mono text-base tracking-[0.25em] select-none",
                  style.textColor
                )}
              >
                •••• •••• •••• {cardNumber}
              </div>
            )}

            {/* Cardholder Name & Expiry */}
            <div className="flex justify-between items-end">
              <div>
                {showDetails && (
                  <>
                    <div className={cn("text-[10px] tracking-wide uppercase opacity-60", style.textColor)}>
                      Card Holder
                    </div>
                    <div 
                      className={cn(
                        "font-medium tracking-widest uppercase text-sm",
                        style.textColor
                      )}
                    >
                      {cardHolder}
                    </div>
                  </>
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
                  >
                    {expiryDate}
                  </div>
                </div>
              )}
            </div>

            {/* Signature Panel */}
            <div 
              className={cn(
                "h-10 rounded px-3 flex items-center relative overflow-hidden mt-4",
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

          {/* Iridescent Hologram Strip with Color Shift */}
          <motion.div 
            className="absolute bottom-24 left-6 right-6 h-6 rounded-sm overflow-hidden"
            style={{
              background: !prefersReducedMotion 
                ? useTransform(hueShift, (h) => 
                    `linear-gradient(90deg, 
                      hsl(${h}, 100%, 60%), 
                      hsl(${(h as number) + 60}, 100%, 60%),
                      hsl(${(h as number) + 120}, 100%, 60%),
                      hsl(${(h as number) + 180}, 100%, 60%)
                    )`
                  )
                : 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #0080ff, #ff0080)',
              opacity: 0.7,
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
              filter: 'brightness(1.2) contrast(1.1)',
            }}
          >
            {/* Hologram dove pattern that appears at angles */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-white/40"
                style={{ opacity: hologramOpacity }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </motion.div>
            )}
          </motion.div>

          {/* Mastercard Logo - bottom center */}
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2">
            <MastercardLogo variant={variant} />
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
