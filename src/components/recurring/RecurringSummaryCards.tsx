import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Repeat, CheckCircle, Calendar } from "lucide-react";
import { RecurringSummary } from "@/hooks/useRecurringTransactions";

interface RecurringSummaryCardsProps {
  summary: RecurringSummary;
}

export function RecurringSummaryCards({ summary }: RecurringSummaryCardsProps) {
  const cards = [
    {
      label: "Monthly Total",
      value: summary.totalMonthly,
      icon: DollarSign,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      prefix: "$",
      format: true,
    },
    {
      label: "Active Recurring",
      value: summary.totalCount,
      icon: Repeat,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      suffix: " payments",
    },
    {
      label: "High Confidence",
      value: summary.highConfidenceCount,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      suffix: " detected",
    },
    {
      label: "Due This Month",
      value: summary.upcomingThisMonth,
      icon: Calendar,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      suffix: " upcoming",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <p className={`text-2xl font-bold ${card.color} tabular-nums`}>
                {card.prefix}
                {card.format 
                  ? card.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : card.value}
                {card.suffix}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
