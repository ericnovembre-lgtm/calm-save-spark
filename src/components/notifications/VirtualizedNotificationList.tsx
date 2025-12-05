/**
 * Virtualized Notification List Component
 * Efficiently renders large lists of notifications
 */
import { memo, CSSProperties } from 'react';
import { VirtualizedList, VirtualizedListSkeleton } from '@/components/ui/virtualized-list';
import { Bell, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  action_url?: string;
}

interface VirtualizedNotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onEndReached?: () => void;
  height?: number;
  onNotificationClick?: (notification: Notification) => void;
  onDismiss?: (id: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'error':
      return <AlertTriangle className="w-5 h-5 text-destructive" />;
    default:
      return <Info className="w-5 h-5 text-primary" />;
  }
};

const getNotificationBg = (type: NotificationType, read: boolean) => {
  const opacity = read ? '5' : '10';
  switch (type) {
    case 'success':
      return `bg-green-500/${opacity}`;
    case 'warning':
      return `bg-yellow-500/${opacity}`;
    case 'error':
      return `bg-destructive/${opacity}`;
    default:
      return `bg-primary/${opacity}`;
  }
};

export const VirtualizedNotificationList = memo(function VirtualizedNotificationList({
  notifications,
  isLoading = false,
  onEndReached,
  height = 400,
  onNotificationClick,
  onDismiss,
}: VirtualizedNotificationListProps) {
  const renderNotification = (
    notification: Notification, 
    index: number, 
    style: CSSProperties
  ) => (
    <div style={{ ...style, paddingBottom: 8 }} key={notification.id}>
      <div 
        className={cn(
          "p-4 rounded-xl border transition-all cursor-pointer",
          "hover:shadow-md",
          getNotificationBg(notification.type, notification.read),
          notification.read ? "opacity-70" : "opacity-100",
          !notification.read && "border-l-4",
          !notification.read && notification.type === 'success' && "border-l-green-500",
          !notification.read && notification.type === 'warning' && "border-l-yellow-500",
          !notification.read && notification.type === 'error' && "border-l-destructive",
          !notification.read && notification.type === 'info' && "border-l-primary"
        )}
        onClick={() => onNotificationClick?.(notification)}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={cn(
                "font-medium text-sm",
                !notification.read && "font-semibold"
              )}>
                {notification.title}
              </h4>
              {onDismiss && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(notification.id);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 -m-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {notification.message}
            </p>
            
            <span className="text-xs text-muted-foreground/70 mt-2 block">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <VirtualizedList
      items={notifications}
      renderItem={renderNotification}
      itemHeight={110}
      height={height}
      isLoading={isLoading}
      loadingState={<VirtualizedListSkeleton count={4} itemHeight={110} />}
      emptyState={
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Bell className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No notifications yet</p>
          <p className="text-sm text-muted-foreground/70">
            You're all caught up!
          </p>
        </div>
      }
      onEndReached={onEndReached}
    />
  );
});
