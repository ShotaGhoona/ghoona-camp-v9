/**
 * イベント詳細取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { eventApi } from '@/entities/domain/event/api/event-api';

export function useEventDetail(eventId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventApi.getEventById(eventId!),
    enabled: enabled && eventId !== null,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
