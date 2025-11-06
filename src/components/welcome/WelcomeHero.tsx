import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getClientUser } from "@/lib/user";
import { ArrowRight, Sparkles } from "lucide-react";

export const WelcomeHero = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getClientUser();
      setIsAuthenticated(!!user);
      setLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <div className="flex flex-col items-start gap-6">
      <h1 
        data-testid="welcome-hero-title" 
        className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-[color:var(--color-text)] leading-tight"
      >
        Save Smarter
      </h1>
      <h2 className="font-display font-semibold text-2xl md:text-3xl text-[color:var(--color-text)]">
        Navigate Your Financial Universe
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground max-w-md">
        Orbit through your savings goals with AI-powered insights and automated wealth building.
      </p>
      
      {/* Auth-aware CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {loading ? (
          // Loading skeletons
          <>
            <Skeleton className="h-12 w-full sm:w-[240px] rounded-lg" />
            <Skeleton className="h-12 w-full sm:w-[180px] rounded-lg" />
          </>
        ) : isAuthenticated ? (
          // Authenticated user
          <Link to="/dashboard">
            <Button 
              data-testid="welcome-cta"
              role="button"
              aria-label="Launch dashboard"
              variant="primary"
              size="lg"
              animated
              className="w-full sm:w-auto group"
            >
              Launch Dashboard
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        ) : (
          // Guest user
          <>
            <Link to="/onboarding">
              <Button 
                data-testid="welcome-cta"
                role="button"
                aria-label="Begin your journey"
                variant="primary"
                size="lg"
                animated
                className="w-full sm:w-auto group"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Begin Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button 
                variant="neutral" 
                size="lg"
                animated
                className="w-full sm:w-auto"
              >
                Explore Plans
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
