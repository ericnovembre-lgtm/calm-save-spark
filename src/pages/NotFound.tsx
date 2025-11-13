import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Search, ArrowLeft, Compass, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NeutralBackground from "@/components/background/NeutralBackground";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getRouteSuggestions, getContextualHelp, type RouteSuggestion } from "@/lib/route-suggestions";
import { useRecentPages } from "@/hooks/useRecentPages";
import { announce } from "@/components/layout/LiveRegion";
import { StaggeredList } from "@/components/animations/StaggeredList";

const NotFound = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<RouteSuggestion[]>([]);
  const [contextualHelp, setContextualHelp] = useState<ReturnType<typeof getContextualHelp>>(null);
  const { pages: recentPages } = useRecentPages();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const attemptedUrl = window.location.pathname;
    console.error("404 Error: User attempted to access non-existent route:", attemptedUrl);
    
    // Announce to screen readers
    announce("Page not found. 404 error.", "assertive");
    
    // Get intelligent suggestions
    const routeSuggestions = getRouteSuggestions(attemptedUrl);
    setSuggestions(routeSuggestions);
    
    // Get contextual help
    const help = getContextualHelp(attemptedUrl);
    setContextualHelp(help);
  }, []);

  const popularLinks = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/goals", label: "Goals", icon: Compass },
    { to: "/transactions", label: "Transactions", icon: ArrowLeft },
    { to: "/help", label: "Help Center", icon: Search },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/help?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const AnimatedNumber = () => {
    if (prefersReducedMotion) {
      return <span>404</span>;
    }

    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        404
      </motion.span>
    );
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <NeutralBackground />
      
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 404 Header */}
          <div className="space-y-4">
            <h1 className="text-9xl font-display font-bold text-foreground/20">
              <AnimatedNumber />
            </h1>
            <h2 className="text-3xl font-display font-semibold text-foreground">
              Page Not Found
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
              Let's help you find what you need.
            </p>
          </div>

          {/* Intelligent Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Did you mean?
              </p>
              <StaggeredList className="grid gap-3 max-w-md mx-auto">
                {suggestions.map((suggestion) => (
                  <Link key={suggestion.path} to={suggestion.path}>
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 px-4 flex flex-col items-start gap-1 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] transition-all"
                    >
                      <span className="text-sm font-semibold">{suggestion.label}</span>
                      <span className="text-xs text-muted-foreground">{suggestion.description}</span>
                    </Button>
                  </Link>
                ))}
              </StaggeredList>
            </div>
          )}

          {/* Contextual Help */}
          {contextualHelp && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-accent/50 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {contextualHelp.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {contextualHelp.description}
              </p>
              <Link to={contextualHelp.link}>
                <Button size="sm" className="w-full">
                  Go There
                </Button>
              </Link>
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help, features, or pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 text-base"
                autoFocus
              />
            </div>
          </form>

          {/* Recent Pages */}
          {recentPages.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Recently Visited
              </p>
              <div className="grid gap-2 max-w-md mx-auto">
                {recentPages.map((page) => (
                  <Link key={page.path} to={page.path}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sm hover:bg-accent"
                    >
                      <Clock className="w-4 h-4" />
                      {page.title}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Popular Links */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Popular Pages
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {popularLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.to} to={link.to}>
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] transition-all"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Link to="/welcome">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-muted-foreground pt-8">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
