/**
 * ページネーション - 共通型定義
 * 全てのページネーション付きAPIレスポンスで使用
 */

export type Pagination = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};
