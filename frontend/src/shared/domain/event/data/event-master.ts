/**
 * イベントドメイン - マスターデータ
 */

import type { EventType, RecurrencePattern } from '../model/types';

/** イベントタイプのラベル */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  study: '勉強',
  exercise: '運動',
  meditation: '瞑想',
  reading: '読書',
  general: 'その他',
};

/** 全イベントタイプ */
export const ALL_EVENT_TYPES: EventType[] = [
  'study',
  'exercise',
  'meditation',
  'reading',
  'general',
];

/** イベントタイプに対応する色 */
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  study: 'bg-blue-100 text-blue-700 border-blue-200',
  exercise: 'bg-green-100 text-green-700 border-green-200',
  meditation: 'bg-purple-100 text-purple-700 border-purple-200',
  reading: 'bg-amber-100 text-amber-700 border-amber-200',
  general: 'bg-gray-100 text-gray-700 border-gray-200',
};

/** イベントタイプに対応するBadgeバリアント */
export const EVENT_TYPE_BADGE_VARIANTS: Record<
  EventType,
  'default' | 'secondary' | 'outline'
> = {
  study: 'default',
  exercise: 'secondary',
  meditation: 'outline',
  reading: 'secondary',
  general: 'outline',
};

/** 繰り返しパターンのラベル */
export const RECURRENCE_PATTERN_LABELS: Record<RecurrencePattern, string> = {
  daily: '毎日',
  weekly: '毎週',
  monthly: '毎月',
};
