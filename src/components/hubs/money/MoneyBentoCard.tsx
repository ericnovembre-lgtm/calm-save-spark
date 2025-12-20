import { useRef, useState, ReactNode } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AnimatedIconMap, AnimatedIconName } from './ManageMoneyAnimatedIcons';

interface MoneyBentoCardProps {
  title: string;
  description: string;
  path: string;
  iconName: AnimatedIconName;
  className?: string;
}

// Background effects for specific card types
const CardBackgroundEffect = ({ type }: { type: string }) => {
  switch (type) {
    case 'Budget':
      return <BudgetBackground />;
    case 'Transactions':
      return <TransactionsBackground />;
    case 'Subscriptions':
      return <SubscriptionsBackground />;
    case 'Debts':
      return <DebtsBackground />;
    default:
      return null;
  }
};

// Budget card: Subtle bar chart
function BudgetBackground() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-around px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      {[40, 65, 80, 50, 70].map((height, i) => (
        <motion.div
          key={i}
          className="w-3 bg-primary/10 rounded-t"
          initial={{ height: 0 }}
          whileInView={{ height: `${height}%` }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

// Transactions card: Scrolling receipt lines
function TransactionsBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <motion.div
        className="space-y-2 px-4"
        animate={{ y: [0, -100] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-1 bg-muted/20 rounded" style={{ width: `${40 + Math.random() * 30}%` }} />
            <div className="h-1 bg-primary/10 rounded w-12" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Subscriptions card: Pulsing ring
function SubscriptionsBackground() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <motion.div
        className="w-32 h-32 rounded-full border-2 border-primary/10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  );
}

// Debts card: Shield glow
function DebtsBackground() {
  return (
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24"
        animate={{ 
          boxShadow: [
            '0 0 20px hsl(var(--primary) / 0.1)',
            '0 0 40px hsl(var(--primary) / 0.2)',
            '0 0 20px hsl(var(--primary) / 0.1)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ borderRadius: '50%' }}
      />
    </div>
  );
}

export function MoneyBentoCard({
  title,
  description,
  path,
  iconName,
  className,
}: MoneyBentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Spring physics for magnetic effect
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(useMotionValue(0), springConfig);
  const y = useSpring(useMotionValue(0), springConfig);
  const rotateX = useSpring(useMotionValue(0), springConfig);
  const rotateY = useSpring(useMotionValue(0), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Magnetic translation (subtle)
    x.set(mouseX * 0.08);
    y.set(mouseY * 0.08);

    // 3D rotation effect
    rotateX.set(mouseY * -0.02);
    rotateY.set(mouseX * 0.02);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
    setIsHovered(false);
  };

  const IconComponent = AnimatedIconMap[iconName];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ 
        x, 
        y, 
        rotateX, 
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={cn("group", className)}
    >
      <Link
        to={path}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-3xl"
      >
        <div
          className={cn(
            "relative overflow-hidden h-full",
            "p-5 md:p-6 lg:p-7",
            "rounded-3xl",
            // Frosted acrylic texture
            "backdrop-blur-2xl bg-card/30",
            // Highly reflective border
            "border border-white/20",
            // Inner glow
            "shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]",
            // Outer shadow on hover
            "hover:shadow-xl hover:shadow-primary/10",
            // Smooth transitions
            "transition-all duration-300",
            // Active state
            "active:scale-[0.98]"
          )}
        >
          {/* Gradient overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Edge glow effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{
              boxShadow: 'inset 0 0 40px rgba(255,255,255,0.05)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* Background effect based on card type */}
          <CardBackgroundEffect type={title} />

          {/* Content */}
          <div className="relative z-10">
            {/* Animated Icon */}
            <motion.div
              className="mb-4 md:mb-5"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {IconComponent && (
                <IconComponent 
                  size={48} 
                  className="drop-shadow-[0_4px_12px_hsl(var(--primary)/0.2)]"
                />
              )}
            </motion.div>

            {/* Title */}
            <h3 className={cn(
              "font-semibold mb-2",
              "text-base md:text-lg lg:text-xl",
              "group-hover:text-primary transition-colors duration-300"
            )}>
              {title}
            </h3>

            {/* Description */}
            <p className={cn(
              "text-muted-foreground",
              "text-xs md:text-sm",
              "line-clamp-2"
            )}>
              {description}
            </p>

            {/* Arrow indicator */}
            <motion.div
              className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 hidden sm:flex"
              initial={{ x: -10 }}
              animate={{ x: isHovered ? 0 : -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                <motion.span
                  className="text-primary text-sm font-semibold"
                  animate={{ x: isHovered ? [0, 3, 0] : 0 }}
                  transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                >
                  →
                </motion.span>
              </div>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default MoneyBentoCard;
