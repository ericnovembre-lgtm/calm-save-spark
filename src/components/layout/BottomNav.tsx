import { Home, TrendingUp, Target, Settings, PieChart } from "lucide-react";
import { BottomNavItem } from "./BottomNavItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", path: "/dashboard", icon: Home },
  { name: "Budget", path: "/budget", icon: PieChart },
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Insights", path: "/insights", icon: TrendingUp },
  { name: "Settings", path: "/settings", icon: Settings },
];

export const BottomNav = () => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-md",
        "border-t border-border",
        "safe-area-inset-bottom"
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
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
