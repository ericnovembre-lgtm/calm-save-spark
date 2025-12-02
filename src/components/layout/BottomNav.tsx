import { Home, TrendingUp, Target, Settings, PieChart, Plus } from "lucide-react";
import { BottomNavItem } from "./BottomNavItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", path: "/dashboard", icon: Home },
  { name: "Money", path: "/hubs/manage-money", icon: PieChart },
  { name: "Wealth", path: "/hubs/grow-wealth", icon: TrendingUp },
  { name: "AI", path: "/hubs/ai-insights", icon: Target },
  { name: "More", path: "/features-hub", icon: Settings },
];

export const BottomNav = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (!isMobile) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "glass-bg-strong backdrop-blur-xl",
        "border-t border-accent/20",
        "shadow-glass-elevated",
        "safe-area-inset-bottom"
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="relative flex items-center justify-around h-16 px-2">
        {/* Left items */}
        {navItems.slice(0, 2).map((item) => (
          <BottomNavItem
            key={item.path}
            name={item.name}
            path={item.path}
            icon={item.icon}
          />
        ))}

        {/* Center FAB Button */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="absolute left-1/2 -translate-x-1/2 -top-6"
        >
          <Button
            size="icon"
            onClick={() => navigate("/goals")}
            className="w-14 h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-glass-elevated"
            aria-label="Quick Add"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>

        {/* Right items */}
        {navItems.slice(2).map((item) => (
          <BottomNavItem
            key={item.path}
            name={item.name}
            path={item.path}
            icon={item.icon}
          />
        ))}
      </div>
    </nav>
  );
};
