import { motion } from "framer-motion";

interface ScanningLoaderProps {
  text?: string;
  className?: string;
}

/**
 * ScanningLoader - Data Futurism loading animation
 * Matrix-style scanning lines instead of generic blocks
 */
export function ScanningLoader({ text = "Analyzing...", className = "" }: ScanningLoaderProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-command-surface border border-white/10 p-6 ${className}`}>
      {/* Horizontal scan line */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-command-cyan to-transparent opacity-70"
          animate={{
            top: ["0%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Scanning lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-command-cyan to-transparent opacity-40"
            style={{ top: `${30 + i * 20}%` }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-8 bg-command-cyan rounded-full"
                animate={{
                  scaleY: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <span className="text-sm font-mono text-command-cyan">{text}</span>
        </div>

        {/* Data stream */}
        <div className="font-mono text-[8px] text-command-cyan/30 space-y-0.5 leading-tight">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              ANALYZING_SECTOR_{Math.random().toString(36).slice(2, 8).toUpperCase()}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
