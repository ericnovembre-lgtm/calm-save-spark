import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Target, CreditCard, Shield, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TimelineItem {
  id: string;
  type: "bill" | "transfer" | "goal" | "subscription" | "other";
  title: string;
  date: string;
  amount?: number;
  link: string;
}

interface ActionTimelineProps {
  items: TimelineItem[];
}

export const ActionTimeline = ({ items }: ActionTimelineProps) => {
  const prefersReducedMotion = useReducedMotion();

  const getIcon = (type: string) => {
    switch (type) {
      case "bill":
        return <CreditCard className="w-5 h-5" />;
      case "transfer":
        return <DollarSign className="w-5 h-5" />;
      case "goal":
        return <Target className="w-5 h-5" />;
      case "subscription":
        return <Shield className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bill":
        return "bg-[hsl(var(--health-poor)/0.1)] text-[hsl(var(--health-poor))] border-[hsl(var(--health-poor)/0.2)]";
      case "transfer":
        return "bg-[hsl(var(--health-excellent)/0.1)] text-[hsl(var(--health-excellent))] border-[hsl(var(--health-excellent)/0.2)]";
      case "goal":
        return "bg-[hsl(var(--health-good)/0.1)] text-[hsl(var(--health-good))] border-[hsl(var(--health-good)/0.2)]";
      case "subscription":
        return "bg-accent/20 text-accent-foreground border-accent/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground text-lg">No upcoming actions</p>
        <p className="text-sm text-muted-foreground mt-2">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={prefersReducedMotion ? false : { opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: index * 0.1,
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
        >
          <Link to={item.link} className="block group">
            <motion.div
              className="relative flex items-center gap-6 p-5 rounded-xl hover:bg-accent/30 transition-all duration-300 border-2 border-transparent hover:border-primary/10 hover:shadow-lg"
              whileHover={prefersReducedMotion ? {} : { x: 4 }}
            >
              {/* Timeline connector */}
              {index < items.length - 1 && (
                <div className="absolute left-9 top-16 w-0.5 h-8 bg-border" />
              )}

              {/* Icon */}
              <motion.div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${getTypeColor(item.type)} shadow-md`}
                whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                {getIcon(item.type)}
              </motion.div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                    {item.title}
                  </h4>
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(item.date), "EEEE, MMM dd, yyyy")}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {item.amount !== undefined && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <p className={`text-2xl font-bold ${item.amount > 0 ? 'text-[hsl(var(--health-excellent))]' : 'text-foreground'}`}>
                      ${Math.abs(item.amount).toFixed(2)}
                    </p>
                  </div>
                )}
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};
