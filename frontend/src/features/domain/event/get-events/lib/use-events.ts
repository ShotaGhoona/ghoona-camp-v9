/**
 * イベント一覧取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { eventApi } from '@/entities/domain/event/api/event-api';
import type { EventType } from '@/entities/domain/event/model/types';

export type EventsFilter = {
  year: number;
  month: number;
  eventTypes?: EventType[];
  participated?: boolean;
};

export function useEvents(filter: EventsFilter, enabled = true) {
  return useQuery({
    queryKey: ['events', filter],
    queryFn: () =>
      eventApi.getEvents({
        year: filter.year,
        month: filter.month,
        event_type: filter.eventTypes?.join(','),
        participated: filter.participated,
      }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
