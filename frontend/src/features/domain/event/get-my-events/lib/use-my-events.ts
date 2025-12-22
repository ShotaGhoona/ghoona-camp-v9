/**
 * 自分のイベント取得 Hook
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { eventApi } from '@/entities/domain/event/api/event-api';
import type { MyEventsParams } from '@/entities/domain/event/model/types';

/**
 * 自分が参加登録 or 主催のイベントを取得
 * @param params クエリパラメータ（year, month）
 * @param enabled クエリを有効にするかどうか（default: true）
 */
export function useMyEvents(params: MyEventsParams, enabled = true) {
  return useQuery({
    queryKey: ['events', 'me', params.year, params.month],
    queryFn: () => eventApi.getMyEvents(params),
    enabled,
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
