import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Bot, Brain, Activity, Sparkles, Lightbulb, Shield, Archive } from 'lucide-react';

interface AnimatedIconProps {
  size?: 'sm' | 'lg';
}

const iconContainerClass = (size: 'sm' | 'lg') => 
  `relative flex items-center justify-center ${size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'}`;

const iconClass = (size: 'sm' | 'lg') => 
  size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';

// AI Coach - Bobbing robot with pulse ring (Primary - strongest emphasis)
export const AnimatedBotIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-primary/20"
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Icon container */}
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 group-hover:scale-110 transition-transform duration-300"
        animate={prefersReducedMotion ? {} : { y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Bot className={`${iconClass(size)} text-foreground`} />
      </motion.div>
    </div>
  );
};

// AI Agents - Pulsing brain with glow (Accent - warm emphasis)
export const AnimatedBrainIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-accent/25 to-accent/10 border border-accent/25 group-hover:scale-110 transition-transform duration-300"
        animate={prefersReducedMotion ? {} : { 
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 20px hsl(var(--accent) / 0)',
            '0 0 30px hsl(var(--accent) / 0.3)',
            '0 0 20px hsl(var(--accent) / 0)',
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Brain className={`${iconClass(size)} text-foreground`} />
      </motion.div>
    </div>
  );
};

// Social Sentiment - Line drawing animation (Muted - subtle)
export const AnimatedActivityIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      <div className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-muted-foreground/15 group-hover:scale-110 transition-transform duration-300">
        <motion.div
          animate={prefersReducedMotion ? {} : { 
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Activity className={`${iconClass(size)} text-muted-foreground`} />
        </motion.div>
      </div>
    </div>
  );
};

// Digital Twin - Rotating sparkles (Primary - medium emphasis)
export const AnimatedSparklesIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      {/* Orbiting particle */}
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-accent/60"
        animate={prefersReducedMotion ? {} : {
          rotate: 360,
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ 
          transformOrigin: '24px 24px',
          x: -16,
          y: -16,
        }}
      />
      
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/15 group-hover:scale-110 transition-transform duration-300"
        animate={prefersReducedMotion ? {} : { rotate: [0, 5, -5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles className={`${iconClass(size)} text-foreground`} />
      </motion.div>
    </div>
  );
};

// Analytics - Flickering lightbulb (Accent - warm glow)
export const AnimatedLightbulbIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-accent/25 to-accent/10 border border-accent/20 group-hover:scale-110 transition-transform duration-300"
        animate={prefersReducedMotion ? {} : {
          boxShadow: [
            '0 0 15px hsl(var(--accent) / 0.2)',
            '0 0 25px hsl(var(--accent) / 0.4)',
            '0 0 15px hsl(var(--accent) / 0.2)',
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Lightbulb className={`${iconClass(size)} text-foreground`} />
      </motion.div>
    </div>
  );
};

// Guardian - Shimmering shield (Primary - protective emphasis)
export const AnimatedShieldIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/8 border border-primary/15 overflow-hidden group-hover:scale-110 transition-transform duration-300"
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
          animate={prefersReducedMotion ? {} : { x: ['-100%', '100%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
        />
        <Shield className={`relative z-10 ${iconClass(size)} text-foreground`} />
      </motion.div>
    </div>
  );
};

// Archive - Floating documents (Muted - subtle float)
export const AnimatedArchiveIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-muted/35 to-muted/15 border border-muted-foreground/15 group-hover:scale-110 transition-transform duration-300"
        animate={prefersReducedMotion ? {} : { y: [0, -2, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Archive className={`${iconClass(size)} text-muted-foreground`} />
      </motion.div>
    </div>
  );
};
