'use client';

import type { EventItem } from '@/shared/dummy-data/events/events';
import { CalendarViewWidget } from '@/widgets/view/calendar-view/ui/CalendarViewWidget';

import { CalendarCard } from './components/CalendarCard';

interface EventsCalendarViewProps {
  year: number;
  month: number;
  events: EventItem[];
  onEventClick?: (event: EventItem) => void;
}

export function EventsCalendarView({
  year,
  month,
  events,
  onEventClick,
}: EventsCalendarViewProps) {
  return (
    <CalendarViewWidget
      year={year}
      month={month}
      data={events}
      dateExtractor={(event) => event.scheduledDate}
      keyExtractor={(event) => event.id}
      cardRenderer={(event) => (
        <CalendarCard event={event} onClick={onEventClick} />
      )}
    />
  );
}
