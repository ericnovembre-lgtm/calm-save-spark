import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bell, X, AlertCircle, Info, AlertTriangle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export const AlertCenter = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: alerts } = useQuery({
    queryKey: ['user_alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  const unreadCount = alerts?.filter(a => !a.is_read).length || 0;

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_alerts')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_alerts'] });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_alerts'] });
    },
  });

  const severityIcons = {
    info: Info,
    warning: AlertTriangle,
    urgent: AlertCircle,
  };

  const severityColors = {
    info: 'text-amber-500',
    warning: 'text-yellow-500',
    urgent: 'text-red-500',
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-96">
          {alerts?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {alerts?.map((alert) => {
                const Icon = severityIcons[alert.severity as keyof typeof severityIcons] || Info;
                const colorClass = severityColors[alert.severity as keyof typeof severityColors];
                
                return (
                  <div
                    key={alert.id}
                    className={`p-4 hover:bg-accent/5 transition-colors ${
                      !alert.is_read ? 'bg-accent/10' : ''
                    }`}
                    onClick={() => {
                      if (!alert.is_read) {
                        markAsReadMutation.mutate(alert.id);
                      }
                      if (alert.action_url) {
                        window.location.href = alert.action_url;
                        setOpen(false);
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${colorClass} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm text-foreground">
                            {alert.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAlertMutation.mutate(alert.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(alert.created_at), 'MMM dd, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
