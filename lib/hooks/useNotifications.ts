import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: {
    campaign_id?: string;
    message_id?: string;
    sender_id?: string;
    sender_name?: string;
    [key: string]: unknown;
  };
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return response.json();
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Mark notifications as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAsRead = (notificationIds: string[]) => {
    markAsReadMutation.mutate(notificationIds);
  };

  const markAllAsRead = () => {
    const unreadIds = data?.notifications
      ?.filter((n: Notification) => !n.is_read)
      .map((n: Notification) => n.id) || [];

    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  };

  return {
    notifications: (data?.notifications || []) as Notification[],
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error,
    markAsRead,
    markAllAsRead
  };
} 