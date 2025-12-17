'use client';

import type { EventItem } from '@/shared/dummy-data/events/events';
import { GalleryViewWidget } from '@/widgets/view/gallery-view/ui/GalleryViewWidget';

import { EventCard } from './components/EventCard';

interface EventsGalleryViewProps {
  events: EventItem[];
  onEventClick?: (event: EventItem) => void;
}

export function EventsGalleryView({
  events,
  onEventClick,
}: EventsGalleryViewProps) {
  return (
    <GalleryViewWidget
      data={events}
      keyExtractor={(event) => event.id}
      cardRenderer={(event) => (
        <EventCard event={event} onClick={onEventClick} />
      )}
      defaultGridColumns={6}
      gridColumnOptions={[3, 4, 5, 6]}
      defaultPageSize={20}
      pageSizeOptions={[20, 40, 60]}
    />
  );
}
