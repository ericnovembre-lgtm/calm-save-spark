import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

export const ThreatsCounter = () => {
  const prefersReducedMotion = useReducedMotion();
  const [count, setCount] = useState(1247893);
  const [sparklineData, setSparklineData] = useState([12, 19, 15, 25, 22, 30, 28, 35]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 5) + 1);
      
      setSparklineData(prev => {
        const newData = [...prev.slice(1), Math.floor(Math.random() * 20) + 20];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const maxValue = Math.max(...sparklineData);
  const points = sparklineData
    .map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <motion.div
      className="bg-green-500/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-green-500/20"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.8 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-3 h-3 text-green-500" />
        <span className="text-[10px] font-mono text-green-500/70">THREATS BLOCKED</span>
      </div>
      
      <div className="flex items-end gap-3">
        <motion.div
          key={count}
          className="text-xl font-bold text-green-500 font-mono"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {count.toLocaleString()}
        </motion.div>
        
        {/* Sparkline */}
        <svg
          viewBox="0 0 100 100"
          className="w-16 h-8"
          preserveAspectRatio="none"
        >
          <motion.polyline
            points={points}
            fill="none"
            stroke="rgb(34, 197, 94)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          
          {/* Area under curve */}
          <motion.polygon
            points={`0,100 ${points} 100,100`}
            fill="rgb(34, 197, 94)"
            fillOpacity="0.2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          />
        </svg>
      </div>
    </motion.div>
  );
};
