/**
 * UpcomingBillsCard - Shows upcoming recurring bills due soon
 */

import { motion } from "framer-motion";
import { CalendarClock, AlertCircle, ChevronRight } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { BentoSkeleton } from "./BentoSkeleton";
import { Button } from "@/components/ui/button";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { cn } from "@/lib/utils";
import { differenceInDays, format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface UpcomingBillsCardProps {
  delay?: number;
}

export function UpcomingBillsCard({ delay = 0 }: UpcomingBillsCardProps) {
  const navigate = useNavigate();
  const { upcomingBills, isLoading } = useSubscriptions();
  
  if (isLoading) {
    return <BentoSkeleton variant="list" />;
  }
  
  // Sort by due date and take first 4
  const sortedBills = [...(upcomingBills || [])].sort((a, b) => {
    return new Date(a.next_expected_date).getTime() - new Date(b.next_expected_date).getTime();
  }).slice(0, 4);
  
  const hasBills = sortedBills.length > 0;
  
  return (
    <BentoCard delay={delay} noPadding className="overflow-hidden">
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-accent-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Upcoming Bills</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/subscriptions')}
          >
            View All
          </Button>
        </div>
      </div>
      
      <div className="px-3 pb-3">
        {!hasBills ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-2xl bg-muted/50 mb-3">
              <CalendarClock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No upcoming bills detected</p>
            <p className="text-xs text-muted-foreground mt-1">We'll alert you when bills are due</p>
          </div>
        ) : (
          sortedBills.map((bill, index) => {
            const daysUntil = differenceInDays(new Date(bill.next_expected_date), new Date());
            const isUrgent = daysUntil <= 2;
            const isDueTomorrow = daysUntil === 1;
            const isDueToday = daysUntil === 0;
            
            return (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + (index * 0.05), duration: 0.3 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl",
                  "hover:bg-muted/50 transition-colors duration-200 group cursor-pointer",
                  isUrgent && "bg-red-500/5"
                )}
                onClick={() => navigate('/subscriptions')}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    isUrgent ? "bg-red-500/10" : "bg-accent/20"
                  )}>
                    {isUrgent ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CalendarClock className="w-4 h-4 text-accent-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{bill.merchant}</p>
                    <p className={cn(
                      "text-xs",
                      isUrgent ? "text-red-500 font-medium" : "text-muted-foreground"
                    )}>
                      {isDueToday ? "Due today" : isDueTomorrow ? "Due tomorrow" : `Due ${format(new Date(bill.next_expected_date), 'MMM d')}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold text-sm",
                    isUrgent ? "text-red-500" : "text-foreground"
                  )}>
                    ${Math.abs(bill.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </BentoCard>
  );
}
