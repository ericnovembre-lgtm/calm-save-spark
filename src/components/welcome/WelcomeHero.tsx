import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const WelcomeHero = () => {
  return (
    <div className="flex flex-col items-start gap-6">
      <h1 
        data-testid="welcome-hero-title" 
        className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight"
      >
        Save Smarter
      </h1>
      <h2 className="font-display font-semibold text-2xl md:text-3xl text-foreground">
        Navigate Your Financial Universe
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground max-w-md">
        Orbit through your savings goals with AI-powered insights and automated wealth building.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link to="/onboarding">
          <Button 
            data-testid="welcome-cta"
            role="button"
            aria-label="Begin your journey"
            size="lg"
            className="w-full sm:w-auto"
          >
            Begin Your Journey
          </Button>
        </Link>
        <div className="flex gap-4">
          <Link to="/pricing">
            <Button variant="ghost" size="lg">
              Explore Plans
            </Button>
          </Link>
          <Link to="/docs">
            <Button variant="ghost" size="lg">
              Docs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
