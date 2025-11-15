import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface EventChecklistProps {
  lifePlanId: string;
}

export function EventChecklist({ lifePlanId }: EventChecklistProps) {
  const queryClient = useQueryClient();

  const { data: checklists } = useQuery({
    queryKey: ["life-event-checklists", lifePlanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("life_event_checklists")
        .select("*")
        .eq("life_plan_id", lifePlanId)
        .order("created_at");

      if (error) throw error;
      return data;
    }
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const { error } = await supabase
        .from("life_event_checklists")
        .update({ 
          is_completed: !isCompleted,
          completed_at: !isCompleted ? new Date().toISOString() : null
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["life-event-checklists", lifePlanId] });
    }
  });

  const completedCount = checklists?.filter(c => c.is_completed).length || 0;
  const totalCount = checklists?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground">Event Checklist</h3>
            <span className="text-sm text-muted-foreground">
              {completedCount} / {totalCount} complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence>
          <div className="space-y-2">
            {checklists?.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  item.is_completed ? 'bg-muted/50' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Checkbox
                  checked={item.is_completed}
                  onCheckedChange={() => toggleComplete.mutate({ id: item.id, isCompleted: item.is_completed })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    item.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'
                  }`}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                  {item.priority && (
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${
                      item.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                      item.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      {item.priority}
                    </span>
                  )}
                </div>
                {item.is_completed && (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </Card>
  );
}
