import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Shield, Check } from 'lucide-react';
import { EncryptionVisualization } from './EncryptionVisualization';

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
      {/* Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-accent/10" />

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
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Visualization */}
        <div className="flex-1 min-h-[300px] md:min-h-0">
          <EncryptionVisualization />
        </div>
      </div>
    </motion.div>
  );
};
