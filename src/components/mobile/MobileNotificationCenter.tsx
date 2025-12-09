import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Bell, CheckCircle, AlertTriangle, TrendingUp, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'transaction' | 'goal' | 'alert' | 'insight';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface MobileNotificationCenterProps {
  onClose: () => void;
}

const typeIcons = {
  transaction: CheckCircle,
  goal: Target,
  alert: AlertTriangle,
  insight: TrendingUp
};

const typeColors = {
  transaction: 'text-emerald-500',
  goal: 'text-yellow-500',
  alert: 'text-amber-500',
  insight: 'text-amber-400'
};

export function MobileNotificationCenter({ onClose }: MobileNotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      // Fetch from wallet_notifications
      const { data } = await supabase
        .from('wallet_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data.map(n => ({
          id: n.id,
          type: (n.notification_type as Notification['type']) || 'insight',
          title: n.title,
          message: n.message,
          timestamp: n.created_at,
          read: n.read || false,
          actionUrl: n.action_url
        })));
      }
      setIsLoading(false);
    };

    fetchNotifications();
  }, [user]);

  const handleSwipe = async (id: string, direction: 'left' | 'right') => {
    haptics.swipe();
    
    if (direction === 'left') {
      // Delete notification
      await supabase
        .from('wallet_notifications')
        .delete()
        .eq('id', id);
      
      setNotifications(prev => prev.filter(n => n.id !== id));
    } else {
      // Mark as read
      await supabase
        .from('wallet_notifications')
        .update({ read: true })
        .eq('id', id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    
    await supabase
      .from('wallet_notifications')
      .update({ read: true })
      .eq('user_id', user.id);
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    haptics.buttonPress();
  };

  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = new Date(notification.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 glass-bg-strong backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h1 className="text-lg font-semibold">Notifications</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100vh-64px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Bell className="h-12 w-12 mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date}>
              <div className="sticky top-0 bg-background/80 backdrop-blur-sm px-4 py-2">
                <span className="text-xs text-muted-foreground font-medium">{date}</span>
              </div>
              <AnimatePresence>
                {items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onSwipe={handleSwipe}
                  />
                ))}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function NotificationItem({ 
  notification, 
  onSwipe 
}: { 
  notification: Notification;
  onSwipe: (id: string, direction: 'left' | 'right') => void;
}) {
  const [swipeX, setSwipeX] = useState(0);
  const Icon = typeIcons[notification.type];

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -100) {
      onSwipe(notification.id, 'left');
    } else if (info.offset.x > 100) {
      onSwipe(notification.id, 'right');
    }
    setSwipeX(0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: swipeX < 0 ? -300 : 300 }}
      className="relative overflow-hidden"
    >
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-emerald-500 flex items-center px-4">
          <CheckCircle className="h-5 w-5 text-white" />
          <span className="text-white ml-2 text-sm">Read</span>
        </div>
        <div className="flex-1 bg-destructive flex items-center justify-end px-4">
          <span className="text-white mr-2 text-sm">Delete</span>
          <Trash2 className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Notification Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={(_, info) => setSwipeX(info.offset.x)}
        onDragEnd={handleDragEnd}
        style={{ x: swipeX }}
        className={cn(
          "relative bg-background px-4 py-3 border-b border-border/50",
          !notification.read && "bg-primary/5"
        )}
      >
        <div className="flex gap-3">
          <div className={cn("mt-0.5", typeColors[notification.type])}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={cn(
                "text-sm",
                notification.read ? "text-muted-foreground" : "text-foreground font-medium"
              )}>
                {notification.title}
              </p>
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {new Date(notification.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
