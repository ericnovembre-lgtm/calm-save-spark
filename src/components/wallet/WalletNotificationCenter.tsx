import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, AlertTriangle, TrendingDown, ArrowUpRight } from "lucide-react";
import { useWalletNotifications } from "@/hooks/useWalletNotifications";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export function WalletNotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useWalletNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'gas_alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'portfolio_warning':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'normal':
        return 'text-blue-500';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Wallet Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id);
                        }
                        if (notification.action_url) {
                          window.location.href = notification.action_url;
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <Card
                        className={`w-full p-3 ${
                          !notification.read ? 'bg-primary/5 border-primary/20' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1 ${getPriorityColor(notification.priority)}`}>
                            {getNotificationIcon(notification.notification_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-sm leading-tight">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </DropdownMenuItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-xs" size="sm">
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}