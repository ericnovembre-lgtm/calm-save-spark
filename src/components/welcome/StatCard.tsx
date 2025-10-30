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
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)] border border-border/50 transition-all hover:shadow-[var(--shadow-soft)] group overflow-hidden cursor-pointer"
    >
      {/* Animated gradient overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/20 to-accent/0 opacity-0 group-hover:opacity-100"
        initial={false}
        transition={{ duration: 0.5 }}
      />
      
      <div className="relative z-10">
        {icon && (
          <motion.div 
            className="mb-4 text-foreground"
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
        )}
        <motion.p 
          className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 tabular-nums"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {value}
        </motion.p>
        <p className="text-xs md:text-sm text-muted-foreground font-medium">{label}</p>
      </div>
    </motion.div>
  );
};
