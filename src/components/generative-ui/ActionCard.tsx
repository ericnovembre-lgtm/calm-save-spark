import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  title: string;
  description: string;
  actionLabel: string;
  actionType: 'transfer' | 'freeze_card' | 'pay_bill' | 'create_goal' | 'custom';
  actionData?: Record<string, any>;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success';
  onAction?: (data: any) => Promise<void>;
}

export function ActionCard({ 
  title, 
  description, 
  actionLabel, 
  actionType, 
  actionData,
  icon,
  variant = 'default',
  onAction 
}: ActionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    if (!onAction) return;
    
    setIsLoading(true);
    try {
      await onAction({ actionType, ...actionData });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonVariant = variant === 'destructive' 
    ? 'destructive' 
    : variant === 'success' 
    ? 'default'
    : 'default';

  const cardBg = variant === 'destructive'
    ? 'bg-destructive/5 border-destructive/20'
    : variant === 'success'
    ? 'bg-primary/5 border-primary/20'
    : 'bg-card/80';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("p-4 backdrop-blur-sm border-border/50", cardBg)}>
        <div className="space-y-3">
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              {icon}
            </div>
          )}
          
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>

          <Button 
            onClick={handleAction} 
            disabled={isLoading}
            variant={buttonVariant}
            className="w-full"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              actionLabel
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
