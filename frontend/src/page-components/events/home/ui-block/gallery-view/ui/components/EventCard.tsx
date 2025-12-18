'use client';

import { Calendar, Clock, Eye, Repeat, User, Users } from 'lucide-react';

import { Badge } from '@/shared/ui/shadcn/ui/badge';
import { Card } from '@/shared/ui/shadcn/ui/card';

import type { EventItem } from '@/shared/dummy-data/events/events';
import { EVENT_TYPE_LABELS } from '@/shared/dummy-data/events/events';

interface EventCardProps {
  event: EventItem;
  onClick?: (event: EventItem) => void;
}

/** 日付をフォーマット（短縮形） */
function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[date.getDay()];
  return `${month}/${day}（${weekday}）`;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const handleClick = () => {
    onClick?.(event);
  };

  const participantCount = event.participants.filter(
    (p) => p.status === 'registered',
  ).length;

  return (
    <Card
      variant='raised'
      className='group relative cursor-pointer gap-0 overflow-hidden py-5 transition-all duration-500 hover:shadow-lg'
      onClick={handleClick}
    >
      {/* 背景レイヤー - ホバー時にグラデーション */}
      <div className='pointer-events-none absolute inset-0 z-0'>
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100' />
      </div>

      {/* メインコンテンツ */}
      <div className='relative z-10 flex flex-col items-center gap-3 px-4'>
        {/* 上部バッジエリア - ホバー時にフェードアウト */}
        <div className='flex w-full items-center justify-between transition-all duration-500 ease-out group-hover:opacity-0'>
          <Badge variant='secondary' className='text-xs'>
            {EVENT_TYPE_LABELS[event.eventType]}
          </Badge>
          {event.isRecurring && (
            <Badge variant='outline' className='gap-1 text-xs'>
              <Repeat className='size-3' />
              定期
            </Badge>
          )}
        </div>

        {/* クリック誘導アフォーダンス - ホバー時に表示 */}
        <div className='relative flex h-10 items-center justify-center'>
          <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 ease-out group-hover:opacity-100'>
            {/* パルスリング */}
            <div
              className='absolute size-12 animate-ping rounded-full bg-white/30'
              style={{ animationDuration: '1.5s' }}
            />
            <div className='absolute size-10 rounded-full bg-white/20 backdrop-blur-sm' />
            {/* アイコン */}
            <Eye className='relative size-4 text-white drop-shadow-lg' />
          </div>
        </div>

        {/* イベント名（主役）& 日時情報 - ホバー時に下に移動 */}
        <div className='flex flex-col items-center gap-2 text-center transition-all duration-500 ease-out group-hover:translate-y-6'>
          <h3 className='line-clamp-2 text-base font-semibold leading-tight transition-colors duration-500 group-hover:text-white'>
            {event.title}
          </h3>
          <div className='flex items-center gap-3 text-xs text-muted-foreground transition-colors duration-500 group-hover:text-white/80'>
            <div className='flex items-center gap-1'>
              <Calendar className='size-3' />
              <span>{formatDateShort(event.scheduledDate)}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Clock className='size-3' />
              <span>{event.startTime}</span>
            </div>
          </div>
        </div>

        {/* 主催者 & 参加者情報 - ホバー時にフェードアウト */}
        <div className='flex w-full items-center justify-between transition-all duration-500 ease-out group-hover:opacity-0'>
          {/* 主催者 */}
          <div className='flex items-center gap-1.5'>
            <div className='size-5 overflow-hidden rounded-full bg-muted shadow-inset-sm'>
              {event.creator.avatarUrl ? (
                <img
                  src={event.creator.avatarUrl}
                  alt={event.creator.displayName}
                  className='size-full object-cover'
                />
              ) : (
                <div className='flex size-full items-center justify-center'>
                  <User className='size-2.5 text-muted-foreground' />
                </div>
              )}
            </div>
            <span className='text-xs text-muted-foreground'>
              {event.creator.displayName}
            </span>
          </div>

          {/* 参加者数 */}
          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
            <Users className='size-3' />
            <span>
              {participantCount}
              {event.maxParticipants !== null && `/${event.maxParticipants}`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
