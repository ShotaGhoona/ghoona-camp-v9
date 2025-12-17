'use client';

import { Calendar, Clock, Repeat, User, Users } from 'lucide-react';

import { Badge } from '@/shared/ui/shadcn/ui/badge';
import { Separator } from '@/shared/ui/shadcn/ui/separator';
import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';

import type { EventItem } from '@/shared/dummy-data/events/events';
import { EVENT_TYPE_LABELS } from '@/shared/dummy-data/events/events';

interface EventDetailContentProps {
  event: EventItem;
  isParticipating?: boolean;
  onToggleParticipation?: () => void;
  onMemberClick?: (memberId: string) => void;
}

export function EventDetailContent({
  event,
  isParticipating = false,
  onToggleParticipation,
  onMemberClick,
}: EventDetailContentProps) {
  const participantCount = event.participants.filter(
    (p) => p.status === 'registered',
  ).length;
  const isFull =
    event.maxParticipants !== null && participantCount >= event.maxParticipants;

  return (
    <div className='flex h-full flex-col'>
      <ScrollArea className='flex-1'>
        <div className='flex flex-col'>
          {/* ヘッダー部分 */}
          <div className='relative'>
            {/* 背景グラデーション */}
            <div className='h-24 bg-gradient-to-br from-primary via-primary/40 to-primary/5' />

            {/* イベントタイプバッジ - 左上 */}
            <div className='absolute left-4 top-4'>
              <Badge variant='secondary' className='bg-background/90'>
                {EVENT_TYPE_LABELS[event.eventType]}
              </Badge>
            </div>

            {/* 主催者アバター */}
            <div className='absolute left-1/2 top-12 -translate-x-1/2'>
              <button
                type='button'
                onClick={() => onMemberClick?.(event.creator.id)}
                className='size-24 overflow-hidden rounded-full bg-background shadow-raised transition-transform hover:scale-105'
              >
                {event.creator.avatarUrl ? (
                  <img
                    src={event.creator.avatarUrl}
                    alt={event.creator.displayName}
                    className='size-full object-cover'
                  />
                ) : (
                  <div className='flex size-full items-center justify-center bg-muted'>
                    <User className='size-10 text-muted-foreground' />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* イベント情報 */}
          <div className='mt-14 space-y-5 px-6 pb-6'>
            {/* タイトル & 主催者名 */}
            <div className='text-center'>
              <h2 className='text-xl font-bold'>{event.title}</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                主催: {event.creator.displayName}
              </p>
            </div>

            {/* 日時情報 */}
            <div className='grid grid-cols-2 gap-3 rounded-xl p-4 shadow-raised-sm'>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-1 text-lg font-bold text-primary'>
                  <Calendar className='size-4' />
                  {new Date(event.scheduledDate).toLocaleDateString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <p className='text-xs text-muted-foreground'>開催日</p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-1 text-lg font-bold text-primary'>
                  <Clock className='size-4' />
                  {event.startTime}
                </div>
                <p className='text-xs text-muted-foreground'>開始時間</p>
              </div>
            </div>

            {/* 定期開催情報 */}
            {event.isRecurring && event.recurrencePattern && (
              <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
                <Repeat className='size-4' />
                <span>
                  {event.recurrencePattern === 'weekly' && '毎週開催'}
                  {event.recurrencePattern === 'daily' && '毎日開催'}
                  {event.recurrencePattern === 'monthly' && '毎月開催'}
                </span>
              </div>
            )}

            {/* 説明 */}
            {event.description && (
              <div>
                <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
                  詳細
                </h3>
                <p className='text-sm leading-relaxed'>{event.description}</p>
              </div>
            )}

            <Separator />

            {/* 参加者情報 */}
            <div>
              <div className='mb-3 flex items-center justify-between'>
                <h3 className='flex items-center gap-2 text-sm font-semibold text-muted-foreground'>
                  <Users className='size-4' />
                  参加者
                </h3>
                <span className='text-xs text-muted-foreground'>
                  {participantCount}
                  {event.maxParticipants !== null &&
                    ` / ${event.maxParticipants}`}
                  人
                </span>
              </div>

              {/* 参加者アバターグリッド */}
              {event.participants.length > 0 ? (
                <div className='flex flex-wrap gap-1'>
                  {event.participants
                    .filter((p) => p.status === 'registered')
                    .slice(0, 12)
                    .map((participant) => (
                      <button
                        key={participant.id}
                        type='button'
                        onClick={() => onMemberClick?.(participant.userId)}
                        className='size-10 overflow-hidden rounded-full bg-muted shadow-raised-sm transition-transform hover:scale-105'
                      >
                        {participant.avatarUrl ? (
                          <img
                            src={participant.avatarUrl}
                            alt={participant.userName}
                            className='size-full object-cover'
                          />
                        ) : (
                          <div className='flex size-full items-center justify-center'>
                            <User className='size-4 text-muted-foreground' />
                          </div>
                        )}
                      </button>
                    ))}
                  {participantCount > 12 && (
                    <div className='flex size-10 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground shadow-raised-sm'>
                      +{participantCount - 12}
                    </div>
                  )}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  まだ参加者はいません
                </p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* 参加ボタン */}
      <div className='border-t bg-background px-6 py-4'>
        <button
          type='button'
          onClick={onToggleParticipation}
          disabled={!isParticipating && isFull}
          className='flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-raised-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <Users className='size-4' />
          {isParticipating
            ? '参加をキャンセル'
            : isFull
              ? '定員に達しました'
              : 'このイベントに参加する'}
        </button>
      </div>
    </div>
  );
}
