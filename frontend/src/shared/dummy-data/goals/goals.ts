/**
 * 目標ダミーデータ
 * API接続後に削除予定
 */

/** 目標作成者 */
export interface GoalCreator {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

/** 目標アイテム */
export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  startedAt: string; // YYYY-MM-DD
  endedAt: string | null; // YYYY-MM-DD
  isActive: boolean;
  isPublic: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  // 表示用に作成者情報を追加
  creator: GoalCreator;
}

/** カテゴリ（フィルター用、DBにはないがUI用） */
export type GoalCategory = 'study' | 'health' | 'career' | 'hobby' | 'other';

export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  study: '学習',
  health: '健康',
  career: 'キャリア',
  hobby: '趣味',
  other: 'その他',
};

export const ALL_GOAL_CATEGORIES: GoalCategory[] = [
  'study',
  'health',
  'career',
  'hobby',
  'other',
];

/** ダミーの目標データ */
export const dummyGoals: GoalItem[] = [
  // 自分（user-001）の目標
  {
    id: 'goal-001',
    userId: 'user-001',
    title: 'TypeScriptを完全にマスターする',
    description:
      'TypeScriptの型システムを深く理解し、複雑な型定義も自在に扱えるようになる。特にジェネリクス、条件型、マップ型を重点的に学習する。',
    startedAt: '2025-01-01',
    endedAt: '2025-06-30',
    isActive: true,
    isPublic: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    creator: {
      id: 'user-001',
      displayName: '山田太郎',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
    },
  },
  {
    id: 'goal-002',
    userId: 'user-001',
    title: '朝5時起きを習慣化する',
    description:
      '毎日5時に起床し、朝活の時間を確保する。最初は5:30から始めて徐々に早くしていく。',
    startedAt: '2025-01-01',
    endedAt: '2025-03-31',
    isActive: true,
    isPublic: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    creator: {
      id: 'user-001',
      displayName: '山田太郎',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
    },
  },
  {
    id: 'goal-003',
    userId: 'user-001',
    title: 'AWS認定ソリューションアーキテクト取得',
    description:
      'AWS SAA-C03に合格する。毎朝30分の学習時間を確保し、模擬試験で80%以上取れるようになったら受験する。',
    startedAt: '2025-02-01',
    endedAt: '2025-05-31',
    isActive: true,
    isPublic: false,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    creator: {
      id: 'user-001',
      displayName: '山田太郎',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
    },
  },
  {
    id: 'goal-004',
    userId: 'user-001',
    title: '毎日10分の瞑想',
    description: null,
    startedAt: '2024-11-01',
    endedAt: null,
    isActive: true,
    isPublic: true,
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
    creator: {
      id: 'user-001',
      displayName: '山田太郎',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
    },
  },
  {
    id: 'goal-005',
    userId: 'user-001',
    title: '技術ブログを月2本書く',
    description:
      '学んだことをアウトプットしてより深く理解する。Zennまたはnoteに投稿する。',
    startedAt: '2024-10-01',
    endedAt: '2025-12-31',
    isActive: false,
    isPublic: true,
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z',
    creator: {
      id: 'user-001',
      displayName: '山田太郎',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
    },
  },

  // 他のユーザーの公開目標
  {
    id: 'goal-101',
    userId: '2',
    title: 'Figmaでデザインシステムを構築',
    description:
      '自分専用のデザインシステムをFigmaで構築し、効率的なUIデザインワークフローを確立する。',
    startedAt: '2025-01-01',
    endedAt: '2025-04-30',
    isActive: true,
    isPublic: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    creator: {
      id: '2',
      displayName: '鈴木花子',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki',
    },
  },
  {
    id: 'goal-102',
    userId: '2',
    title: 'TOEIC 900点突破',
    description:
      '現在のスコア850点から900点以上を目指す。毎朝リスニングとリーディングの練習を続ける。',
    startedAt: '2025-01-15',
    endedAt: '2025-07-31',
    isActive: true,
    isPublic: true,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
    creator: {
      id: '2',
      displayName: '鈴木花子',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki',
    },
  },
  {
    id: 'goal-103',
    userId: '3',
    title: '起業準備を完了させる',
    description:
      '年内に法人設立の準備を完了させる。事業計画書の作成、資金調達計画の策定を行う。',
    startedAt: '2025-01-01',
    endedAt: '2025-12-31',
    isActive: true,
    isPublic: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    creator: {
      id: '3',
      displayName: '田中二郎',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka',
    },
  },
  {
    id: 'goal-104',
    userId: '4',
    title: '公認会計士試験に合格する',
    description:
      '今年の試験で短答式・論文式ともに合格する。朝活で毎日3時間の勉強時間を確保。',
    startedAt: '2025-01-01',
    endedAt: '2025-08-31',
    isActive: true,
    isPublic: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    creator: {
      id: '4',
      displayName: '佐藤ゆき',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sato',
    },
  },
  {
    id: 'goal-105',
    userId: '5',
    title: 'フルマラソン完走',
    description:
      '東京マラソンでフルマラソンを完走する。毎朝のランニングで距離を伸ばしていく。',
    startedAt: '2024-10-01',
    endedAt: '2025-03-15',
    isActive: true,
    isPublic: true,
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-10-01T00:00:00Z',
    creator: {
      id: '5',
      displayName: '渡辺健',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe',
    },
  },
  {
    id: 'goal-106',
    userId: '6',
    title: 'ライティング収入月20万円達成',
    description:
      '副業ライターとして安定した収入を得る。案件数を増やしつつ単価も上げていく。',
    startedAt: '2025-01-01',
    endedAt: '2025-06-30',
    isActive: true,
    isPublic: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    creator: {
      id: '6',
      displayName: '伊藤美香',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ito',
    },
  },
  {
    id: 'goal-107',
    userId: '11',
    title: 'Kaggle コンペで金メダル獲得',
    description:
      '今年中にKaggleのコンペティションで金メダルを獲得し、Grandmasterへの道を進む。',
    startedAt: '2025-01-01',
    endedAt: '2025-12-31',
    isActive: true,
    isPublic: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    creator: {
      id: '11',
      displayName: '高橋優',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=takahashi',
    },
  },
  {
    id: 'goal-108',
    userId: '9',
    title: 'Rustでコンパイラを自作',
    description:
      '趣味プロジェクトとして小さなプログラミング言語のコンパイラをRustで実装する。',
    startedAt: '2025-02-01',
    endedAt: null,
    isActive: true,
    isPublic: true,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-02-01T00:00:00Z',
    creator: {
      id: '9',
      displayName: '中村翔',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nakamura',
    },
  },
  {
    id: 'goal-109',
    userId: '14',
    title: '毎日1枚イラストを描く',
    description:
      '365日チャレンジとして毎日イラストを1枚描いてSNSに投稿する。継続力をつける。',
    startedAt: '2025-01-01',
    endedAt: '2025-12-31',
    isActive: true,
    isPublic: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    creator: {
      id: '14',
      displayName: '清水凛',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shimizu',
    },
  },
  {
    id: 'goal-110',
    userId: '12',
    title: 'オンライン英会話講座を開設',
    description:
      '自分の英語講座をオンラインで展開し、より多くの人に英語学習の楽しさを伝える。',
    startedAt: '2025-03-01',
    endedAt: '2025-09-30',
    isActive: true,
    isPublic: true,
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z',
    creator: {
      id: '12',
      displayName: '森田佳奈',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=morita',
    },
  },
];

/** 自分のユーザーID（ダミー） */
export const CURRENT_USER_ID = 'user-001';

/** 自分の目標を取得 */
export function getMyGoals(): GoalItem[] {
  return dummyGoals.filter((goal) => goal.userId === CURRENT_USER_ID);
}

/** 公開目標を取得（自分以外） */
export function getPublicGoals(): GoalItem[] {
  return dummyGoals.filter(
    (goal) => goal.isPublic && goal.userId !== CURRENT_USER_ID
  );
}

/** 全ての閲覧可能な目標を取得（自分の全目標 + 他者の公開目標） */
export function getAllVisibleGoals(): GoalItem[] {
  return dummyGoals.filter(
    (goal) => goal.userId === CURRENT_USER_ID || goal.isPublic
  );
}

/** 目標の残り日数を計算 */
export function getRemainingDays(goal: GoalItem): number | null {
  if (!goal.endedAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(goal.endedAt);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/** 目標の進捗率を計算（期間ベース） */
export function getProgressPercent(goal: GoalItem): number | null {
  if (!goal.endedAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(goal.startedAt);
  const endDate = new Date(goal.endedAt);

  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  if (totalDays <= 0) return 100;
  const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  return Math.round(progress);
}
