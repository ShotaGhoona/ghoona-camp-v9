'use client';

import { RotateCcw } from 'lucide-react';

import { cn } from '@/shared/ui/shadcn/lib/utils';
import { Button } from '@/shared/ui/shadcn/ui/button';
import { Badge } from '@/shared/ui/shadcn/ui/badge';
import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import { Card, CardContent } from '@/shared/ui/shadcn/ui/card';

import type { EventType } from '@/entities/domain/event/model/types';
import { ALL_EVENT_TYPES, EVENT_TYPE_LABELS } from '@/shared/domain/event/data/event-master';

import type { EventsFilterState } from '../model/types';
import { initialFilterState, isFilterActive } from '../model/types';

interface EventsFilterSidebarProps {
  isOpen: boolean;
  filter: EventsFilterState;
  onFilterChange: (filter: EventsFilterState) => void;
}

export function EventsFilterSidebar({
  isOpen,
  filter,
  onFilterChange,
}: EventsFilterSidebarProps) {
  const handleEventTypeToggle = (eventType: EventType) => {
    const newTypes = filter.selectedEventTypes.includes(eventType)
      ? filter.selectedEventTypes.filter((t) => t !== eventType)
      : [...filter.selectedEventTypes, eventType];
    onFilterChange({ ...filter, selectedEventTypes: newTypes });
  };

  const handleParticipationChange = (status: boolean | null) => {
    onFilterChange({ ...filter, participationStatus: status });
  };

  const handleReset = () => {
    onFilterChange(initialFilterState);
  };

  return (
    <div
      className={cn(
        'relative flex min-h-0 shrink-0 flex-col overflow-hidden bg-background py-2 shadow-raised',
        'transition-all duration-300 ease-out',
        isOpen ? 'w-72 opacity-100' : 'w-0 opacity-0',
      )}
    >
      {/* リセットボタン */}
      {isFilterActive(filter) && (
        <div className='absolute right-2 top-2 z-10'>
          <Button
            variant='ghost'
            size='icon'
            className='size-8'
            onClick={handleReset}
            title='リセット'
          >
            <RotateCcw className='size-4' />
          </Button>
        </div>
      )}

      {/* フィルター内容 */}
      <ScrollArea className='min-h-0 flex-1 pt-2'>
        <div className='space-y-6 p-4'>
          {/* イベントタイプフィルター */}
          <div className='space-y-3'>
            <h3 className='text-base font-medium text-foreground'>
              イベントタイプ
              {filter.selectedEventTypes.length > 0 && (
                <span className='ml-2 text-sm font-normal text-muted-foreground'>
                  ({filter.selectedEventTypes.length}件選択)
                </span>
              )}
            </h3>
            <Card variant='inset' className='py-3'>
              <CardContent className='flex flex-wrap gap-2 px-3'>
                {ALL_EVENT_TYPES.map((eventType) => (
                  <Badge
                    key={eventType}
                    variant={
                      filter.selectedEventTypes.includes(eventType)
                        ? 'default'
                        : 'outline'
                    }
                    className='cursor-pointer transition-colors'
                    onClick={() => handleEventTypeToggle(eventType)}
                  >
                    {EVENT_TYPE_LABELS[eventType]}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 参加状態フィルター */}
          <div className='space-y-3'>
            <h3 className='text-base font-medium text-foreground'>参加状態</h3>
            <Card variant='inset' className='py-3'>
              <CardContent className='flex flex-wrap gap-2 px-3'>
                <Badge
                  variant={
                    filter.participationStatus === null ? 'default' : 'outline'
                  }
                  className='cursor-pointer transition-colors'
                  onClick={() => handleParticipationChange(null)}
                >
                  すべて
                </Badge>
                <Badge
                  variant={
                    filter.participationStatus === true ? 'default' : 'outline'
                  }
                  className='cursor-pointer transition-colors'
                  onClick={() => handleParticipationChange(true)}
                >
                  参加済み
                </Badge>
                <Badge
                  variant={
                    filter.participationStatus === false ? 'default' : 'outline'
                  }
                  className='cursor-pointer transition-colors'
                  onClick={() => handleParticipationChange(false)}
                >
                  未参加
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
