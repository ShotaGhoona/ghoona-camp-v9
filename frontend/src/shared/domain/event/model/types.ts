/**
 * イベントドメイン - 基本型定義
 */

/** イベントタイプ */
export type EventType =
  | 'study'
  | 'exercise'
  | 'meditation'
  | 'reading'
  | 'general';

/** 繰り返しパターン */
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly';
