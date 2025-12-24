import type { BlockConfig, DashboardBlockType } from './types';

/** 各ブロックの設定 */
export const BLOCK_CONFIGS: Record<DashboardBlockType, BlockConfig> = {
  'block-a': {
    type: 'block-a',
    label: 'ブロック A',
    constraints: { minW: 2, maxW: 6, minH: 2, maxH: 4 },
    defaultW: 3,
    defaultH: 2,
  },
  'block-b': {
    type: 'block-b',
    label: 'ブロック B',
    constraints: { minW: 1, maxW: 4, minH: 1, maxH: 3 },
    defaultW: 2,
    defaultH: 2,
  },
  'block-c': {
    type: 'block-c',
    label: 'ブロック C',
    constraints: { minW: 3, maxW: 8, minH: 2, maxH: 5 },
    defaultW: 4,
    defaultH: 3,
  },
  'block-d': {
    type: 'block-d',
    label: 'ブロック D',
    constraints: { minW: 2, maxW: 12, minH: 1, maxH: 2 },
    defaultW: 6,
    defaultH: 1,
  },
  'block-e': {
    type: 'block-e',
    label: 'ブロック E',
    constraints: { minW: 2, maxW: 4, minH: 2, maxH: 6 },
    defaultW: 2,
    defaultH: 4,
  },
  'block-f': {
    type: 'block-f',
    label: 'ブロック F',
    constraints: { minW: 4, maxW: 12, minH: 3, maxH: 6 },
    defaultW: 6,
    defaultH: 3,
  },
  'block-g': {
    type: 'block-g',
    label: 'ブロック G',
    constraints: { minW: 1, maxW: 3, minH: 1, maxH: 2 },
    defaultW: 2,
    defaultH: 1,
  },
  'block-h': {
    type: 'block-h',
    label: 'ブロック H',
    constraints: { minW: 3, maxW: 6, minH: 2, maxH: 4 },
    defaultW: 3,
    defaultH: 2,
  },
  'block-i': {
    type: 'block-i',
    label: 'ブロック I',
    constraints: { minW: 2, maxW: 8, minH: 2, maxH: 5 },
    defaultW: 4,
    defaultH: 2,
  },
  'block-j': {
    type: 'block-j',
    label: 'ブロック J',
    constraints: { minW: 2, maxW: 6, minH: 1, maxH: 3 },
    defaultW: 3,
    defaultH: 2,
  },
};

/** デフォルトのレイアウト */
export const DEFAULT_LAYOUTS = [
  { i: 'item-1', x: 0, y: 0, w: 3, h: 2, blockType: 'block-a' as const },
  { i: 'item-2', x: 3, y: 0, w: 2, h: 2, blockType: 'block-b' as const },
  { i: 'item-3', x: 5, y: 0, w: 4, h: 3, blockType: 'block-c' as const },
  { i: 'item-4', x: 9, y: 0, w: 3, h: 1, blockType: 'block-g' as const },
];
