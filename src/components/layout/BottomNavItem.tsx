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
      className="flex flex-col items-center justify-center flex-1 py-2 relative"
      aria-current={isActive ? 'page' : undefined}
    >
      <motion.div
        whileTap={{ scale: 0.95 }}
        className={`
          flex flex-col items-center gap-1
          ${isActive ? 'text-foreground' : 'text-muted-foreground'}
        `}
      >
        <Icon className="w-5 h-5" />
        <span className="text-xs font-medium">{name}</span>
      </motion.div>
      {isActive && (
        <motion.div
          layoutId="activeBottomNav"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-foreground rounded-b-full"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
};
