import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SaveplusAnimIcon } from "@/components/icons";
import { ArrowRight, HelpCircle } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl"
    >
      <Card className="border-border shadow-[var(--shadow-card)]">
        <CardContent className="p-8 md:p-12 text-center">
          <div className="mb-6 flex justify-center">
            <SaveplusAnimIcon 
              name="piggy-bank" 
              size={120}
              className="text-primary"
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Welcome to $ave+
            </h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>$ave+ helps you reach your financial goals with automated savings, budgeting tools, and personalized insights.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Let's set up your account and create your first savings goal. 
            This will only take a few minutes.
          </p>
          
          <div className="flex flex-col gap-4 items-center">
            <Button 
              size="lg" 
              onClick={onNext}
              className="gap-2"
              aria-label="Get started with onboarding"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              5 quick steps • 3 minutes
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeStep;
