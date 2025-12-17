// 称号ページ用ダミーデータ
// TODO: バックエンド接続時に削除

import type { Title, TitleLevel } from '@/shared/types/title/title';
import { TITLE_MASTER } from '@/shared/types/title/title';

// ========================================
// 型定義（ダミーデータ用）
// ========================================

/** 称号保持者の簡易情報 */
export interface TitleHolder {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  achievedAt: string;
}

/** 称号詳細（保持者情報を含む） */
export interface TitleWithHolders extends Title {
  holders: TitleHolder[];
  holderCount: number;
}

/** ユーザーの称号実績 */
export interface UserTitleAchievement {
  titleLevel: TitleLevel;
  achievedAt: string;
  isCurrent: boolean;
}

/** ユーザーの称号進捗情報 */
export interface UserTitleProgress {
  currentTitle: Title;
  nextTitle: Title | null;
  totalAttendanceDays: number;
  daysToNextTitle: number | null;
  progressPercentage: number;
  achievements: UserTitleAchievement[];
}

// ========================================
// ダミーデータ
// ========================================

/** 称号保持者データ */
const titleHoldersData: Record<TitleLevel, TitleHolder[]> = {
  1: [
    { id: '8', displayName: '吉田舞', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yoshida', achievedAt: '2024-09-01' },
  ],
  2: [
    { id: '6', displayName: '伊藤美香', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ito', achievedAt: '2024-08-22' },
    { id: '16', displayName: '木村咲', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kimura', achievedAt: '2024-07-08' },
  ],
  3: [
    { id: '4', displayName: '佐藤ゆき', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sato', achievedAt: '2024-07-01' },
    { id: '13', displayName: '藤田武', avatarUrl: null, achievedAt: '2024-05-15' },
  ],
  4: [
    { id: '7', displayName: '小林涼', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kobayashi', achievedAt: '2024-04-30' },
  ],
  5: [
    { id: '1', displayName: '山田太郎', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada', achievedAt: '2024-06-20' },
    { id: '5', displayName: '渡辺健', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe', achievedAt: '2024-05-10' },
    { id: '10', displayName: '松本彩', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=matsumoto', achievedAt: '2024-05-01' },
    { id: '12', displayName: '森田佳奈', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=morita', achievedAt: '2024-02-20' },
    { id: '15', displayName: '小川博', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ogawa', achievedAt: '2024-04-15' },
  ],
  6: [
    { id: '2', displayName: '鈴木花子', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki', achievedAt: '2024-01-15' },
    { id: '9', displayName: '中村翔', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nakamura', achievedAt: '2023-12-01' },
    { id: '11', displayName: '高橋優', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=takahashi', achievedAt: '2024-01-10' },
  ],
  7: [
    { id: '3', displayName: '田中二郎', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka', achievedAt: '2023-12-01' },
  ],
  8: [
    { id: '14', displayName: '清水凛', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shimizu', achievedAt: '2024-03-01' },
  ],
};

/** 称号一覧（保持者情報付き） */
export const dummyTitlesWithHolders: TitleWithHolders[] = TITLE_MASTER.map((title) => ({
  ...title,
  holders: titleHoldersData[title.level] || [],
  holderCount: (titleHoldersData[title.level] || []).length,
}));

/** 現在のユーザー（自分）の称号進捗 */
export const dummyUserTitleProgress: UserTitleProgress = {
  currentTitle: TITLE_MASTER[4], // Lv.5 太陽追い
  nextTitle: TITLE_MASTER[5], // Lv.6 暁の達人
  totalAttendanceDays: 134,
  daysToNextTitle: 16, // 150 - 134
  progressPercentage: 68, // (134 - 100) / (150 - 100) * 100
  achievements: [
    { titleLevel: 1, achievedAt: '2024-01-01', isCurrent: false },
    { titleLevel: 2, achievedAt: '2024-01-08', isCurrent: false },
    { titleLevel: 3, achievedAt: '2024-02-01', isCurrent: false },
    { titleLevel: 4, achievedAt: '2024-03-01', isCurrent: false },
    { titleLevel: 5, achievedAt: '2024-05-10', isCurrent: true },
  ],
};
