import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface CreditEmptyStateProps {
  onAddScore?: () => void;
}

export function CreditEmptyState({ onAddScore }: CreditEmptyStateProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onAddScore) {
      onAddScore();
    } else {
      navigate('/credit');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/40">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground">Track Your Credit Score</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor your credit health and get personalized tips to improve your score.
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Track progress
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                Secure & private
              </span>
            </div>

            <Button 
              onClick={handleClick}
              size="sm"
              className="mt-2"
            >
              Add Credit Score
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
