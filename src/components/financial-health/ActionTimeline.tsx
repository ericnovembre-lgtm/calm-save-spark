import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Target, CreditCard, Shield, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

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
  const getIcon = (type: string) => {
    switch (type) {
      case "bill":
        return <CreditCard className="w-4 h-4" />;
      case "transfer":
        return <DollarSign className="w-4 h-4" />;
      case "goal":
        return <Target className="w-4 h-4" />;
      case "subscription":
        return <Shield className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bill":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "transfer":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "goal":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "subscription":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No upcoming actions</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-foreground mb-4">Upcoming Actions</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <Link
            key={item.id}
            to={item.link}
            className="block group"
          >
            <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(item.type)}`}>
                {getIcon(item.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {item.title}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(item.date), "MMM dd, yyyy")}
                </p>
              </div>

              {item.amount !== undefined && (
                <div className="text-right flex-shrink-0">
                  <p className={`font-semibold ${item.amount > 0 ? 'text-green-600' : 'text-foreground'}`}>
                    ${Math.abs(item.amount).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};
