import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Sparkles } from 'lucide-react';

interface NetWorthCounterProps {
  value: number;
  age: number;
}

export function NetWorthCounter({ value, age }: NetWorthCounterProps) {
  const getColorClass = () => {
    if (value >= 1000000) return 'text-yellow-500';
    if (value >= 500000) return 'text-green-500';
    if (value >= 100000) return 'text-amber-500';
    if (value < 0) return 'text-red-500';
    return 'text-white';
  };

  const shouldSparkle = value >= 1000000;

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-center gap-4 mb-2">
        <span className="text-sm font-mono text-white/60">Age {age}</span>
        <span className="text-white/40">|</span>
        <span className="text-sm font-mono text-white/60">Net Worth</span>
      </div>
      
      <div className="relative inline-block">
        <motion.div
          className={`text-6xl font-bold tabular-nums ${getColorClass()}`}
          style={{
            textShadow: '0 0 30px currentColor',
          }}
        >
          $<CountUp
            end={value}
            duration={1.5}
            separator=","
            decimals={0}
            preserveValue
          />
        </motion.div>

        {shouldSparkle && (
          <motion.div
            className="absolute -top-6 -right-6"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </motion.div>
        )}
      </div>

      {/* Milestone notifications */}
      {value >= 1000000 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm font-mono text-yellow-500"
        >
          🎉 Millionaire Status Achieved
        </motion.div>
      )}
      {value >= 500000 && value < 1000000 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm font-mono text-green-500"
        >
          ✨ Half Million Milestone
        </motion.div>
      )}
    </motion.div>
  );
}
