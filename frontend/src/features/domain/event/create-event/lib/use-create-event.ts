/**
 * イベント作成 Hook
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '@/entities/domain/event/api/event-api';
import type { CreateEventRequest } from '@/entities/domain/event/model/types';

type UseCreateEventOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useCreateEvent(options?: UseCreateEventOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => {
      return eventApi.createEvent(data);
    },
    onSuccess: () => {
      // イベント一覧のキャッシュを無効化
      queryClient.invalidateQueries({
        queryKey: ['events'],
      });

      options?.onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error('Event creation failed:', error);
      options?.onError?.(error);
    },
  });
}
