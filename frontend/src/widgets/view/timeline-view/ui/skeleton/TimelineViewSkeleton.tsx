'use client';

import { Skeleton } from '@/shared/ui/shadcn/ui/skeleton';

interface TimelineViewSkeletonProps {
  rowCount?: number;
  labelWidth?: number;
  cellWidth?: number;
  rowHeight?: number;
}

export function TimelineViewSkeleton({
  rowCount = 4,
  labelWidth = 240,
  cellWidth = 40,
  rowHeight = 64,
}: TimelineViewSkeletonProps) {
  const daysCount = 15;

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {/* ヘッダー */}
      <div className='flex' style={{ height: 48 }}>
        <div
          className='flex shrink-0 items-center px-4'
          style={{ width: labelWidth }}
        >
          <Skeleton className='h-5 w-24' />
        </div>
        <div className='flex gap-1'>
          {Array.from({ length: daysCount }).map((_, index) => (
            <Skeleton
              key={index}
              className='shrink-0'
              style={{ width: cellWidth - 4, height: 28 }}
            />
          ))}
        </div>
      </div>

      {/* 行 */}
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className='flex'
          style={{ height: rowHeight }}
        >
          {/* ラベル */}
          <div
            className='flex shrink-0 items-center gap-3 px-4'
            style={{ width: labelWidth }}
          >
            <Skeleton className='size-10 rounded-full' />
            <div className='flex-1'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='mt-1 h-3 w-20' />
            </div>
          </div>

          {/* バー */}
          <div className='flex flex-1 items-center'>
            <Skeleton
              className='h-8 rounded-full'
              style={{ width: `${30 + rowIndex * 15}%`, marginLeft: `${rowIndex * 10}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
