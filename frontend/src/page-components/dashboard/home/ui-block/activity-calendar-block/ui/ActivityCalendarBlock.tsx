'use client';

import { useState, useCallback } from 'react';

import { useMyEvents } from '@/features/domain/event/get-my-events/lib/use-my-events';
import { ActivityCalendarView } from '@/page-components/activity/home/ui-block/calendar-view/ui/ActivityCalendarView';

export function ActivityCalendarBlock() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);

  const { data } = useMyEvents({ year: currentYear, month: currentMonth });

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 1) {
        setCurrentYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev === 12) {
        setCurrentYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
  }, []);

  return (
      <ActivityCalendarView
        year={currentYear}
        month={currentMonth}
        events={data?.data.events ?? []}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
  );
}
