'use client';

import type { EventListItem } from '@/entities/domain/event/model/types';
import { GalleryViewWidget } from '@/widgets/view/gallery-view/ui/GalleryViewWidget';

import { EventCard } from './components/EventCard';

interface EventsGalleryViewProps {
  events: EventListItem[];
  isLoading?: boolean;
  onEventClick?: (event: EventListItem) => void;
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
      pageSizeOptions={[20, 40, 60]}
    />
  );
}
