import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Target, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Event {
  id: string;
  title: string;
  event_type: string;
  target_date: string;
  total_estimated_cost: number;
}

interface EventCardProps {
  event: Event;
  onSelect: () => void;
}

export function EventCard({ event, onSelect }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 cursor-pointer hover:shadow-xl transition-shadow" onClick={onSelect}>
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground capitalize">
              {event.event_type.replace("_", " ")}
            </p>
          </div>


          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Target Date</span>
              </div>
              <span className="font-medium text-foreground">
                {format(new Date(event.target_date), "MMM d, yyyy")}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Est. Cost</span>
              </div>
              <span className="font-medium text-foreground">
                ${event.total_estimated_cost.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
