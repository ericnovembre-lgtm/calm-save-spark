import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TacticalCardProps {
  children: ReactNode;
  hasAlert?: boolean;
  glowColor?: "cyan" | "emerald" | "amber" | "red";
  scanlines?: boolean;
  className?: string;
}

export function TacticalCard({
  children,
  hasAlert = false,
  glowColor = "cyan",
  scanlines = true,
  className,
}: TacticalCardProps) {
  const glowColors = {
    cyan: "border-cyan-500/30 shadow-cyan-500/10",
    emerald: "border-emerald-500/30 shadow-emerald-500/10",
    amber: "border-amber-500/30 shadow-amber-500/10",
    red: "border-red-500/30 shadow-red-500/10",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden bg-slate-900 border-2 transition-all duration-300",
          glowColors[glowColor],
          hasAlert && "ring-2 ring-amber-500/50",
          className
        )}
      >
        {/* Tactical Corner Brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-slate-600/50" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-slate-600/50" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-slate-600/50" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-slate-600/50" />

        {/* Scanlines Overlay */}
        {scanlines && (
          <div className="absolute inset-0 pointer-events-none opacity-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`h-px bg-${glowColor}-400 mb-4`} />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </Card>
    </motion.div>
  );
}
