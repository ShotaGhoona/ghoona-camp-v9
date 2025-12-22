/**
 * イベント更新 Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '@/entities/domain/event/api/event-api';
import type { UpdateEventRequest } from '@/entities/domain/event/model/types';

type UseUpdateEventOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useUpdateEvent(options?: UseUpdateEventOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: UpdateEventRequest;
    }) => {
      return eventApi.updateEvent(eventId, data);
    },
    onSuccess: (_data, variables) => {
      // イベント一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ['events'],
      });
      // 該当イベントの詳細キャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ['event', variables.eventId],
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error('Event update failed:', error);
      options?.onError?.(error);
    },
  });
}
