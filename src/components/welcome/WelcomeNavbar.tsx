/**
 * @fileoverview Welcome Page Navigation Bar
 * Sticky navigation with logo, nav links, and auth buttons
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SaveplusAnimIcon } from "@/components/icons";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const WelcomeNavbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[color:var(--color-border)] bg-background/80 backdrop-blur-lg">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <SaveplusAnimIcon name="logo" size={32} decorative />
          <span className="font-display font-bold text-xl text-foreground">$ave+</span>
        </Link>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
            Features
          </a>
          <Link to="/pricing" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
            Pricing
          </Link>
          <a href="#how-it-works" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
            How It Works
          </a>
          {isAuthenticated && (
            <Link to="/ai-agents" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              AI Agents
            </Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="default" size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/onboarding">
                <Button variant="default" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
