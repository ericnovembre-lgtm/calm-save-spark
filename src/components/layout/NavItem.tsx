import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface NavItemProps {
  name: string;
  path: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

export const NavItem = ({ name, path, icon: Icon, onClick }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-200 ease-out group
        ${isActive 
          ? 'text-foreground font-medium' 
          : 'text-muted-foreground hover:text-foreground'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Icon with hover scale */}
      {Icon && (
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
        </motion.div>
      )}
      
      {/* Text */}
      <span className="text-sm relative z-10">{name}</span>
      
      {/* Active background with subtle glow */}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-accent/15 rounded-lg -z-10"
          style={{ boxShadow: "0 0 20px hsla(var(--accent), 0.2)" }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      
      {/* Gold accent underline for active state */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-accent rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      
      {/* Hover background */}
      {!isActive && (
        <div className="absolute inset-0 bg-muted opacity-0 group-hover:opacity-100 rounded-lg -z-10 transition-opacity duration-200" />
      )}
    </Link>
  );
};
