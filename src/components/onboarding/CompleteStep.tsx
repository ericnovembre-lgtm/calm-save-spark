import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SaveplusAnimIcon } from "@/components/icons";
import { CheckCircle } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import NeutralConfetti from "@/components/effects/NeutralConfetti";

interface CompleteStepProps {
  onComplete: () => void;
}

const CompleteStep = ({ onComplete }: CompleteStepProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Auto-redirect after showing celebration
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      <NeutralConfetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-border shadow-[var(--shadow-card)]">
          <CardContent className="p-8 md:p-12 text-center">
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <SaveplusAnimIcon 
                  name="piggy-bank" 
                  size={120}
                  className="text-primary"
                />
                <CheckCircle 
                  className="absolute -top-2 -right-2 w-12 h-12 text-primary bg-background rounded-full"
                  strokeWidth={2.5}
                />
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              You're all set! 🎉
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Your $ave+ account is ready. Let's start building your financial future together.
            </p>
            
            <div className="space-y-4">
              <Button 
                size="lg" 
                onClick={onComplete}
                className="gap-2"
                aria-label="Go to dashboard"
              >
                Go to Dashboard
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Redirecting automatically in 5 seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default CompleteStep;
