'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/ui/button';
import { CalendarViewWidget } from '@/widgets/view/calendar-view/ui/CalendarViewWidget';
import { ActivityEventCard } from './components/ActivityEventCard';
import type { MyEventItem } from '@/entities/domain/event/model/types';

interface ActivityCalendarViewProps {
  year: number;
  month: number;
  events: MyEventItem[];
  onEventClick?: (event: MyEventItem) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

/** 月名を取得 */
function getMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}

export function ActivityCalendarView({
  year,
  month,
  events,
  onEventClick,
  onPrevMonth,
  onNextMonth,
}: ActivityCalendarViewProps) {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {/* ヘッダー: 凡例 + 月ナビゲーション */}
      <div className='flex items-center justify-between px-4 pt-4'>
        {/* 凡例 */}
        <div className='flex items-center gap-2'>
          <div className='size-4 rounded bg-primary/10' />
          <span className='text-xs text-muted-foreground'>参加日</span>
        </div>

        {/* 月ナビゲーション */}
        <div className='flex items-center gap-2'>
          <Button
            variant='raised'
            size='icon'
            className='size-8'
            onClick={onPrevMonth}
          >
            <ChevronLeft className='size-4' />
          </Button>
          <span className='min-w-[100px] text-center font-medium'>
            {getMonthLabel(year, month)}
          </span>
          <Button
            variant='raised'
            size='icon'
            className='size-8'
            onClick={onNextMonth}
          >
            <ChevronRight className='size-4' />
          </Button>
        </div>
      </div>

      {/* カレンダー */}
      <CalendarViewWidget
        year={year}
        month={month}
        data={events}
        dateExtractor={(item) => item.scheduledDate}
        keyExtractor={(item) => item.id}
        cardRenderer={(item) => (
          <ActivityEventCard event={item} onClick={onEventClick} />
        )}
      />
    </div>
  );
}
