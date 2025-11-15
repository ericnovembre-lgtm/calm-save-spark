import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Brain, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CounterArgument {
  title: string;
  content: string;
  data: string;
}

interface InterventionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emotion: string;
  confidence: number;
  arguments: CounterArgument[];
  onPause: () => void;
  onContinue: () => void;
}

export function InterventionModal({
  open,
  onOpenChange,
  emotion,
  confidence,
  arguments: counterArguments,
  onPause,
  onContinue,
}: InterventionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <DialogTitle className="text-2xl">Emotional Trading Alert</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">
                  {emotion.toUpperCase()} Detected ({Math.round(confidence * 100)}% confidence)
                </p>
                <p className="text-sm text-muted-foreground">
                  Our AI has detected signs of emotional decision-making in your trading behavior.
                  Please review these data-driven counter-arguments before proceeding.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Rational Counter-Arguments
            </h4>
            {counterArguments.map((arg, index) => (
              <Card key={index} className="p-4">
                <h5 className="font-semibold text-foreground mb-2">{arg.title}</h5>
                <p className="text-sm text-muted-foreground mb-2">{arg.content}</p>
                <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                  📊 {arg.data}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onContinue}
            >
              I Understand the Risks, Continue
            </Button>
            <Button
              className="flex-1"
              onClick={onPause}
            >
              Pause & Reflect (Recommended)
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Studies show that taking a 15-minute break improves decision quality by 40%
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
