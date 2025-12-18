// ランキングページ用ダミーデータ
// TODO: バックエンド接続時に削除

import type { Title } from '@/shared/types/title/title';
import { TITLE_MASTER } from '@/shared/types/title/title';

// ========================================
// 型定義（ダミーデータ用）
// ========================================

/** ランキングの種類 */
export type RankingType = 'monthly' | 'total' | 'streak';

/** ランキングエントリー */
export interface RankingEntry {
  rank: number;
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
    displayName: string;
    bio: string | null;
  };
  currentTitle: Title | null;
  // ランキング種別によって使用するスコア
  monthlyDays: number; // 今月の参加日数
  totalDays: number; // 総参加日数
  currentStreak: number; // 現在の連続日数
  maxStreak: number; // 最大連続日数
  // UI表示用フラグ
  isCurrentUser: boolean;
}

/** 現在のユーザー情報（ランキング内での位置把握用） */
export interface CurrentUserRanking {
  monthlyRank: number;
  totalRank: number;
  streakRank: number;
  monthlyDays: number;
  totalDays: number;
  currentStreak: number;
}

// ========================================
// ダミーランキングデータ
// ========================================

// 現在のユーザーID（ログインユーザー想定）
export const CURRENT_USER_ID = '1';

/** ランキングエントリー一覧（スコア順にソートして使用） */
export const dummyRankingEntries: Omit<
  RankingEntry,
  'rank' | 'isCurrentUser'
>[] = [
  {
    user: {
      id: '3',
      username: 'tanaka_jiro',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka',
      displayName: '田中二郎',
      bio: '毎朝5時起き！継続は力なり',
    },
    currentTitle: TITLE_MASTER[7],
    monthlyDays: 16,
    totalDays: 312,
    currentStreak: 89,
    maxStreak: 120,
  },
  {
    user: {
      id: '14',
      username: 'shimizu_rin',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shimizu',
      displayName: '清水凛',
      bio: '朝活で人生変わりました',
    },
    currentTitle: TITLE_MASTER[7],
    monthlyDays: 16,
    totalDays: 289,
    currentStreak: 100,
    maxStreak: 100,
  },
  {
    user: {
      id: '9',
      username: 'nakamura_sho',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nakamura',
      displayName: '中村翔',
      bio: 'エンジニア / 朝型生活推進中',
    },
    currentTitle: TITLE_MASTER[6],
    monthlyDays: 15,
    totalDays: 267,
    currentStreak: 45,
    maxStreak: 78,
  },
  {
    user: {
      id: '2',
      username: 'suzuki_hanako',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki',
      displayName: '鈴木花子',
      bio: null,
    },
    currentTitle: TITLE_MASTER[6],
    monthlyDays: 14,
    totalDays: 234,
    currentStreak: 67,
    maxStreak: 67,
  },
  {
    user: {
      id: '11',
      username: 'takahashi_yu',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=takahashi',
      displayName: '高橋優',
      bio: '目標は1年連続参加！',
    },
    currentTitle: TITLE_MASTER[6],
    monthlyDays: 14,
    totalDays: 201,
    currentStreak: 56,
    maxStreak: 90,
  },
  {
    user: {
      id: '5',
      username: 'watanabe_ken',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe',
      displayName: '渡辺健',
      bio: 'フリーランスデザイナー',
    },
    currentTitle: TITLE_MASTER[5],
    monthlyDays: 13,
    totalDays: 189,
    currentStreak: 34,
    maxStreak: 56,
  },
  {
    user: {
      id: '12',
      username: 'morita_kana',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=morita',
      displayName: '森田佳奈',
      bio: '朝ヨガと読書が日課です',
    },
    currentTitle: TITLE_MASTER[5],
    monthlyDays: 12,
    totalDays: 178,
    currentStreak: 34,
    maxStreak: 60,
  },
  {
    user: {
      id: '1',
      username: 'yamada_taro',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
      displayName: '山田太郎',
      bio: '朝活初心者、頑張ります！',
    },
    currentTitle: TITLE_MASTER[5],
    monthlyDays: 12,
    totalDays: 156,
    currentStreak: 23,
    maxStreak: 45,
  },
  {
    user: {
      id: '15',
      username: 'ogawa_hiroshi',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ogawa',
      displayName: '小川博',
      bio: '早起きは三文の徳',
    },
    currentTitle: TITLE_MASTER[5],
    monthlyDays: 11,
    totalDays: 145,
    currentStreak: 28,
    maxStreak: 42,
  },
  {
    user: {
      id: '10',
      username: 'matsumoto_aya',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=matsumoto',
      displayName: '松本彩',
      bio: null,
    },
    currentTitle: TITLE_MASTER[5],
    monthlyDays: 10,
    totalDays: 134,
    currentStreak: 21,
    maxStreak: 40,
  },
  {
    user: {
      id: '7',
      username: 'kobayashi_ryo',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kobayashi',
      displayName: '小林涼',
      bio: 'スタートアップで働いてます',
    },
    currentTitle: TITLE_MASTER[4],
    monthlyDays: 8,
    totalDays: 98,
    currentStreak: 0,
    maxStreak: 32,
  },
  {
    user: {
      id: '4',
      username: 'sato_yuki',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sato',
      displayName: '佐藤ゆき',
      bio: '朝の時間を大切に',
    },
    currentTitle: TITLE_MASTER[3],
    monthlyDays: 8,
    totalDays: 78,
    currentStreak: 12,
    maxStreak: 21,
  },
  {
    user: {
      id: '13',
      username: 'fujita_takeshi',
      avatarUrl: null,
      displayName: '藤田武',
      bio: null,
    },
    currentTitle: TITLE_MASTER[3],
    monthlyDays: 6,
    totalDays: 67,
    currentStreak: 0,
    maxStreak: 28,
  },
  {
    user: {
      id: '16',
      username: 'kimura_saki',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kimura',
      displayName: '木村咲',
      bio: '新しいことに挑戦中',
    },
    currentTitle: TITLE_MASTER[2],
    monthlyDays: 5,
    totalDays: 56,
    currentStreak: 3,
    maxStreak: 14,
  },
  {
    user: {
      id: '6',
      username: 'ito_mika',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ito',
      displayName: '伊藤美香',
      bio: '朝活コミュニティ楽しい！',
    },
    currentTitle: TITLE_MASTER[2],
    monthlyDays: 4,
    totalDays: 45,
    currentStreak: 8,
    maxStreak: 15,
  },
  {
    user: {
      id: '8',
      username: 'yoshida_mai',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yoshida',
      displayName: '吉田舞',
      bio: '最近始めました！',
    },
    currentTitle: TITLE_MASTER[1],
    monthlyDays: 3,
    totalDays: 23,
    currentStreak: 5,
    maxStreak: 10,
  },
];

// ========================================
// ランキング生成ヘルパー関数
// ========================================

type SortKey = 'monthlyDays' | 'totalDays' | 'currentStreak';

function createRanking(sortKey: SortKey): RankingEntry[] {
  const sorted = [...dummyRankingEntries].sort(
    (a, b) => b[sortKey] - a[sortKey],
  );

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    isCurrentUser: entry.user.id === CURRENT_USER_ID,
  }));
}

/** 月間ランキング（今月の参加日数順） */
export const monthlyRanking: RankingEntry[] = createRanking('monthlyDays');

/** 総合ランキング（総参加日数順） */
export const totalRanking: RankingEntry[] = createRanking('totalDays');

/** 連続日数ランキング（現在の連続日数順） */
export const streakRanking: RankingEntry[] = createRanking('currentStreak');

/** ランキングタイプからランキングデータを取得 */
export function getRankingByType(type: RankingType): RankingEntry[] {
  switch (type) {
    case 'monthly':
      return monthlyRanking;
    case 'total':
      return totalRanking;
    case 'streak':
      return streakRanking;
  }
}

/** 現在のユーザーのランキング情報を取得 */
export function getCurrentUserRanking(): CurrentUserRanking {
  const currentUserEntry = dummyRankingEntries.find(
    (entry) => entry.user.id === CURRENT_USER_ID,
  );

  if (!currentUserEntry) {
    throw new Error('Current user not found in ranking data');
  }

  return {
    monthlyRank:
      monthlyRanking.findIndex((e) => e.user.id === CURRENT_USER_ID) + 1,
    totalRank: totalRanking.findIndex((e) => e.user.id === CURRENT_USER_ID) + 1,
    streakRank:
      streakRanking.findIndex((e) => e.user.id === CURRENT_USER_ID) + 1,
    monthlyDays: currentUserEntry.monthlyDays,
    totalDays: currentUserEntry.totalDays,
    currentStreak: currentUserEntry.currentStreak,
  };
}

/** スコアのラベルを取得 */
export function getScoreLabel(type: RankingType): string {
  switch (type) {
    case 'monthly':
      return '今月';
    case 'total':
      return '総参加';
    case 'streak':
      return '連続';
  }
}

/** スコア値を取得 */
export function getScoreValue(entry: RankingEntry, type: RankingType): number {
  switch (type) {
    case 'monthly':
      return entry.monthlyDays;
    case 'total':
      return entry.totalDays;
    case 'streak':
      return entry.currentStreak;
  }
}

/** ランキングタイプの表示名 */
export const RANKING_TYPE_LABELS: Record<RankingType, string> = {
  monthly: '今月のランキング',
  total: '総合ランキング',
  streak: '連続日数ランキング',
};

/** ランキングタイプの説明 */
export const RANKING_TYPE_DESCRIPTIONS: Record<RankingType, string> = {
  monthly: '今月の参加日数でランキング',
  total: '累計の参加日数でランキング',
  streak: '現在の連続参加日数でランキング',
};
