'use client';

import { useState, useCallback } from 'react';

import { useEvents } from '@/features/domain/event/get-events/lib/use-events';
import { EventsCalendarView } from '@/page-components/events/home/ui-block/calendar-view/ui/EventsCalendarView';

export function EventsCalendarBlock() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);

  const { data } = useEvents({ year: currentYear, month: currentMonth });

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
    <EventsCalendarView
      year={currentYear}
      month={currentMonth}
      events={data?.data.events ?? []}
    />
  );
}
