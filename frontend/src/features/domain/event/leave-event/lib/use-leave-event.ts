/**
 * 参加キャンセル Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '@/entities/domain/event/api/event-api';

type UseLeaveEventOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useLeaveEvent(options?: UseLeaveEventOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => {
      return eventApi.leaveEvent(eventId);
    },
    onSuccess: (_data, eventId) => {
      // イベント一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ['events'],
      });
      // 該当イベントの詳細キャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ['event', eventId],
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error('Event leave failed:', error);
      options?.onError?.(error);
    },
  });
}
