'use client';

import { Card } from '@/shared/ui/shadcn/ui/card';

interface UserStatsCardProps {
  totalAttendanceDays: number;
  achievedTitlesCount: number;
}

export function UserStatsCard({
  totalAttendanceDays,
  achievedTitlesCount,
}: UserStatsCardProps) {
  return (
    <Card variant='raised' className='flex h-full flex-col p-4'>
      <p className='text-xs text-muted-foreground'>あなたの記録</p>
      <div className='mt-3 flex flex-1 flex-col gap-3'>
        {/* 総参加日数 */}
        <div className='flex flex-1 flex-col justify-center rounded-xl p-3 shadow-inset-sm'>
          <p className='text-2xl font-bold text-primary'>
            {totalAttendanceDays}
          </p>
          <p className='text-xs text-muted-foreground'>総参加日数</p>
        </div>
        {/* 獲得した称号 */}
        <div className='flex flex-1 flex-col justify-center rounded-xl p-3 shadow-inset-sm'>
          <p className='text-2xl font-bold'>{achievedTitlesCount}</p>
          <p className='text-xs text-muted-foreground'>獲得した称号</p>
        </div>
      </div>
    </Card>
  );
}
