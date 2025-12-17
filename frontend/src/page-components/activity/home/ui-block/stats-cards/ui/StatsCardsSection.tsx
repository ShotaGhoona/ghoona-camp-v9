'use client';

import { Card } from '@/shared/ui/shadcn/ui/card';
import { Calendar, Flame, Trophy, CalendarDays } from 'lucide-react';
import type { AttendanceStatistics } from '@/shared/dummy-data/activity/activity';
import { formatDuration } from '@/shared/dummy-data/activity/activity';

interface StatsCardsSectionProps {
  statistics: AttendanceStatistics;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
}

function StatCard({ icon, label, value, subValue }: StatCardProps) {
  return (
    <Card variant='raised' className='flex min-h-0 flex-1 flex-col p-4'>
      <div className='flex items-center gap-3'>
        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted shadow-raised-sm'>
          {icon}
        </div>
        <p className='text-xs text-muted-foreground'>{label}</p>
      </div>
      <div className='mt-3 flex flex-1 flex-col justify-center rounded-xl p-3 shadow-inset-sm'>
        <p className='text-2xl font-bold text-primary'>{value}</p>
        {subValue && (
          <p className='text-xs text-muted-foreground'>{subValue}</p>
        )}
      </div>
    </Card>
  );
}

export function StatsCardsSection({ statistics }: StatsCardsSectionProps) {
  return (
    <div className='flex w-72 shrink-0 flex-col gap-4 p-4'>
      {/* 総参加日数 */}
      <StatCard
        icon={<Calendar className='size-5 text-primary' />}
        label='総参加日数'
        value={`${statistics.totalAttendanceDays}日`}
        subValue={formatDuration(statistics.totalDurationMinutes)}
      />

      {/* 連続参加日数 */}
      <StatCard
        icon={<Flame className='size-5 text-primary' />}
        label='連続参加'
        value={`${statistics.currentStreakDays}日`}
        subValue='継続中'
      />

      {/* 最大連続 */}
      <StatCard
        icon={<Trophy className='size-5 text-primary' />}
        label='最大連続'
        value={`${statistics.maxStreakDays}日`}
        subValue='自己ベスト'
      />

      {/* 今月の参加 */}
      <StatCard
        icon={<CalendarDays className='size-5 text-primary' />}
        label='今月の参加'
        value={`${statistics.thisMonthDays}日`}
        subValue={`今週 ${statistics.thisWeekDays}日`}
      />
    </div>
  );
}
