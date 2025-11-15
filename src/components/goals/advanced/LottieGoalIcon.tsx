import { useEffect, useRef, useState } from 'react';
import { Target, Home, Car, Plane, GraduationCap, Heart, Sparkles } from 'lucide-react';

interface LottieGoalIconProps {
  goalType?: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

/**
 * Animated goal icons with fallback to Lucide icons
 * In production, replace with actual Lottie animations
 */
export const LottieGoalIcon = ({ 
  goalType = 'general',
  size = 48,
  className = '',
  animate = true
}: LottieGoalIconProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Map goal types to icons
  const iconMap: Record<string, any> = {
    emergency: Target,
    home: Home,
    vacation: Plane,
    car: Car,
    education: GraduationCap,
    wedding: Heart,
    general: Sparkles
  };

  const Icon = iconMap[goalType] || Sparkles;

  // Trigger animation on mount
  useEffect(() => {
    if (animate) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <div className={`
        w-full h-full flex items-center justify-center
        ${isAnimating ? 'animate-bounce' : ''}
      `}>
        <Icon 
          size={size * 0.6} 
          className="text-primary"
          strokeWidth={1.5}
        />
      </div>
      
      {/* Glow effect */}
      {isAnimating && (
        <div 
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 70%)'
          }}
        />
      )}
    </div>
  );
};

/**
 * Note: To add actual Lottie animations:
 * 1. Download Lottie JSON files from LottieFiles.com
 * 2. Place them in /public/animations/goals/
 * 3. Install lottie-react (already installed)
 * 4. Replace this component with Lottie player
 * 
 * Example:
 * import Lottie from 'lottie-react';
 * import emergencyAnimation from '/animations/goals/emergency.json';
 * 
 * <Lottie animationData={emergencyAnimation} loop={false} />
 */
