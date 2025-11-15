import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getClientUser } from "@/lib/user";
import { ArrowRight, TrendingUp, DollarSign, Zap } from "lucide-react";
import { TypewriterText } from "./TypewriterText";
import { MagneticButton } from "@/components/welcome/advanced/MagneticButton";
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
            "Growing Your Wealth"
          ]}
          className="text-[color:var(--color-accent)]"
        />
      </h1>
      
      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl relative z-10">
        Join <span className="font-bold text-foreground">50,000+ savers</span> who automatically save <span className="font-bold text-foreground">$450/month</span> on average
      </p>

      {/* How It Works - 3 Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl relative z-10 my-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <div className="text-xs font-semibold text-accent uppercase">Step 1</div>
            <div className="text-sm font-medium text-foreground">Connect Card</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <div className="text-xs font-semibold text-accent uppercase">Step 2</div>
            <div className="text-sm font-medium text-foreground">Auto Round-Up</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <div className="text-xs font-semibold text-accent uppercase">Step 3</div>
            <div className="text-sm font-medium text-foreground">Earn Rewards</div>
          </div>
        </div>
      </div>
      
      {/* Unified CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative z-10">
        {loading ? (
          <>
            <Skeleton className="h-12 w-full sm:w-[200px] rounded-lg" />
            <Skeleton className="h-12 w-full sm:w-[160px] rounded-lg" />
          </>
        ) : isAuthenticated ? (
          <Link to="/dashboard">
            <MagneticButton
              data-testid="welcome-cta"
              role="button"
              aria-label="Go to dashboard"
              variant="default"
              strength={0.4}
              radius={80}
              className="text-lg px-8 py-4 group"
            >
              Dashboard
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
          </Link>
        ) : (
          <>
            <Link to="/onboarding">
              <MagneticButton
                data-testid="welcome-cta"
                role="button"
                aria-label="Get started free"
                variant="default"
                strength={0.5}
                radius={100}
                className="text-lg px-8 py-4 group"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            </Link>
            <Link to="/pricing">
              <MagneticButton
                variant="outline"
                strength={0.3}
                radius={70}
                className="text-lg px-6 py-4"
              >
                View Pricing
              </MagneticButton>
            </Link>
          </>
        )}
      </div>
    </div>;
};