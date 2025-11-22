import { motion } from "framer-motion";
import { AlertCircle, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BillsDueHeroProps {
  data: {
    bills: Array<{
      id: string;
      name: string;
      amount: number;
      dueDate: string;
      daysUntilDue: number;
    }>;
    totalAmount: number;
  };
  urgency: 'critical' | 'warning' | 'info';
}

export function BillsDueHero({ data, urgency }: BillsDueHeroProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const urgencyColors = {
    critical: 'from-destructive/20 to-destructive/5 border-destructive/40',
    warning: 'from-orange-500/20 to-orange-500/5 border-orange-500/40',
    info: 'from-primary/20 to-primary/5 border-primary/40',
  };

  const urgencyTextColors = {
    critical: 'text-destructive',
    warning: 'text-orange-500',
    info: 'text-primary',
  };

  return (
    <motion.div
      className={cn(
        "relative p-8 rounded-2xl border backdrop-blur-xl bg-gradient-to-br",
        urgencyColors[urgency],
        "overflow-hidden"
      )}
      animate={!prefersReducedMotion && urgency === 'critical' ? {
        boxShadow: [
          "0 0 20px hsl(var(--destructive) / 0.2)",
          "0 0 40px hsl(var(--destructive) / 0.4)",
          "0 0 20px hsl(var(--destructive) / 0.2)"
        ]
      } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={!prefersReducedMotion ? { rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.5, repeat: urgency === 'critical' ? Infinity : 0, repeatDelay: 2 }}
            >
              <AlertCircle className={cn("w-8 h-8", urgencyTextColors[urgency])} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Bills Due Soon</h2>
              <p className="text-sm text-muted-foreground">
                {data.bills.length} bill{data.bills.length !== 1 ? 's' : ''} requiring attention
              </p>
            </div>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-full font-semibold text-sm",
            "backdrop-blur-md border",
            urgency === 'critical' && 'bg-destructive/20 border-destructive/40 text-destructive',
            urgency === 'warning' && 'bg-orange-500/20 border-orange-500/40 text-orange-500',
            urgency === 'info' && 'bg-primary/20 border-primary/40 text-primary'
          )}>
            ${data.totalAmount.toFixed(2)}
          </div>
        </div>

        {/* Bills list */}
        <div className="space-y-3">
          {data.bills.slice(0, 3).map((bill, index) => (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold text-foreground">{bill.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Due in {bill.daysUntilDue} day{bill.daysUntilDue !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-bold text-foreground">{bill.amount.toFixed(2)}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/budget')}
            className="flex-1 font-semibold"
          >
            Pay Now
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/budget')}
            className="flex-1"
          >
            View All Bills
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
