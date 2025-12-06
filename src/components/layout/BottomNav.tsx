import { Home, TrendingUp, Target, Settings, PieChart, Trophy } from "lucide-react";
import { BottomNavItem } from "./BottomNavItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTransactionAlerts } from "@/hooks/useTransactionAlerts";
import { useGamificationBadgeCount } from "@/hooks/useGamificationBadgeCount";

const navItems = [
  { name: "Home", path: "/dashboard", icon: Home },
  { name: "Money", path: "/hubs/manage-money", icon: PieChart },
  { name: "Wealth", path: "/hubs/grow-wealth", icon: TrendingUp },
  { name: "AI", path: "/hubs/ai-insights", icon: Target },
  { name: "More", path: "/features-hub", icon: Settings },
];

export const BottomNav = () => {
  const isMobile = useIsMobile();
  const { unreadCount } = useTransactionAlerts();
  const { totalBadgeCount } = useGamificationBadgeCount();

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
      data-copilot-id="bottom-navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <div key={item.path} className="relative">
            <BottomNavItem
              name={item.name}
              path={item.path}
              icon={item.icon}
              data-copilot-id={`nav-${item.name.toLowerCase()}`}
            />
            {/* AI Insights alert badge */}
            {item.path === "/hubs/ai-insights" && unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-medium"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
            {/* Gamification badge on More menu */}
            {item.path === "/features-hub" && totalBadgeCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-amber-500 text-[10px] text-white flex items-center justify-center font-medium"
              >
                {totalBadgeCount > 9 ? '9+' : totalBadgeCount}
              </motion.span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};
