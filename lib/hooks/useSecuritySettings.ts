import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
export interface SessionData {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
  ipAddress?: string;
}

export interface TwoFactorStatus {
  twoFactorEnabled: boolean;
  backupCodes?: number;
}

export interface TwoFactorSetup {
  secret?: string;
  qrCodeUrl?: string;
  manualEntryKey?: string;
  backupCodes?: string[];
}

// Password Change Hook
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to change password:', error);
      toast.error(error.message || 'Failed to change password');
    },
  });
}

// 2FA Status Hook
export function useTwoFactorStatus() {
  return useQuery({
    queryKey: ['2fa-status'],
    queryFn: async (): Promise<TwoFactorStatus> => {
      const response = await fetch('/api/user/2fa/status', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch 2FA status');
      }

      const data = await response.json();
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// 2FA Setup Hook
export function useTwoFactorSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      action: 'generate' | 'verify' | 'disable';
      totpCode?: string;
      password?: string;
    }) => {
      const response = await fetch('/api/user/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to setup 2FA');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });

      if (variables.action === 'verify') {
        toast.success('Two-factor authentication enabled successfully');
      } else if (variables.action === 'disable') {
        toast.success('Two-factor authentication disabled');
      }
    },
    onError: (error: Error) => {
      console.error('2FA setup failed:', error);
      toast.error(error.message || 'Failed to setup 2FA');
    },
  });
}

// Sessions Hook
export function useSessions() {
  return useQuery({
    queryKey: ['user-sessions'],
    queryFn: async (): Promise<SessionData[]> => {
      const response = await fetch('/api/user/sessions', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      return data.sessions || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Revoke Session Hook
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { sessionId?: string; revokeAll?: boolean }) => {
      const params = new URLSearchParams();
      if (data.sessionId) params.append('sessionId', data.sessionId);
      if (data.revokeAll) params.append('revokeAll', 'true');

      const response = await fetch(`/api/user/sessions?${params.toString()}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to revoke session');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });

      if (variables.revokeAll) {
        toast.success('All other sessions revoked successfully');
      } else {
        toast.success('Session revoked successfully');
      }
    },
    onError: (error: Error) => {
      console.error('Failed to revoke session:', error);
      toast.error(error.message || 'Failed to revoke session');
    },
  });
}