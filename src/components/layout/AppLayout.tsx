import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Home, Target, Wallet, BarChart3, Settings, Shield, Zap, Gift, Lightbulb, CreditCard, Users, Code, Bot, DollarSign, TrendingUp, BadgeDollarSign, Trophy, Receipt, UsersRound, GraduationCap, Building2, Briefcase, BookOpen, Leaf, Plug, Heart, Search, Sparkles, Brain, Gamepad2, RefreshCw, MapPin, Coins, Activity, ShieldCheck, Map } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HelpButton } from "@/components/dashboard/HelpButton";
import { announce } from "./LiveRegion";
import { NavItem } from "./NavItem";
import { BottomNavItem } from "./BottomNavItem";
import { SearchToggle } from "./SearchToggle";
import { VoiceToggle } from "./VoiceToggle";
import { UserChip } from "./UserChip";
import { MobileDrawer } from "./MobileDrawer";
import { NotificationBell } from "./NotificationBell";
import { QuickStatsChip } from "./QuickStatsChip";
import { getClientUser, AppUser } from "@/lib/session";
import { FEATURE_FLAGS } from "@/lib/flags";
import { supabase } from "@/integrations/supabase/client";
import { Breadcrumbs } from "./Breadcrumbs";
import { FABMenu } from "@/components/navigation/FABMenu";
import { GlobalAIAssistant } from "@/components/global-ai/GlobalAIAssistant";
import { usePageContext } from "@/hooks/usePageContext";
import { RedAlertOverlay } from "@/components/guardian/RedAlertOverlay";
import { useSettingsStore } from "@/stores/settingsStore";
import { OfflineSyncIndicator } from "@/components/pwa";

const taglines = [
  "Navigate Your Financial Universe",
  "Intelligent Savings, Simplified",
  "Your Money, Amplified",
  "Save Smarter, Live Better"
];

const mainNavLinks = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Manage Money", path: "/hubs/manage-money", icon: Wallet },
  { name: "Grow Wealth", path: "/hubs/grow-wealth", icon: TrendingUp },
  { name: "AI & Insights", path: "/hubs/ai-insights", icon: Brain },
  { name: "Lifestyle", path: "/hubs/lifestyle", icon: Heart },
  { name: "Premium", path: "/hubs/premium", icon: Sparkles },
];

const quickAccessLinks = [
  { name: "Goals", path: "/goals", icon: Target },
  { name: "Budget", path: "/budget", icon: BarChart3 },
  { name: "Coach", path: "/coach", icon: Bot },
  { name: "Accounts", path: "/accounts", icon: Wallet },
];

const bottomNavLinks = [
  { name: "Dashboard", path: "/dashboard", icon: Home },
  { name: "Money", path: "/hubs/manage-money", icon: Wallet },
  { name: "Wealth", path: "/hubs/grow-wealth", icon: TrendingUp },
  { name: "AI", path: "/hubs/ai-insights", icon: Brain },
  { name: "More", path: "/features-hub", icon: Sparkles },
];

const adminNavLinks = [
  { name: "Admin", path: "/admin", icon: Shield },
  { name: "Admin Monitoring", path: "/admin-monitoring", icon: Activity },
  { name: "Security Monitoring", path: "/security-monitoring", icon: ShieldCheck },
  { name: "Claude Monitoring", path: "/claude-monitoring", icon: Bot },
  { name: "Sitemap", path: "/sitemap", icon: Map },
  { name: "Page Analytics", path: "/page-analytics", icon: BarChart3 },
];

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Track page context for AI assistant
  usePageContext();

  useEffect(() => {
    getClientUser().then(setUser);
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin role:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const routeName = location.pathname.split('/')[1] || 'home';
    announce(`Navigating to ${routeName}`);
  }, [location.pathname]);

  const allNavLinks = [
    ...mainNavLinks,
    ...quickAccessLinks,
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "Subscription", path: "/subscription", icon: CreditCard },
    ...(isAdmin && FEATURE_FLAGS.ADMIN_FEATURES_ENABLED ? adminNavLinks : []),
  ];

    return (
    <>
      <RedAlertOverlay />
      <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-bg-strong backdrop-blur-xl border-b border-accent/20 shadow-glass">
        {/* Premium gradient accent line */}
        <div className="h-0.5 bg-gradient-accent" />
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <Link to="/" className="flex items-center gap-2 group">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.05 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center relative"
                  style={{ boxShadow: "0 0 20px hsla(var(--accent), 0.3)" }}
                >
                  <span className="text-background font-bold text-sm">$+</span>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-accent"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                </motion.div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-bold text-lg leading-none group-hover:text-accent transition-colors">$ave+</span>
                  <motion.span
                    key={taglineIndex}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="text-[10px] text-muted-foreground leading-none"
                  >
                    {taglines[taglineIndex]}
                  </motion.span>
                </div>
              </Link>
            </div>

            {/* Center: Main Nav (desktop) */}
            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {mainNavLinks.slice(0, 5).map((link) => (
                <NavItem
                  key={link.path}
                  name={link.name}
                  path={link.path}
                  icon={link.icon}
                />
              ))}
            </nav>

            {/* Right: Quick Stats, Actions, User */}
            <div className="flex items-center gap-3">
              {/* Quick Stats Chip */}
              {user && <QuickStatsChip />}

              {/* Divider */}
              {user && <div className="hidden lg:block h-6 w-px bg-border" />}

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/search')}
                  className="hover:bg-accent/10"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </Button>
                {user && <NotificationBell />}
                <VoiceToggle />
                <HelpButton />
                <ThemeToggle />
              </div>

              {/* Divider */}
              <div className="hidden md:block h-6 w-px bg-border" />
              
              {/* User Chip */}
              {user ? (
                <UserChip user={user} />
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        navLinks={allNavLinks}
        user={user}
      />

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-6">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs />
        </div>
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>

      {/* FAB Menu */}
      <FABMenu />

      {/* Global AI Assistant */}
      <GlobalAIAssistant />

      {/* Offline Sync Indicator */}
      <OfflineSyncIndicator />

      {/* Bottom Navigation (mobile) */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border lg:hidden"
        role="navigation"
        aria-label="Bottom navigation"
      >
        <div className="flex items-center justify-around h-16">
          {bottomNavLinks.map((link) => (
            <BottomNavItem
              key={link.path}
              name={link.name}
              path={link.path}
              icon={link.icon}
            />
          ))}
        </div>
      </nav>
      </div>
    </>
  );
};
