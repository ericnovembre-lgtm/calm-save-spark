import { motion } from "framer-motion";

export function ScanningAnimation() {
  return (
    <div className="relative w-full h-48 bg-muted/20 rounded-2xl overflow-hidden border border-border">
      {/* Document Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-24 h-24 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      {/* Scanning Line - subtle accent gradient */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"
        animate={{ y: [0, 192, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />

      {/* Pulsing Border */}
      <motion.div
        className="absolute inset-0 border-2 border-accent/20 rounded-2xl"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}
