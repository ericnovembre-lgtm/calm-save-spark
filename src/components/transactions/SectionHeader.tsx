import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  count: number;
  total: number;
  className?: string;
}

export function SectionHeader({ title, count, total, className }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b border-border/50",
        "px-4 py-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {count} {count === 1 ? 'transaction' : 'transactions'}
          </Badge>
        </div>
        <div className="text-sm font-bold text-foreground">
          ${Math.abs(total).toFixed(2)}
        </div>
      </div>
    </motion.div>
  );
}
