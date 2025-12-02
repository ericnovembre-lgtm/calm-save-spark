import { useState } from "react";
import { Bell, AlertTriangle, Lightbulb, Trophy, Clock, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useWalletNotifications } from "@/hooks/useWalletNotifications";
import { cn } from "@/lib/utils";

const notificationIcons = {
  alert: AlertTriangle,
  insight: Lightbulb,
  achievement: Trophy,
  reminder: Clock,
};

const notificationColors = {
  alert: "text-destructive",
  insight: "text-accent",
  achievement: "text-success",
  reminder: "text-warning",
};

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useWalletNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <motion.div
            animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 5 }}
          >
            <Bell className="w-5 h-5" />
          </motion.div>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 glass-bg-strong backdrop-blur-xl border-accent/20 shadow-glass-elevated"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="h-7 text-xs"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.notification_type as keyof typeof notificationIcons] || Bell;
                const iconColor = notificationColors[notification.notification_type as keyof typeof notificationColors] || "text-foreground";
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      notification.read 
                        ? "bg-background/50 hover:bg-muted/50" 
                        : "bg-accent/10 hover:bg-accent/20 border border-accent/30"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn("flex-shrink-0 mt-0.5", iconColor)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium leading-tight">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleDateString()} at{' '}
                          {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-xs"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
