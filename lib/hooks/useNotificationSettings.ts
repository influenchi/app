import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface NotificationSettings {
  email: {
    campaignUpdates: boolean;
    creatorMessages: boolean;
    paymentAlerts: boolean;
    weeklyReports: boolean;
    marketingEmails: boolean;
  };
  push: {
    campaignUpdates: boolean;
    creatorMessages: boolean;
    paymentAlerts: boolean;
    urgentAlerts: boolean;
  };
  desktop: {
    browserNotifications: boolean;
    soundAlerts: boolean;
  };
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: async (): Promise<NotificationSettings> => {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification settings');
      }

      const data = await response.json();
      return data.notificationSettings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update notification settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success('Notification settings updated successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to update notification settings:', error);
      toast.error(error.message || 'Failed to update notification settings');
    },
  });
}