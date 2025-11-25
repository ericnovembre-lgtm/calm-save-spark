import { motion } from "framer-motion";

export function SpendingHeatmapLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute bottom-6 left-6 bg-background/95 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-xl z-10"
    >
      <h4 className="text-xs font-semibold text-foreground mb-3">
        Spending Intensity
      </h4>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Low</span>
        
        <div className="flex gap-1">
          <div className="w-6 h-4 rounded-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }} />
          <div className="w-6 h-4 rounded-sm" style={{ backgroundColor: 'rgba(168, 85, 247, 0.5)' }} />
          <div className="w-6 h-4 rounded-sm" style={{ backgroundColor: 'rgba(236, 72, 153, 0.7)' }} />
          <div className="w-6 h-4 rounded-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)' }} />
        </div>
        
        <span className="text-xs text-muted-foreground">High</span>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Transaction location</span>
        </div>
      </div>
    </motion.div>
  );
}
