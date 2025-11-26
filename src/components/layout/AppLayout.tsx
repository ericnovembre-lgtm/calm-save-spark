import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Home, Target, Wallet, BarChart3, Settings, Shield, Zap, Gift, Lightbulb, CreditCard, Users, Code, Bot, DollarSign, TrendingUp, BadgeDollarSign, Trophy, Receipt, UsersRound, GraduationCap, Building2, Briefcase, BookOpen, Leaf, Plug, Heart, Search, Sparkles, Brain, Gamepad2, RefreshCw, MapPin, Coins } from "lucide-react";
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
import { getClientUser, AppUser } from "@/lib/session";
import { FEATURE_FLAGS } from "@/lib/flags";
import { supabase } from "@/integrations/supabase/client";
import { Breadcrumbs } from "./Breadcrumbs";
import { FABMenu } from "@/components/navigation/FABMenu";
import { GlobalAIAssistant } from "@/components/global-ai/GlobalAIAssistant";
import { usePageContext } from "@/hooks/usePageContext";

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
  { name: "Admin Agents", path: "/admin-agents", icon: Users },
  { name: "Admin Functions", path: "/admin-functions", icon: Code },
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
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

              <Link to="/" className="flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center"
                >
                  <span className="text-background font-bold text-sm">$+</span>
                </motion.div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-bold text-lg leading-none">$ave+</span>
                  <motion.span
                    key={taglineIndex}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
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

            {/* Right: Search, Theme, Help, User */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/search')}
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Search</span>
              </Button>
              {FEATURE_FLAGS.SEARCH_ENABLED && <SearchToggle />}
              <VoiceToggle />
              <HelpButton />
              <ThemeToggle />
              
              {user ? (
                <UserChip user={user} />
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/auth")}
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
  );
};
