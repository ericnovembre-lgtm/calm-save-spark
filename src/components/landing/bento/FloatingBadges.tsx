import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Shield, Lock, Award } from 'lucide-react';

const badges = [
  { name: 'PCI DSS', icon: Lock, x: 15, y: 20 },
  { name: 'SOC 2', icon: Shield, x: 75, y: 30 },
  { name: 'ISO 27001', icon: Award, x: 85, y: 70 },
];

export const FloatingBadges = () => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {badges.map((badge, i) => (
          <div
            key={badge.name}
            className="absolute bg-green-500/10 backdrop-blur-sm rounded-lg px-2 py-1 border border-green-500/20"
            style={{ left: `${badge.x}%`, top: `${badge.y}%` }}
          >
            <div className="flex items-center gap-1">
              <badge.icon className="w-3 h-3 text-green-500" />
              <span className="text-[10px] font-mono text-green-500">{badge.name}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {badges.map((badge, i) => {
        const orbitRadius = 120 + i * 20;
        const angle = (i * 120) * (Math.PI / 180);
        
        return (
          <motion.div
            key={badge.name}
            className="absolute bg-green-500/10 backdrop-blur-sm rounded-lg px-2 py-1 border border-green-500/20"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: [
                Math.cos(angle) * orbitRadius,
                Math.cos(angle + Math.PI) * orbitRadius,
                Math.cos(angle) * orbitRadius,
              ],
              y: [
                Math.sin(angle) * orbitRadius,
                Math.sin(angle + Math.PI) * orbitRadius,
                Math.sin(angle) * orbitRadius,
              ],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <motion.div
              className="flex items-center gap-1"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              <badge.icon className="w-3 h-3 text-green-500" />
              <span className="text-[10px] font-mono text-green-500">{badge.name}</span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};
