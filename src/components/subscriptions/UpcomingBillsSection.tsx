import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown } from "lucide-react";
import { BillCard } from "./BillCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Subscription {
  id: string;
  merchant: string;
  amount: number;
  frequency: string;
  next_expected_date: string;
  last_charge_date?: string;
  category?: string;
  status?: string;
  confidence?: number;
  confirmed?: boolean;
}

interface UpcomingBillsSectionProps {
  bills: Subscription[];
  onTogglePause: (id: string) => void;
  onDelete: (id: string) => void;
}

export function UpcomingBillsSection({ bills, onTogglePause, onDelete }: UpcomingBillsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (bills.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-100 dark:bg-orange-900/20 p-2">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-foreground">Due This Week</h2>
            <p className="text-sm text-muted-foreground">
              {bills.length} {bills.length === 1 ? 'bill' : 'bills'} coming up
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 space-y-3">
              {bills.map(bill => (
                <BillCard
                  key={bill.id}
                  subscription={bill}
                  onTogglePause={onTogglePause}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
