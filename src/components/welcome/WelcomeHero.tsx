import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getClientUser } from "@/lib/user";
import { ArrowRight, Sparkles } from "lucide-react";
import { TypewriterText } from "./TypewriterText";
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
  return <div className="relative flex flex-col items-start gap-6">
      <h1 data-testid="welcome-hero-title" className="font-display font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[color:var(--color-text)] leading-[1.1] tracking-tight relative z-10">
        Get Rewarded for{" "}
        <TypewriterText 
          phrases={[
            "Saving, Not Spending",
            "Building, Not Borrowing",
            "Growing, Not Owing"
          ]}
          className="text-[color:var(--color-accent)]"
        />
      </h1>
      <h2 className="font-display font-medium text-xl md:text-2xl text-muted-foreground relative z-10">
        Smart micro-savings that build real wealth
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground max-w-md relative z-10">
        Automate your savings with smart micro-transactions. Build wealth effortlessly while you live your life.
      </p>
      
      {/* Auth-aware CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative z-10">
        {loading ?
      // Loading skeletons
      <>
            <Skeleton className="h-12 w-full sm:w-[240px] rounded-lg" />
            <Skeleton className="h-12 w-full sm:w-[180px] rounded-lg" />
          </> : isAuthenticated ?
      // Authenticated user
      <Link to="/dashboard">
            <Button data-testid="welcome-cta" role="button" aria-label="Launch dashboard" variant="primary" size="lg" animated className="w-full sm:w-auto group">
              Launch Dashboard
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link> :
      // Guest user
      <>
            <Link to="/onboarding">
              <Button data-testid="welcome-cta" role="button" aria-label="Begin your journey" variant="primary" size="lg" animated className="w-full sm:w-auto group">
                <Sparkles className="mr-2 w-5 h-5" />
                Begin Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="neutral" size="lg" animated className="w-full sm:w-auto">
                Explore Plans
              </Button>
            </Link>
          </>}
      </div>
    </div>;
};