import { Home, TrendingUp, Target, Settings, PieChart, Plus, Bell } from "lucide-react";
import { BottomNavItem } from "./BottomNavItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTransactionAlerts } from "@/hooks/useTransactionAlerts";
import { haptics } from "@/lib/haptics";

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
  const location = useLocation();
  const { unreadCount } = useTransactionAlerts();

  if (!isMobile) return null;

  const handleNavTap = (path: string) => {
    haptics.vibrate('light');
    navigate(path);
  };

  const handleFabTap = () => {
    haptics.vibrate('medium');
    navigate("/goals");
  };

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
      data-copilot-id="bottom-navigation"
    >
      <div className="relative flex items-center justify-around h-16 px-2">
        {/* Left items */}
        {navItems.slice(0, 2).map((item) => (
          <BottomNavItem
            key={item.path}
            name={item.name}
            path={item.path}
            icon={item.icon}
            data-copilot-id={`nav-${item.name.toLowerCase()}`}
          />
        ))}

        {/* Center FAB Button */}
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="absolute left-1/2 -translate-x-1/2 -top-6"
        >
          <Button
            size="icon"
            onClick={handleFabTap}
            className="w-14 h-14 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-glass-elevated"
            aria-label="Quick Add"
            data-copilot-id="quick-add-button"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>

        {/* Right items with notification badge */}
        {navItems.slice(2).map((item) => (
          <div key={item.path} className="relative">
            <BottomNavItem
              name={item.name}
              path={item.path}
              icon={item.icon}
            />
            {/* Notification badge for AI hub */}
            {item.path === "/hubs/ai-insights" && unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-medium"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};
