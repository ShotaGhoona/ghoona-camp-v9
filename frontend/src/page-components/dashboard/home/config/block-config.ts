import type { DashboardBlockType } from '@/entities/domain/dashboard/model/types';

import type { BlockConfig } from '../model/types';

/** グリッド設定 */
export const GRID_CONFIG = {
  ROW_HEIGHT: 100,
  COLS: 12,
  MARGIN: 16,
} as const;

/** 各ブロックの設定 */
export const BLOCK_CONFIGS: Record<DashboardBlockType, BlockConfig> = {
  'current-title': {
    type: 'current-title',
    label: '現在の称号',
    constraints: { minW: 2, maxW: 4, minH: 2, maxH: 3, defaultW: 3, defaultH: 2 },
  },
  'title-journey': {
    type: 'title-journey',
    label: '称号ジャーニー',
    constraints: { minW: 4, maxW: 12, minH: 2, maxH: 3, defaultW: 6, defaultH: 2 },
  },
  'user-stats': {
    type: 'user-stats',
    label: 'あなたの記録',
    constraints: { minW: 2, maxW: 4, minH: 2, maxH: 4, defaultW: 2, defaultH: 3 },
  },
  'activity-calendar': {
    type: 'activity-calendar',
    label: '参加カレンダー',
    constraints: { minW: 5, maxW: 12, minH: 9, maxH: 9, defaultW: 7, defaultH: 9 },
  },
  'events-calendar': {
    type: 'events-calendar',
    label: 'イベントカレンダー',
    constraints: { minW: 5, maxW: 12, minH: 9, maxH: 9, defaultW: 7, defaultH: 9 },
  },
  'ranking': {
    type: 'ranking',
    label: 'ランキング',
    constraints: { minW: 3, maxW: 6, minH: 4, maxH: 8, defaultW: 4, defaultH: 6 },
  },
  'goals-sidebar': {
    type: 'goals-sidebar',
    label: '目標一覧',
    constraints: { minW: 3, maxW: 6, minH: 4, maxH: 8, defaultW: 4, defaultH: 6 },
  },
  'goals-timeline': {
    type: 'goals-timeline',
    label: '目標タイムライン',
    constraints: { minW: 6, maxW: 12, minH: 4, maxH: 8, defaultW: 8, defaultH: 5 },
  },
};

