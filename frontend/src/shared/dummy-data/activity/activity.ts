/**
 * 参加履歴ダミーデータ
 * API接続後に削除予定
 */

/** 参加サマリー（日単位） */
export interface AttendanceSummary {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  totalDurationMinutes: number;
  sessionCount: number;
  firstJoinTime: string | null; // HH:mm
  lastLeaveTime: string | null; // HH:mm
  isMorningActive: boolean; // 朝活時間帯(6-7時)の参加有無
}

/** 参加統計 */
export interface AttendanceStatistics {
  userId: string;
  totalAttendanceDays: number;
  currentStreakDays: number;
  maxStreakDays: number;
  lastAttendanceDate: string | null; // YYYY-MM-DD
  firstAttendanceDate: string | null; // YYYY-MM-DD
  totalDurationMinutes: number;
  thisMonthDays: number;
  thisWeekDays: number;
}

/** ログインユーザーの参加統計 */
export const dummyUserStatistics: AttendanceStatistics = {
  userId: '1',
  totalAttendanceDays: 47,
  currentStreakDays: 12,
  maxStreakDays: 21,
  lastAttendanceDate: '2025-01-18',
  firstAttendanceDate: '2024-11-01',
  totalDurationMinutes: 2820, // 47時間
  thisMonthDays: 14,
  thisWeekDays: 5,
};

/** ダミーの参加サマリーデータ（複数月分） */
export const dummyAttendanceSummaries: AttendanceSummary[] = [
  // 2024年12月
  {
    id: 'as-001',
    userId: '1',
    date: '2024-12-02',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-002',
    userId: '1',
    date: '2024-12-03',
    totalDurationMinutes: 55,
    sessionCount: 1,
    firstJoinTime: '06:05',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-003',
    userId: '1',
    date: '2024-12-05',
    totalDurationMinutes: 45,
    sessionCount: 1,
    firstJoinTime: '06:15',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-004',
    userId: '1',
    date: '2024-12-06',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-005',
    userId: '1',
    date: '2024-12-09',
    totalDurationMinutes: 50,
    sessionCount: 1,
    firstJoinTime: '06:10',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-006',
    userId: '1',
    date: '2024-12-10',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-007',
    userId: '1',
    date: '2024-12-11',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-008',
    userId: '1',
    date: '2024-12-12',
    totalDurationMinutes: 55,
    sessionCount: 1,
    firstJoinTime: '06:05',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-009',
    userId: '1',
    date: '2024-12-13',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-010',
    userId: '1',
    date: '2024-12-16',
    totalDurationMinutes: 45,
    sessionCount: 1,
    firstJoinTime: '06:15',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-011',
    userId: '1',
    date: '2024-12-17',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-012',
    userId: '1',
    date: '2024-12-18',
    totalDurationMinutes: 60,
    sessionCount: 2,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-013',
    userId: '1',
    date: '2024-12-19',
    totalDurationMinutes: 50,
    sessionCount: 1,
    firstJoinTime: '06:10',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-014',
    userId: '1',
    date: '2024-12-20',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-015',
    userId: '1',
    date: '2024-12-23',
    totalDurationMinutes: 55,
    sessionCount: 1,
    firstJoinTime: '06:05',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-016',
    userId: '1',
    date: '2024-12-24',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-017',
    userId: '1',
    date: '2024-12-25',
    totalDurationMinutes: 30,
    sessionCount: 1,
    firstJoinTime: '06:30',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-018',
    userId: '1',
    date: '2024-12-26',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-019',
    userId: '1',
    date: '2024-12-27',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  // 2025年1月（連続参加中）
  {
    id: 'as-020',
    userId: '1',
    date: '2025-01-06',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-021',
    userId: '1',
    date: '2025-01-07',
    totalDurationMinutes: 55,
    sessionCount: 1,
    firstJoinTime: '06:05',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-022',
    userId: '1',
    date: '2025-01-08',
    totalDurationMinutes: 60,
    sessionCount: 2,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-023',
    userId: '1',
    date: '2025-01-09',
    totalDurationMinutes: 45,
    sessionCount: 1,
    firstJoinTime: '06:15',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-024',
    userId: '1',
    date: '2025-01-10',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-025',
    userId: '1',
    date: '2025-01-13',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-026',
    userId: '1',
    date: '2025-01-14',
    totalDurationMinutes: 50,
    sessionCount: 1,
    firstJoinTime: '06:10',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-027',
    userId: '1',
    date: '2025-01-15',
    totalDurationMinutes: 60,
    sessionCount: 2,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-028',
    userId: '1',
    date: '2025-01-16',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-029',
    userId: '1',
    date: '2025-01-17',
    totalDurationMinutes: 55,
    sessionCount: 1,
    firstJoinTime: '06:05',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-030',
    userId: '1',
    date: '2025-01-20',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-031',
    userId: '1',
    date: '2025-01-21',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-032',
    userId: '1',
    date: '2025-01-22',
    totalDurationMinutes: 45,
    sessionCount: 1,
    firstJoinTime: '06:15',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
  {
    id: 'as-033',
    userId: '1',
    date: '2025-01-23',
    totalDurationMinutes: 60,
    sessionCount: 1,
    firstJoinTime: '06:00',
    lastLeaveTime: '07:00',
    isMorningActive: true,
  },
];

/** 時間をフォーマット（分 → X時間Y分） */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}分`;
  }
  if (mins === 0) {
    return `${hours}時間`;
  }
  return `${hours}時間${mins}分`;
}
