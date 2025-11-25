import { motion } from 'framer-motion';

interface PremiumEnvelopeProps {
  phase: 'sealed' | 'breaking' | 'opening' | 'open';
  onSealBreak?: () => void;
}

export function PremiumEnvelope({ phase, onSealBreak }: PremiumEnvelopeProps) {
  return (
    <div className="relative w-[400px] h-[280px]">
      {/* Envelope Body */}
      <motion.div
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)',
          boxShadow: `
            0 20px 60px rgba(0,0,0,0.3),
            0 5px 15px rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.1)
          `,
        }}
      >
        {/* Subtle Texture */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* $AVE+ Branding */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-4xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent mb-2"
                 style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.05em' }}>
              $AVE+
            </div>
            <div className="text-xs text-muted-foreground tracking-widest">
              EXCLUSIVE METAL CARD
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Top Flap */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[140px] origin-top"
        style={{
          background: 'linear-gradient(145deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        }}
        animate={
          phase === 'sealed' || phase === 'breaking'
            ? { rotateX: 0 }
            : phase === 'opening'
            ? { rotateX: -90 }
            : { rotateX: -160 }
        }
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Wax Seal */}
      {(phase === 'sealed' || phase === 'breaking') && (
        <motion.div
          className="absolute top-[90px] left-1/2 -translate-x-1/2 z-20"
          initial={{ scale: 1 }}
          animate={phase === 'breaking' ? { scale: [1, 1.1, 0], opacity: [1, 1, 0] } : {}}
          transition={{ duration: 0.4 }}
          onAnimationComplete={() => {
            if (phase === 'breaking' && onSealBreak) {
              onSealBreak();
            }
          }}
        >
          <div className="relative w-16 h-16">
            {/* Seal Base */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(145deg, #B38728 0%, #D4AF37 50%, #8B6914 100%)',
                boxShadow: `
                  0 4px 8px rgba(0,0,0,0.3),
                  inset 0 2px 4px rgba(255,255,255,0.3),
                  inset 0 -2px 4px rgba(0,0,0,0.3)
                `,
              }}
            />
            {/* $ Symbol */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white/80" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                $
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
