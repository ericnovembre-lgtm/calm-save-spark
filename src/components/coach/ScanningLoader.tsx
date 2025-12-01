import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ScanningLoaderProps {
  text?: string;
  className?: string;
}

export function ScanningLoader({ text = "Scanning...", className = "" }: ScanningLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div className="relative">
        {/* Main spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-command-cyan" />
        </motion.div>
        
        {/* Outer pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-command-cyan"
        />
        
        {/* Inner pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          className="absolute inset-0 rounded-full border border-command-violet"
        />

        {/* Rotating gradient backdrop */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-20px] bg-gradient-to-r from-command-cyan/20 via-transparent to-command-violet/20 blur-xl"
        />
      </div>
      
      {/* Animated text with shimmer */}
      <div className="relative">
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-white/60 font-mono"
        >
          {text}
        </motion.p>
        
        {/* Shimmer effect */}
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-command-cyan/30 to-transparent"
        />
        
        {/* Animated dots */}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="inline-block ml-1 text-command-cyan"
        >
          ...
        </motion.span>
      </div>

      {/* Progress bars */}
      <div className="w-48 space-y-2">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            className="h-1 bg-white/5 rounded-full overflow-hidden"
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay,
                ease: "easeInOut"
              }}
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-command-cyan to-transparent"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
