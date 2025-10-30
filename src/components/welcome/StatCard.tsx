import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  delay?: number;
}

export const StatCard = ({ label, value, icon, delay = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)] border border-border transition-all hover:shadow-[var(--shadow-soft)] hover:scale-[1.02]"
    >
      {icon && <div className="mb-4 text-foreground">{icon}</div>}
      <p className="text-4xl font-display font-bold text-foreground mb-2 tabular-nums">
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
};
