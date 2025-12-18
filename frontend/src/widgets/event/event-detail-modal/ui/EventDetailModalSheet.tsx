'use client';

import { PanelRight, Square } from 'lucide-react';

import { Dialog, DialogContent } from '@/shared/ui/shadcn/ui/dialog';
import { Sheet, SheetContent } from '@/shared/ui/shadcn/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn/ui/tooltip';

import { dummyEvents } from '@/shared/dummy-data/events/events';
import { useViewMode, type ViewMode } from '../lib/use-view-mode';
import { EventDetailContent } from './EventDetailContent';

interface EventDetailModalSheetProps {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultViewMode?: ViewMode;
  onMemberClick?: (memberId: string) => void;
}

export function EventDetailModalSheet({
  eventId,
  open,
  onOpenChange,
  defaultViewMode = 'modal',
  onMemberClick,
}: EventDetailModalSheetProps) {
  const { viewMode, toggleViewMode, isModal } = useViewMode(defaultViewMode);

  // ダミーデータからイベントを取得
  const event = eventId ? dummyEvents.find((e) => e.id === eventId) : null;

  // TODO: 実際にはログインユーザーのIDと比較
  const isParticipating = event
    ? event.participants.some(
        (p) => p.userId === 'user-001' && p.status === 'registered',
      )
    : false;

  const handleToggleParticipation = () => {
    // TODO: API呼び出し
    if (isParticipating) {
      alert(`${event?.title}への参加をキャンセルしました（未実装）`);
    } else {
      alert(`${event?.title}に参加申込しました（未実装）`);
    }
  };

  if (!event) {
    return null;
  }

  // 切り替えボタン
  const ViewModeToggle = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={toggleViewMode}
          className='absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background text-muted-foreground shadow-inset-sm transition-all hover:text-foreground hover:shadow-inset-sm'
        >
          {isModal ? (
            <PanelRight className='size-4' />
          ) : (
            <Square className='size-4' />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {isModal ? 'サイドパネルで開く' : 'モーダルで開く'}
      </TooltipContent>
    </Tooltip>
  );

  // モーダルモード
  if (viewMode === 'modal') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className='max-h-[85vh] max-w-md gap-0 overflow-hidden border-0 bg-background p-0'
          showCloseButton={false}
        >
          {ViewModeToggle}
          <div className='max-h-[85vh]'>
            <EventDetailContent
              event={event}
              isParticipating={isParticipating}
              onToggleParticipation={handleToggleParticipation}
              onMemberClick={onMemberClick}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // シートモード
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full gap-0 overflow-hidden border-0 bg-background p-0 sm:max-w-md'
        showCloseButton={false}
      >
        {ViewModeToggle}
        <EventDetailContent
          event={event}
          isParticipating={isParticipating}
          onToggleParticipation={handleToggleParticipation}
          onMemberClick={onMemberClick}
        />
      </SheetContent>
    </Sheet>
  );
}
