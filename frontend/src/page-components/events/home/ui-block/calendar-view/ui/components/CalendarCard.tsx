'use client';

import { Clock, User, Users } from 'lucide-react';
import { cn } from '@/shared/ui/shadcn/lib/utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/shadcn/ui/avatar';

import type { EventItem, EventType } from '@/shared/dummy-data/events/events';

interface CalendarCardProps {
  event: EventItem;
  onClick?: (event: EventItem) => void;
}

/** イベントタイプに対応する左ボーダーの色 */
const EVENT_TYPE_BORDER_COLORS: Record<EventType, string> = {
  study: 'border-l-blue-500',
  exercise: 'border-l-green-500',
  meditation: 'border-l-purple-500',
  reading: 'border-l-amber-500',
  general: 'border-l-gray-500',
};

export function CalendarCard({ event, onClick }: CalendarCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(event);
  };

  const participantCount = event.participants.filter(
    (p) => p.status === 'registered'
  ).length;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full cursor-pointer  px-2 py-1 text-left transition-all',
        EVENT_TYPE_BORDER_COLORS[event.eventType]
      )}
    >
      {/* 主催者アイコン（左） & 文字群（右） */}
      <div className="flex items-start gap-1.5">
        <Avatar className="size-5 shrink-0">
          <AvatarImage src={event.creator.avatarUrl ?? undefined} />
          <AvatarFallback>
            <User className="size-2.5" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          {/* タイトル */}
          <p className="truncate text-xs font-medium leading-tight">
            {event.title}
          </p>
          {/* 時間 & 参加者数 */}
          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Clock className="size-2.5" />
              {event.startTime}
            </span>
            <span className="flex items-center gap-0.5">
              <Users className="size-2.5" />
              {participantCount}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
