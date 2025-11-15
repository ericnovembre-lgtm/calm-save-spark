import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCheck, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export function AdminNotificationCenter() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('Notification marked as read');
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Admin Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </CardTitle>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read ? 'bg-muted/20' : 'bg-card'
              }`}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(notification.severity)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{notification.title}</h4>
                    <Badge variant={notification.read ? 'secondary' : 'default'}>
                      {notification.notification_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  {notification.action_taken && (
                    <p className="text-sm font-medium text-green-600">
                      ✅ {notification.action_taken}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notification.created_at), 'PPp')}
                    </span>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No notifications yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
