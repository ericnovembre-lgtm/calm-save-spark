import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface MentionNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata: {
    comment_id?: string;
    budget_id?: string;
    commenter_id?: string;
    preview?: string;
  };
  read: boolean;
  created_at: string;
}

export const useMentionNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch mention notifications
  const notificationsQuery = useQuery({
    queryKey: ["mention-notifications", user?.id],
    queryFn: async (): Promise<MentionNotification[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("wallet_notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("notification_type", "mention")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.warn("Mention notifications query failed:", error);
        return [];
      }

      return (data || []).map((n) => ({
        id: n.id,
        user_id: n.user_id,
        type: n.notification_type,
        title: n.title,
        message: n.message,
        metadata: (n.metadata as MentionNotification["metadata"]) || {},
        read: n.read,
        created_at: n.created_at,
      }));
    },
    enabled: !!user,
  });

  // Update unread count when data changes
  useEffect(() => {
    const unread = (notificationsQuery.data || []).filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [notificationsQuery.data]);

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("wallet_notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mention-notifications", user?.id] });
    },
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const { error } = await supabase
        .from("wallet_notifications")
        .update({ read: true } as any)
        .eq("user_id", user.id)
        .eq("notification_type", "mention")
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mention-notifications", user?.id] });
      toast.success("All mentions marked as read");
    },
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("wallet_notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mention-notifications", user?.id] });
    },
  });

  // Realtime subscription for new mentions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`mention-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "wallet_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as MentionNotification;
          
          // Only handle mention type notifications
          if (notification.type === "mention") {
            // Show toast for new mention
            toast.info(notification.title, {
              description: notification.message,
              action: notification.metadata?.budget_id
                ? {
                    label: "View",
                    onClick: () => {
                      window.location.href = `/budgets/${notification.metadata.budget_id}`;
                    },
                  }
                : undefined,
            });

            // Invalidate query to refresh list
            queryClient.invalidateQueries({ queryKey: ["mention-notifications", user.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return {
    notifications: notificationsQuery.data || [],
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
