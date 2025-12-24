/** ダッシュボードブロックの種類 */
export type DashboardBlockType =
  | 'current-title'
  | 'title-journey'
  | 'user-stats'
  | 'activity-calendar'
  | 'events-calendar'
  | 'ranking'
  | 'goals-sidebar'
  | 'goals-timeline';

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
