'use client';

import { Card } from '@/shared/ui/shadcn/ui/card';
import { cn } from '@/shared/ui/shadcn/lib/utils';
import { TITLE_MASTER } from '@/shared/domain/title/data/title-master';

interface TitleJourneyProgressProps {
  totalAttendanceDays: number;
  currentLevel: number;
}

const MAX_DAYS = 365;

export function TitleJourneyProgress({
  totalAttendanceDays,
  currentLevel,
}: TitleJourneyProgressProps) {
  const progressPercentage = Math.min(
    (totalAttendanceDays / MAX_DAYS) * 100,
    100,
  );

  return (
    <Card
      variant='raised'
      className='relative h-full flex-1 overflow-hidden p-0'
    >
      {/* 背景: 8分割（全てグレー） */}
      <div className='absolute inset-0 flex'>
        {TITLE_MASTER.map((title) => (
          <div
            key={title.level}
            className='relative h-full flex-1 overflow-hidden'
          >
            <img
              src={title.imageUrl}
              alt={title.nameJp}
              className='size-full object-cover object-top opacity-30 grayscale'
            />
          </div>
        ))}
        <div className='absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40' />
      </div>

      {/* コンテンツ */}
      <div className='relative flex h-full flex-col justify-end p-4'>
        {/* マイルストーン（数字ベースの位置） */}
        <div className='relative mb-2'>
          {TITLE_MASTER.map((title, index) => {
            const isAchieved = index + 1 <= currentLevel;
            const isCurrent = index + 1 === currentLevel;
            const position = (title.requiredDays / MAX_DAYS) * 100;

            return (
              <div
                key={title.level}
                className='absolute bottom-0 flex flex-col items-center'
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
              >
                <span
                  className={cn(
                    'whitespace-nowrap text-xs transition-all',
                    isCurrent
                      ? 'font-bold text-foreground'
                      : isAchieved
                        ? 'text-foreground/70'
                        : 'text-muted-foreground/50',
                  )}
                  style={{ writingMode: 'vertical-rl' }}
                >
                  {title.nameJp}
                </span>
              </div>
            );
          })}
        </div>

        {/* プログレスバー */}
        <div>
          <div className='h-2 overflow-hidden rounded-full bg-muted/50 backdrop-blur-sm'>
            <div
              className='h-full rounded-full transition-all duration-700'
              style={{
                width: `${progressPercentage}%`,
                background:
                  'linear-gradient(to right, #a78bfa 0%, #34d399 30%, #fb923c 50%, #f87171 70%, #fbbf24 100%)',
              }}
            />
          </div>
          <div className='mt-1.5 flex items-center justify-between text-xs text-muted-foreground'>
            <span>{totalAttendanceDays}日目</span>
            <span>{MAX_DAYS}日</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
