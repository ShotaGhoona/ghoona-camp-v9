import type { EventType } from '@/entities/domain/event/model/types';

/** イベントフィルター状態 */
export interface EventsFilterState {
  /** 選択されたイベントタイプ */
  selectedEventTypes: EventType[];
  /** 参加状態フィルター: true=参加済みのみ, false=未参加のみ, null=全て */
  participationStatus: boolean | null;
}

/** フィルターの初期状態 */
export const initialFilterState: EventsFilterState = {
  selectedEventTypes: [],
  participationStatus: null,
};

/** フィルターがアクティブかどうかを判定 */
export function isFilterActive(filter: EventsFilterState): boolean {
  return (
    filter.selectedEventTypes.length > 0 || filter.participationStatus !== null
  );
}

/** アクティブなフィルター数を取得 */
export function getActiveFilterCount(filter: EventsFilterState): number {
  let count = 0;
  count += filter.selectedEventTypes.length;
  if (filter.participationStatus !== null) count++;
  return count;
}
