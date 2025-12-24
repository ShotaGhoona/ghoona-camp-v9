import type { DashboardBlockType } from '@/entities/domain/dashboard/model/types';

/** ブロックのサイズ制約 */
export type BlockSizeConstraints = {
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  defaultW: number;
  defaultH: number;
};

/** ブロックの設定 */
export type BlockConfig = {
  type: DashboardBlockType;
  label: string;
  constraints: BlockSizeConstraints;
};

/** react-grid-layout用のレイアウトアイテム */
export type GridLayoutItem = {
  i: string; // react-grid-layout用のID（= DashboardBlock.id）
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
};

/** ブロックコンポーネントのProps */
export type DashboardBlockProps = {
  isEditMode: boolean;
};