/**
 * イベントダミーデータ
 * API接続後に削除予定
 */

/** イベントタイプ */
export type EventType =
  | 'study'
  | 'exercise'
  | 'meditation'
  | 'reading'
  | 'general';

/** イベントタイプのラベル */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  study: '勉強',
  exercise: '運動',
  meditation: '瞑想',
  reading: '読書',
  general: 'その他',
};

/** 全イベントタイプ */
export const ALL_EVENT_TYPES: EventType[] = [
  'study',
  'exercise',
  'meditation',
  'reading',
  'general',
];

/** 参加状態 */
export type ParticipantStatus = 'registered' | 'cancelled';

/** イベント参加者 */
export interface EventParticipant {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string | null;
  status: ParticipantStatus;
}

/** イベント作成者 */
export interface EventCreator {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

/** イベントアイテム */
export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  eventType: EventType;
  scheduledDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxParticipants: number | null;
  isRecurring: boolean;
  recurrencePattern: string | null;
  creator: EventCreator;
  participants: EventParticipant[];
  isActive: boolean;
  createdAt: string;
}

/** ダミーのイベントデータ */
export const dummyEvents: EventItem[] = [
  // 2025年1月のイベント
  {
    id: 'evt-001',
    title: '朝の瞑想会',
    description: '心を落ち着かせて1日をスタート。初心者歓迎です。',
    eventType: 'meditation',
    scheduledDate: '2025-01-06',
    startTime: '06:00',
    endTime: '06:30',
    maxParticipants: 10,
    isRecurring: true,
    recurrencePattern: 'weekly',
    creator: {
      id: '1',
      displayName: '山田太郎',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
    },
    participants: [
      {
        id: 'p-001',
        userId: '2',
        userName: '鈴木花子',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki',
        status: 'registered',
      },
      {
        id: 'p-002',
        userId: '3',
        userName: '田中二郎',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'evt-002',
    title: 'プログラミング勉強会',
    description: 'Reactの基礎を一緒に学びましょう。各自作業でもOK！',
    eventType: 'study',
    scheduledDate: '2025-01-08',
    startTime: '06:00',
    endTime: '07:00',
    maxParticipants: 20,
    isRecurring: false,
    recurrencePattern: null,
    creator: {
      id: '2',
      displayName: '鈴木花子',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki',
    },
    participants: [
      {
        id: 'p-003',
        userId: '1',
        userName: '山田太郎',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
        status: 'registered',
      },
      {
        id: 'p-004',
        userId: '4',
        userName: '佐藤ゆき',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sato',
        status: 'registered',
      },
      {
        id: 'p-005',
        userId: '11',
        userName: '高橋優',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=takahashi',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-02T00:00:00Z',
  },
  {
    id: 'evt-003',
    title: '朝ラン部',
    description: '軽いジョギングで体を目覚めさせよう！雨天中止。',
    eventType: 'exercise',
    scheduledDate: '2025-01-10',
    startTime: '06:00',
    endTime: '06:45',
    maxParticipants: 8,
    isRecurring: true,
    recurrencePattern: 'weekly',
    creator: {
      id: '5',
      displayName: '渡辺健',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe',
    },
    participants: [
      {
        id: 'p-006',
        userId: '1',
        userName: '山田太郎',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-03T00:00:00Z',
  },
  {
    id: 'evt-004',
    title: '読書会：ビジネス書',
    description: '今月の課題図書について語り合いましょう。',
    eventType: 'reading',
    scheduledDate: '2025-01-15',
    startTime: '06:00',
    endTime: '07:00',
    maxParticipants: 15,
    isRecurring: false,
    recurrencePattern: null,
    creator: {
      id: '7',
      displayName: '小林涼',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kobayashi',
    },
    participants: [
      {
        id: 'p-007',
        userId: '2',
        userName: '鈴木花子',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki',
        status: 'registered',
      },
      {
        id: 'p-008',
        userId: '11',
        userName: '高橋優',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=takahashi',
        status: 'registered',
      },
      {
        id: 'p-009',
        userId: '6',
        userName: '伊藤美香',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ito',
        status: 'registered',
      },
      {
        id: 'p-010',
        userId: '5',
        userName: '渡辺健',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-04T00:00:00Z',
  },
  {
    id: 'evt-005',
    title: 'もくもく作業会',
    description: '各自の作業を黙々と進める会。集中力UP！',
    eventType: 'general',
    scheduledDate: '2025-01-17',
    startTime: '06:00',
    endTime: '07:00',
    maxParticipants: null,
    isRecurring: false,
    recurrencePattern: null,
    creator: {
      id: '11',
      displayName: '高橋優',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=takahashi',
    },
    participants: [
      {
        id: 'p-011',
        userId: '1',
        userName: '山田太郎',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
        status: 'registered',
      },
      {
        id: 'p-012',
        userId: '2',
        userName: '鈴木花子',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki',
        status: 'registered',
      },
      {
        id: 'p-013',
        userId: '3',
        userName: '田中二郎',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-05T00:00:00Z',
  },
  {
    id: 'evt-006',
    title: '英語学習会',
    description: 'オンライン英会話の予習・復習を一緒にしよう',
    eventType: 'study',
    scheduledDate: '2025-01-20',
    startTime: '06:00',
    endTime: '07:00',
    maxParticipants: 10,
    isRecurring: true,
    recurrencePattern: 'weekly',
    creator: {
      id: '12',
      displayName: '森田佳奈',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=morita',
    },
    participants: [
      {
        id: 'p-014',
        userId: '5',
        userName: '渡辺健',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-06T00:00:00Z',
  },
  {
    id: 'evt-007',
    title: 'ヨガ＆ストレッチ',
    description: '朝の体をほぐす優しいヨガ。初心者大歓迎！',
    eventType: 'exercise',
    scheduledDate: '2025-01-22',
    startTime: '06:00',
    endTime: '06:30',
    maxParticipants: 12,
    isRecurring: false,
    recurrencePattern: null,
    creator: {
      id: '16',
      displayName: '木村咲',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kimura',
    },
    participants: [
      {
        id: 'p-015',
        userId: '2',
        userName: '鈴木花子',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki',
        status: 'registered',
      },
      {
        id: 'p-016',
        userId: '11',
        userName: '高橋優',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=takahashi',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-07T00:00:00Z',
  },
  {
    id: 'evt-008',
    title: 'マインドフルネス入門',
    description: 'ストレス軽減のための瞑想テクニックを学ぶ',
    eventType: 'meditation',
    scheduledDate: '2025-01-25',
    startTime: '06:00',
    endTime: '06:45',
    maxParticipants: 8,
    isRecurring: false,
    recurrencePattern: null,
    creator: {
      id: '1',
      displayName: '山田太郎',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
    },
    participants: [
      {
        id: 'p-017',
        userId: '4',
        userName: '佐藤ゆき',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sato',
        status: 'registered',
      },
      {
        id: 'p-018',
        userId: '6',
        userName: '伊藤美香',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ito',
        status: 'registered',
      },
      {
        id: 'p-019',
        userId: '5',
        userName: '渡辺健',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-08T00:00:00Z',
  },
  {
    id: 'evt-009',
    title: '資格試験対策会',
    description: 'IT系資格の勉強を一緒に頑張ろう！',
    eventType: 'study',
    scheduledDate: '2025-01-27',
    startTime: '06:00',
    endTime: '07:00',
    maxParticipants: 15,
    isRecurring: true,
    recurrencePattern: 'weekly',
    creator: {
      id: '15',
      displayName: '小川博',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ogawa',
    },
    participants: [
      {
        id: 'p-020',
        userId: '2',
        userName: '鈴木花子',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki',
        status: 'registered',
      },
      {
        id: 'p-021',
        userId: '3',
        userName: '田中二郎',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-09T00:00:00Z',
  },
  {
    id: 'evt-010',
    title: '朝活フリートーク',
    description: 'ゆるく雑談しながら朝を過ごそう',
    eventType: 'general',
    scheduledDate: '2025-01-30',
    startTime: '06:00',
    endTime: '07:00',
    maxParticipants: null,
    isRecurring: false,
    recurrencePattern: null,
    creator: {
      id: '3',
      displayName: '田中二郎',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka',
    },
    participants: [
      {
        id: 'p-022',
        userId: '1',
        userName: '山田太郎',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
        status: 'registered',
      },
      {
        id: 'p-023',
        userId: '11',
        userName: '高橋優',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=takahashi',
        status: 'registered',
      },
      {
        id: 'p-024',
        userId: '6',
        userName: '伊藤美香',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ito',
        status: 'registered',
      },
      {
        id: 'p-025',
        userId: '5',
        userName: '渡辺健',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-10T00:00:00Z',
  },
  // 同じ日に複数イベントがあるケース
  {
    id: 'evt-011',
    title: '朝の写経会',
    description: '心を静めて写経に集中。精神統一におすすめ。',
    eventType: 'meditation',
    scheduledDate: '2025-01-15',
    startTime: '06:30',
    endTime: '07:00',
    maxParticipants: 5,
    isRecurring: false,
    recurrencePattern: null,
    creator: {
      id: '14',
      displayName: '清水凛',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shimizu',
    },
    participants: [
      {
        id: 'p-026',
        userId: '1',
        userName: '山田太郎',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-11T00:00:00Z',
  },
  {
    id: 'evt-012',
    title: 'HIIT朝トレ',
    description: '短時間で効果的！高強度インターバルトレーニング',
    eventType: 'exercise',
    scheduledDate: '2025-01-15',
    startTime: '06:00',
    endTime: '06:20',
    maxParticipants: 10,
    isRecurring: false,
    recurrencePattern: null,
    creator: {
      id: '5',
      displayName: '渡辺健',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe',
    },
    participants: [
      {
        id: 'p-027',
        userId: '4',
        userName: '佐藤ゆき',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sato',
        status: 'registered',
      },
      {
        id: 'p-028',
        userId: '6',
        userName: '伊藤美香',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ito',
        status: 'registered',
      },
    ],
    isActive: true,
    createdAt: '2025-01-12T00:00:00Z',
  },
];

/** イベントタイプに対応する色 */
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  study: 'bg-blue-100 text-blue-700 border-blue-200',
  exercise: 'bg-green-100 text-green-700 border-green-200',
  meditation: 'bg-purple-100 text-purple-700 border-purple-200',
  reading: 'bg-amber-100 text-amber-700 border-amber-200',
  general: 'bg-gray-100 text-gray-700 border-gray-200',
};

/** イベントタイプに対応するアイコン色（Badge用） */
export const EVENT_TYPE_BADGE_VARIANTS: Record<
  EventType,
  'default' | 'secondary' | 'outline'
> = {
  study: 'default',
  exercise: 'secondary',
  meditation: 'outline',
  reading: 'secondary',
  general: 'outline',
};
