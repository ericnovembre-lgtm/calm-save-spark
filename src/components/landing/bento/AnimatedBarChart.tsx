import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const data = [
  { height: 80, label: 'Food', color: 'bg-accent' },
  { height: 50, label: 'Trans', color: 'bg-primary' },
  { height: 30, label: 'Ent', color: 'bg-blue-500' },
  { height: 65, label: 'Bills', color: 'bg-purple-500' },
];

export const AnimatedBarChart = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((bar, i) => (
        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-muted/30 rounded-t-lg overflow-hidden flex items-end h-full">
            <motion.div
              className={`w-full ${bar.color} rounded-t-lg`}
              initial={{ height: 0 }}
              whileInView={{ height: `${bar.height}%` }}
              viewport={{ once: true }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.8,
                delay: prefersReducedMotion ? 0 : 0.4 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{bar.label}</span>
        </div>
      ))}
    </div>
  );
};
