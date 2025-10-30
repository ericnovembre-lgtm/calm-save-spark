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
        relative flex items-center gap-3 px-4 py-2.5 rounded-lg
        transition-colors duration-200
        ${isActive 
          ? 'bg-accent text-foreground font-medium' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{name}</span>
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-accent rounded-lg -z-10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
};
