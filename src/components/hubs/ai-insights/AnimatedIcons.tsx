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

// AI Coach - Bobbing robot with pulse ring
export const AnimatedBotIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-blue-500/20"
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Icon container */}
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-400/20"
        animate={prefersReducedMotion ? {} : { y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Bot className={`${iconClass(size)} text-blue-400`} />
      </motion.div>
    </div>
  );
};

// AI Agents - Pulsing brain with glow
export const AnimatedBrainIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-400/20"
        animate={prefersReducedMotion ? {} : { 
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 20px hsl(270 80% 60% / 0)',
            '0 0 30px hsl(270 80% 60% / 0.3)',
            '0 0 20px hsl(270 80% 60% / 0)',
          ]
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Brain className={`${iconClass(size)} text-purple-400`} />
      </motion.div>
    </div>
  );
};

// Social Sentiment - Line drawing animation
export const AnimatedActivityIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      <div className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-400/20">
        <motion.div
          animate={prefersReducedMotion ? {} : { 
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Activity className={`${iconClass(size)} text-orange-400`} />
        </motion.div>
      </div>
    </div>
  );
};

// Digital Twin - Rotating sparkles
export const AnimatedSparklesIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      {/* Orbiting particle */}
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-pink-400"
        animate={prefersReducedMotion ? {} : {
          rotate: 360,
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ 
          transformOrigin: '24px 24px',
          x: -16,
          y: -16,
        }}
      />
      
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-400/20"
        animate={prefersReducedMotion ? {} : { rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles className={`${iconClass(size)} text-pink-400`} />
      </motion.div>
    </div>
  );
};

// Analytics - Flickering lightbulb
export const AnimatedLightbulbIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-400/20"
        animate={prefersReducedMotion ? {} : {
          boxShadow: [
            '0 0 15px hsl(45 100% 50% / 0.2)',
            '0 0 25px hsl(45 100% 50% / 0.4)',
            '0 0 15px hsl(45 100% 50% / 0.2)',
          ]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Lightbulb className={`${iconClass(size)} text-yellow-400`} />
      </motion.div>
    </div>
  );
};

// Guardian - Shimmering shield
export const AnimatedShieldIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-400/20 overflow-hidden"
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={prefersReducedMotion ? {} : { x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
        />
        <Shield className={`relative z-10 ${iconClass(size)} text-red-400`} />
      </motion.div>
    </div>
  );
};

// Archive - Floating documents
export const AnimatedArchiveIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className={iconContainerClass(size)}>
      <motion.div
        className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-400/20"
        animate={prefersReducedMotion ? {} : { y: [0, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Archive className={`${iconClass(size)} text-emerald-400`} />
      </motion.div>
    </div>
  );
};
