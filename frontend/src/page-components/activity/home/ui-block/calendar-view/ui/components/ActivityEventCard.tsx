'use client';

import { cn } from '@/shared/ui/shadcn/lib/utils';
import type { MyEventItem } from '@/entities/domain/event/model/types';
import { EVENT_TYPE_LABELS } from '@/shared/domain/event/data/event-master';

interface ActivityEventCardProps {
  event: MyEventItem;
  onClick?: (event: MyEventItem) => void;
}

export function ActivityEventCard({ event, onClick }: ActivityEventCardProps) {
  return (
    <button
      type='button'
      onClick={() => onClick?.(event)}
      className={cn(
        'w-full rounded-md bg-primary/20 px-2 py-1 text-left text-xs transition-colors',
        'hover:bg-primary/30',
      )}
    >
      <p className='truncate font-medium text-primary'>{event.title}</p>
      <p className='truncate text-[10px] text-muted-foreground'>
        {event.startTime} - {EVENT_TYPE_LABELS[event.eventType]}
      </p>
    </button>
  );
}
