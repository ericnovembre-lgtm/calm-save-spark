import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { getTierForAmount } from '@/components/pricing/TierBadge';
import { Sparkles, DollarSign, TrendingUp, Zap, Crown } from 'lucide-react';

interface EnhancedPricingSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const TIER_MILESTONES = [
  { amount: 4, icon: Sparkles, label: 'Enhanced' },
  { amount: 8, icon: TrendingUp, label: 'Premium' },
  { amount: 13, icon: Zap, label: 'Advanced' },
  { amount: 17, icon: Crown, label: 'Enterprise' },
];

export default function EnhancedPricingSlider({
  value,
  onChange,
  min = 0,
  max = 20,
  step = 1,
}: EnhancedPricingSliderProps) {
  const prefersReducedMotion = useReducedMotion();
  const { playCoinSound } = useSoundEffects();
  const [showParticles, setShowParticles] = useState(false);
  const [particleKey, setParticleKey] = useState(0);
  const lastSoundTimeRef = useRef(0);
  const previousTierRef = useRef<string>('');

  const currentTier = getTierForAmount(value);
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback((newValues: number[]) => {
    const newValue = newValues[0];
    const newTier = getTierForAmount(newValue);
    
    // Play sound on change (debounced)
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 200) {
      playCoinSound();
      lastSoundTimeRef.current = now;
    }

    // Trigger particle burst on tier change
    if (newTier.name !== previousTierRef.current && previousTierRef.current !== '') {
      setShowParticles(true);
      setParticleKey(prev => prev + 1);
      setTimeout(() => setShowParticles(false), 800);
    }
    
    previousTierRef.current = newTier.name;
    onChange(newValue);
  }, [onChange, playCoinSound]);

  return (
    <div className="space-y-6">
      {/* Tier Milestones */}
      <div className="relative h-8 mb-2">
        {TIER_MILESTONES.map((milestone) => {
          const milestonePercentage = ((milestone.amount - min) / (max - min)) * 100;
          const isUnlocked = value >= milestone.amount;
          const Icon = milestone.icon;

          return (
            <motion.div
              key={milestone.amount}
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${milestonePercentage}%` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: isUnlocked ? 1 : 0.3,
                scale: isUnlocked ? 1 : 0.8,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <motion.div
                className={`
                  flex flex-col items-center gap-1
                  ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}
                `}
                whileHover={{ scale: 1.1 }}
              >
                <Icon className="w-5 h-5" />
                {isUnlocked && !prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0 rounded-full blur-lg opacity-50 -z-10"
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Enhanced Slider */}
      <div className="relative">
        <Slider
          value={[value]}
          onValueChange={handleChange}
          min={min}
          max={max}
          step={step}
          className="cursor-pointer relative z-10"
        />

        {/* Animated Glow on Thumb */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full blur-xl opacity-50 pointer-events-none -z-10"
            style={{
              left: `calc(${percentage}% - 16px)`,
              backgroundColor: currentTier.color,
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Particle Burst on Tier Change */}
        <AnimatePresence mode="wait">
          {showParticles && !prefersReducedMotion && (
            <motion.div
              key={particleKey}
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${percentage}%` }}
            >
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const distance = 40;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentTier.color }}
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      scale: 0,
                      opacity: 1 
                    }}
                    animate={{
                      x: Math.cos(angle) * distance,
                      y: Math.sin(angle) * distance,
                      scale: [0, 1, 0],
                      opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Value Display with Animation */}
      <div className="text-center relative">
        <motion.div
          className="inline-flex items-baseline gap-2"
          animate={!prefersReducedMotion ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
          key={value}
        >
          <DollarSign className="w-6 h-6 text-primary" />
          <motion.span
            className="text-5xl font-bold text-primary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {value}
          </motion.span>
          <span className="text-2xl text-muted-foreground font-medium">/month</span>
        </motion.div>
        
        <motion.p
          className="text-sm text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {value === 0 ? 'Free forever' : `${currentTier.name} tier`}
        </motion.p>
      </div>

      {/* Gradient Progress Bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, 
              hsl(var(--primary)) 0%, 
              ${currentTier.color} 100%
            )`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
    </div>
  );
}
