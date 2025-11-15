import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { differenceInDays, format } from "date-fns";

interface Event {
  id: string;
  title: string;
  event_type: string;
  target_date: string;
  total_estimated_cost: number;
}

interface EventTimelineProps {
  events: Event[];
  onEventSelect: (eventId: string) => void;
}

export function EventTimeline({ events, onEventSelect }: EventTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
  );

  const getUrgencyColor = (targetDate: string) => {
    const days = differenceInDays(new Date(targetDate), new Date());
    if (days < 180) return "border-red-500 bg-red-500/10";
    if (days < 365) return "border-amber-500 bg-amber-500/10";
    return "border-green-500 bg-green-500/10";
  };

  return (
    <Card className="p-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

        {/* Events */}
        <div className="space-y-8">
          {sortedEvents.map((event, index) => {
            const daysUntil = differenceInDays(new Date(event.target_date), new Date());
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-20 cursor-pointer group"
                onClick={() => onEventSelect(event.id)}
              >
                {/* Timeline dot */}
                <div className={`absolute left-6 top-3 w-5 h-5 rounded-full border-2 ${getUrgencyColor(event.target_date)}`} />

                {/* Event card */}
                <Card className="p-4 hover:shadow-lg transition-all group-hover:border-primary">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize mb-3">
                        {event.event_type.replace("_", " ")}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(event.target_date), "MMM d, yyyy")}
                        </div>
                        <div>
                          {daysUntil > 0 ? `${daysUntil} days away` : "Past due"}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        ${event.total_estimated_cost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
