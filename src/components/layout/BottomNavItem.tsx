import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface BottomNavItemProps {
  name: string;
  path: string;
  icon: LucideIcon;
}

export const BottomNavItem = ({ name, path, icon: Icon }: BottomNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className="flex flex-col items-center justify-center flex-1 py-2 relative group"
      aria-current={isActive ? 'page' : undefined}
    >
      <motion.div
        whileTap={{ scale: 0.9 }}
        className={`
          flex flex-col items-center gap-1 transition-colors duration-200
          ${isActive ? 'text-foreground' : 'text-muted-foreground'}
        `}
      >
        {/* Icon with morph animation */}
        <motion.div
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
        
        {/* Label */}
        <motion.span 
          className="text-xs font-medium"
          animate={isActive ? { opacity: 1 } : { opacity: 0.7 }}
        >
          {name}
        </motion.span>
      </motion.div>
      
      {/* Active indicator - pill shape instead of line */}
      {isActive && (
        <motion.div
          layoutId="activeBottomNav"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full"
          style={{
            background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent)))",
            boxShadow: "0 0 12px hsla(var(--accent), 0.5)"
          }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      
      {/* Hover glow effect */}
      {!isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-accent/5 opacity-0 group-hover:opacity-100 -z-10"
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  );
};
