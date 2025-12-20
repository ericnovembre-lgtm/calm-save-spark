import { motion, Transition, TargetAndTransition } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { 
  UsersRound, 
  GraduationCap, 
  BookOpen, 
  Leaf, 
  Heart, 
  Briefcase, 
  MapPin, 
  Gift, 
  HeartHandshake, 
  BookMarked 
} from 'lucide-react';

interface AnimatedIconProps {
  size?: 'sm' | 'lg';
}

interface IconWrapperProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'muted';
  size?: 'sm' | 'lg';
  animateConfig?: TargetAndTransition;
  transitionConfig?: Transition;
}

// Base wrapper for all icons with brand-compliant styling
const IconWrapper = ({ 
  children, 
  variant = 'primary',
  size = 'sm',
  animateConfig,
  transitionConfig
}: IconWrapperProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  const colorConfig = {
    primary: {
      bg: 'from-primary/20 to-primary/5',
      border: 'border-primary/20',
      icon: 'text-foreground',
      glow: 'hsl(var(--primary) / 0.15)',
    },
    accent: {
      bg: 'from-accent/25 to-accent/8',
      border: 'border-accent/25',
      icon: 'text-foreground',
      glow: 'hsl(var(--accent) / 0.2)',
    },
    muted: {
      bg: 'from-muted/30 to-muted/10',
      border: 'border-muted-foreground/20',
      icon: 'text-muted-foreground',
      glow: 'hsl(var(--muted) / 0.15)',
    },
  };
  
  const config = colorConfig[variant];
  const sizeClasses = size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  
  return (
    <motion.div
      className={`${sizeClasses} rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
      style={{
        boxShadow: `0 4px 20px ${config.glow}`,
      }}
      animate={prefersReducedMotion ? undefined : animateConfig}
      transition={transitionConfig}
    >
      <div className={config.icon}>
        {children}
      </div>
    </motion.div>
  );
};

// Family - Connected pulse wave
export const FamilyIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="primary" 
      size={size} 
      animateConfig={{ scale: [1, 1.05, 1] }} 
      transitionConfig={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <UsersRound size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Student - Subtle float
export const StudentIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="accent" 
      size={size} 
      animateConfig={{ y: [0, -3, 0] }} 
      transitionConfig={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <GraduationCap size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Business OS - Briefcase subtle pulse
export const BusinessIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="primary" 
      size={size} 
      animateConfig={{ scale: [1, 1.03, 1] }} 
      transitionConfig={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Briefcase size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Financial Literacy - Page flip shimmer
export const LiteracyIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="accent" 
      size={size} 
      animateConfig={{ rotateY: [0, 5, 0, -5, 0] }} 
      transitionConfig={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <BookOpen size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Sustainability - Gentle sway/breathing
export const SustainabilityIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="accent" 
      size={size} 
      animateConfig={{ rotate: [-3, 3, -3], scale: [1, 1.02, 1] }} 
      transitionConfig={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Leaf size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Financial Health - Pulsing heartbeat
export const HealthIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="primary" 
      size={size} 
      animateConfig={{ scale: [1, 1.12, 1, 1.08, 1] }} 
      transitionConfig={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Heart size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Digital Twin - Location ping pulse
export const DigitalTwinIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="muted" 
      size={size} 
      animateConfig={{ y: [0, -2, 0], opacity: [1, 0.8, 1] }} 
      transitionConfig={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <MapPin size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Wishlist - Ribbon shimmer
export const WishlistIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="accent" 
      size={size} 
      animateConfig={{ rotate: [0, 5, 0, -5, 0] }} 
      transitionConfig={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Gift size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Couples - Synchronized pulse
export const CouplesIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="primary" 
      size={size} 
      animateConfig={{ scale: [1, 1.08, 1] }} 
      transitionConfig={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <HeartHandshake size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Financial Diary - Bookmark flip
export const DiaryIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="muted" 
      size={size} 
      animateConfig={{ rotateY: [0, 8, 0] }} 
      transitionConfig={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <BookMarked size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Milestones - Timeline dot pulse
export const MilestonesIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="accent" 
      size={size} 
      animateConfig={{ scale: [1, 1.1, 1], opacity: [1, 0.9, 1] }} 
      transitionConfig={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <MapPin size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Money Mindset - Calm breathing glow
export const MindsetIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="primary" 
      size={size} 
      animateConfig={{ scale: [1, 1.04, 1] }} 
      transitionConfig={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Heart size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};

// Community - Interconnected bounce
export const CommunityIcon = ({ size = 'sm' }: AnimatedIconProps) => {
  const iconSize = size === 'lg' ? 28 : 22;
  return (
    <IconWrapper 
      variant="accent" 
      size={size} 
      animateConfig={{ y: [0, -4, 0, -2, 0] }} 
      transitionConfig={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <UsersRound size={iconSize} strokeWidth={1.8} />
    </IconWrapper>
  );
};
