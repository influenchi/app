
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MessageSquare, Upload, CheckCircle, Clock, X, Loader2 } from "lucide-react";
import { useNotifications, type Notification } from "@/lib/hooks/useNotifications";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "@/lib/hooks/useAuth";

interface NotificationDropdownProps {
  onNavigate?: (view: string, campaignId?: string, tab?: string, messageId?: string) => void;
}

const NotificationDropdown = ({ onNavigate }: NotificationDropdownProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message_direct':
      case 'message_broadcast':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'submission':
      case 'submission_created':
        return <Upload className="h-4 w-4 text-orange-600" />;
      case 'submission_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'submission_rejected':
        return <X className="h-4 w-4 text-red-600" />;
      case 'review':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'payment':
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markAsRead([notification.id]);

    // Navigate based on notification type and user type
    const campaignId = notification.data?.campaign_id;
    const messageId = notification.data?.message_id;

    if (campaignId) {
      if (session?.user?.user_type === 'brand') {
        // For brands, navigate to campaign details with appropriate tab
        if (notification.type === 'message_direct' || notification.type === 'message_broadcast') {
          const url = messageId
            ? `/brand/dashboard?campaign=${campaignId}&tab=chat&message=${messageId}`
            : `/brand/dashboard?campaign=${campaignId}&tab=chat`;
          router.push(url);
        } else if (notification.type === 'submission_created') {
          // Navigate to submissions tab for new submissions
          router.push(`/brand/dashboard?campaign=${campaignId}&tab=submissions`);
        } else {
          router.push(`/brand/dashboard?campaign=${campaignId}`);
        }
      } else if (session?.user?.user_type === 'creator') {
        // For creators, navigate to active project details
        if (onNavigate && notification.type.includes('message')) {
          onNavigate('active-project-details', campaignId, 'messages', messageId);
        } else if (onNavigate && (notification.type === 'submission_approved' || notification.type === 'submission_rejected')) {
          // Navigate to submissions tab for submission status updates
          onNavigate('active-project-details', campaignId, 'submissions');
        } else {
          const url = messageId
            ? `/creator/dashboard?project=${campaignId}&tab=messages&message=${messageId}`
            : notification.type === 'submission_approved' || notification.type === 'submission_rejected'
              ? `/creator/dashboard?project=${campaignId}&tab=submissions`
              : `/creator/dashboard?project=${campaignId}&tab=messages`;
          router.push(url);
        }
      }
    }
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real implementation, you might want to add a delete endpoint
    // For now, just mark as read
    markAsRead([id]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-5"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`m-2 cursor-pointer hover:bg-accent transition-colors border-0 shadow-none ${!notification.is_read ? 'bg-blue-50/50' : ''
                  }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => removeNotification(notification.id, e)}
                            className="h-6 w-6 p-0 hover:bg-destructive/10"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
