'use client';

import type { EventListItem } from '@/entities/domain/event/model/types';
import { CalendarViewWidget } from '@/widgets/view/calendar-view/ui/CalendarViewWidget';

import { CalendarCard } from './components/CalendarCard';

interface EventsCalendarViewProps {
  year: number;
  month: number;
  events: EventListItem[];
  isLoading?: boolean;
  onEventClick?: (event: EventListItem) => void;
}

export function EventsCalendarView({
  year,
  month,
  events,
  isLoading,
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
