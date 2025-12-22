/**
 * イベント削除 Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '@/entities/domain/event/api/event-api';

type UseDeleteEventOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useDeleteEvent(options?: UseDeleteEventOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => {
      return eventApi.deleteEvent(eventId);
    },
    onSuccess: (_data, eventId) => {
      // イベント一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ['events'],
      });
      // 該当イベントの詳細キャッシュを削除
      queryClient.removeQueries({
        queryKey: ['event', eventId],
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error('Event deletion failed:', error);
      options?.onError?.(error);
    },
  });
}
