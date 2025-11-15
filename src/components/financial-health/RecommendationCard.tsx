import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, X, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  impact: number;
  actionLabel: string;
  actionLink: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss: (id: string) => void;
}

export const RecommendationCard = ({ recommendation, onDismiss }: RecommendationCardProps) => {
  const prefersReducedMotion = useReducedMotion();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200";
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={prefersReducedMotion ? {} : { y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className="relative p-6 overflow-hidden border-2 hover:border-primary/20 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-accent/5">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 hover:bg-destructive/10 z-10"
          onClick={() => onDismiss(recommendation.id)}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="relative">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge className={`${getPriorityColor(recommendation.priority)} border`}>
              {recommendation.priority.toUpperCase()}
            </Badge>
            {recommendation.impact > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                +{recommendation.impact} score impact
              </Badge>
            )}
          </div>

          <h4 className="font-semibold text-lg text-foreground mb-2">{recommendation.title}</h4>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{recommendation.description}</p>

          <Button className="w-full group shadow-md hover:shadow-lg" asChild>
            <Link to={recommendation.actionLink}>
              {recommendation.actionLabel}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
