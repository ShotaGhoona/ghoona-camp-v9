/**
 * Dashboard Entity - 型定義
 * バックエンドAPIレスポンスに基づく
 */

// ========================================
// ダッシュボードブロック
// ========================================

/** ダッシュボードブロックタイプ */
export type DashboardBlockType =
  | 'current-title'
  | 'title-journey'
  | 'user-stats'
  | 'activity-calendar'
  | 'events-calendar'
  | 'ranking'
  | 'goals-sidebar'
  | 'goals-timeline';

/** ダッシュボードブロック */
export type DashboardBlock = {
  id: string;
  type: DashboardBlockType;
  x: number; // X座標（0-11）
  y: number; // Y座標（0以上）
  w: number; // 幅（1-12）
  h: number; // 高さ（1以上）
};

// ========================================
// APIレスポンス
// ========================================

/** レイアウトデータ */
export type DashboardLayoutData = {
  blocks: DashboardBlock[];
};

/** レイアウト取得レスポンス */
export type DashboardLayoutResponse = {
  data: DashboardLayoutData;
  message: string;
  timestamp: string;
};

/** レイアウト更新レスポンス */
export type UpdateDashboardLayoutResponse = {
  data: DashboardLayoutData;
  message: string;
  timestamp: string;
};

// ========================================
// リクエスト
// ========================================

/** レイアウト更新リクエスト */
export type UpdateDashboardLayoutRequest = {
  blocks: DashboardBlock[];
};
