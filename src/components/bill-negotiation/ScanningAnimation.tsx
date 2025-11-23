import { motion } from "framer-motion";

export function ScanningAnimation() {
  return (
    <div className="relative w-full h-48 bg-slate-900/50 rounded-lg overflow-hidden border border-cyan-500/20">
      {/* Document Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-24 h-24 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      {/* Scanning Laser Line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{
          y: [0, 192, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div className="absolute inset-0 blur-sm bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      </motion.div>

      {/* Pulsing Glow */}
      <motion.div
        className="absolute inset-0 border-2 border-cyan-400/30 rounded-lg"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.01, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="h-px bg-cyan-400 mb-2" />
        ))}
      </div>
    </div>
  );
}
