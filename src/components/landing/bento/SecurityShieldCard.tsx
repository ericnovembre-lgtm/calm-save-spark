import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Shield, Check } from 'lucide-react';
import { HexGridPattern } from './HexGridPattern';
import { FloatingBadges } from './FloatingBadges';
import { ThreatsCounter } from './ThreatsCounter';
import { LightRays } from './LightRays';

export const SecurityShieldCard = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="h-full p-6 rounded-3xl bg-card border border-border backdrop-blur-xl overflow-hidden relative"
      whileHover={prefersReducedMotion ? {} : {
        boxShadow: '0 20px 40px -10px hsl(var(--accent) / 0.3)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Hex Grid Background Pattern */}
      <HexGridPattern />
      
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-accent/10" />

      {/* Light Rays */}
      <LightRays />

      {/* Floating Certification Badges */}
      <FloatingBadges />

      <div className="relative z-10 flex flex-col md:flex-row gap-6 h-full">
        {/* Left Column - Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start gap-3 mb-6">
              <div className="p-2 rounded-xl bg-green-500/10 text-green-500 flex-shrink-0">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-foreground">Bank-Level Security</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your money is always protected
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {['256-bit Encryption', 'Two-Factor Auth', 'FDIC Insured'].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Threats Counter - Positioned at bottom left */}
          <div className="mt-6 md:mt-0">
            <ThreatsCounter />
          </div>
        </div>

        {/* Right Column - Shield Visualization */}
        <div className="flex-1 flex items-center justify-center relative min-h-[300px] md:min-h-0">
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <Shield className="w-32 h-32 text-green-500" strokeWidth={1.5} />
            
            {/* Check Mark */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
            >
              <Check className="w-16 h-16 text-green-500" strokeWidth={3} />
            </motion.div>

            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 -z-10 blur-2xl opacity-50"
              animate={prefersReducedMotion ? {} : {
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                background: 'radial-gradient(circle, rgb(34 197 94) 0%, transparent 70%)',
              }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
