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
      {/* Scanning lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-command-cyan to-transparent"
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
      <div className="relative z-10 flex items-center gap-3">
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
    </div>
  );
}
