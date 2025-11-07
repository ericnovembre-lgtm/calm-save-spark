import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ArrowLeft, Zap, HelpCircle } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { toast } from "sonner";
import { trackAutomationToggled } from "@/lib/analytics";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AutomationStepProps {
  userId: string;
  onNext: (data?: { skipStep?: boolean }) => void;
  onPrevious: () => void;
}

const AutomationStep = ({ userId, onNext, onPrevious }: AutomationStepProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [roundUp, setRoundUp] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('automation_settings')
        .insert({
          user_id: userId,
          auto_save_enabled: autoSave,
          round_up_enabled: roundUp,
        });

      if (error) throw error;

      if (autoSave) trackAutomationToggled('auto_save', true);
      if (roundUp) trackAutomationToggled('round_up', true);
      
      toast.success("Automation settings saved!");
      onNext();
    } catch (error) {
      console.error('Error saving automation settings:', error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onNext({ skipStep: true });
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl"
    >
      <Card className="border-border shadow-[var(--shadow-card)]">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl font-display">Automate your savings</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Automation makes saving effortless. Enable features that work in the background to help you save without thinking about it.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>
            Set up automatic features to help you save effortlessly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex-1">
                <Label htmlFor="auto-save" className="text-base font-semibold cursor-pointer">
                  Auto-Save
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically transfer a fixed amount to your savings goals each week
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
                aria-label="Enable auto-save feature"
              />
            </div>

            <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex-1">
                <Label htmlFor="round-up" className="text-base font-semibold cursor-pointer">
                  Round-Up Savings
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Round up your purchases to the nearest dollar and save the difference
                </p>
              </div>
              <Switch
                id="round-up"
                checked={roundUp}
                onCheckedChange={setRoundUp}
                aria-label="Enable round-up savings feature"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="gap-2"
              aria-label="Go back to previous step"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              aria-label="Skip automation setup"
            >
              Skip for now
            </Button>
            
            <Button
              onClick={handleContinue}
              disabled={isLoading}
              className="flex-1 gap-2"
              aria-label="Save automation settings and continue"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AutomationStep;
