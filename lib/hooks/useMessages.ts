import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Message {
  id: string;
  campaign_id: string;
  sender_id: string;
  recipient_id: string | null;
  message: string;
  is_broadcast: boolean;
  attachments: Array<{
    url: string;
    type: string;
    name: string;
    size: number;
  }>;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    user_type: string;
    image?: string;
  };
  recipient?: {
    id: string;
    name: string;
    user_type: string;
    image?: string;
  };
  message_recipients?: Array<{
    recipient_id: string;
    is_read: boolean;
    read_at: string | null;
  }>;
}

interface SendMessageData {
  campaignId: string;
  message: string;
  recipientId?: string;
  isBroadcast?: boolean;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
    size: number;
  }>;
}

export function useMessages(campaignId: string) {
  const queryClient = useQueryClient();
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Fetch messages
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['messages', campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/messages/campaign/${campaignId}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Messages endpoint not found for campaign ${campaignId}`);
          return [];
        }
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      return data.messages as Message[];
    },
    refetchInterval: 5000, // Poll every 5 seconds for new messages
    enabled: !!campaignId,
    retry: (failureCount, error) => {
      // Retry on 404s up to 3 times with delay
      if (error instanceof Error && error.message.includes('404')) {
        return failureCount < 3;
      }
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: SendMessageData) => {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', campaignId] });
      toast.success('Message sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    }
  });

  // Upload attachment
  const uploadAttachment = useCallback(async (file: File) => {
    setUploadingFiles(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('campaignId', campaignId);

      const response = await fetch('/api/upload/message-attachment', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
      throw error;
    } finally {
      setUploadingFiles(false);
    }
  }, [campaignId]);

  // Send message with attachments
  const sendMessage = useCallback(async (
    message: string,
    files: File[] = [],
    recipientId?: string,
    isBroadcast = false
  ) => {
    try {
      // Upload attachments first if any
      const attachments = [];
      if (files.length > 0) {
        for (const file of files) {
          const attachment = await uploadAttachment(file);
          attachments.push(attachment);
        }
      }

      // Send message
      await sendMessageMutation.mutateAsync({
        campaignId,
        message,
        recipientId,
        isBroadcast,
        attachments
      });
    } catch (error) {
      console.error('Send message error:', error);
    }
  }, [campaignId, sendMessageMutation, uploadAttachment]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    uploadingFiles,
    isSending: sendMessageMutation.isPending
  };
} 