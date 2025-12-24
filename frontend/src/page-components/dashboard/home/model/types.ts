/** ダッシュボードブロックの種類 */
export type DashboardBlockType =
  | 'block-a'
  | 'block-b'
  | 'block-c'
  | 'block-d'
  | 'block-e'
  | 'block-f'
  | 'block-g'
  | 'block-h'
  | 'block-i'
  | 'block-j';

/** ブロックのサイズ制約 */
export interface BlockSizeConstraints {
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  defaultW: number;
  defaultH: number;
}

/** ブロックの設定 */
export interface BlockConfig {
  type: DashboardBlockType;
  label: string;
  constraints: BlockSizeConstraints;
}

/** ダッシュボードのレイアウトアイテム */
export interface DashboardLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  blockType: DashboardBlockType;
}

/** ダッシュボードの状態 */
export interface DashboardState {
  layouts: DashboardLayoutItem[];
  isEditMode: boolean;
}

/** ブロックコンポーネントのProps */
export interface DashboardBlockProps {
  isEditMode: boolean;
}
