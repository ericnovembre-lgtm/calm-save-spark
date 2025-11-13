import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";

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
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card className="p-6 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={() => onDismiss(recommendation.id)}
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="flex items-start gap-3 mb-3">
        <Badge className={getPriorityColor(recommendation.priority)}>
          {recommendation.priority.toUpperCase()}
        </Badge>
        {recommendation.impact > 0 && (
          <Badge variant="outline" className="text-green-600">
            +{recommendation.impact} score impact
          </Badge>
        )}
      </div>

      <h4 className="font-semibold text-foreground mb-2">{recommendation.title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{recommendation.description}</p>

      <Button className="w-full group" asChild>
        <Link to={recommendation.actionLink}>
          {recommendation.actionLabel}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </Card>
  );
};
