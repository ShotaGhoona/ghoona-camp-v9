'use client';

import { PanelRight, Square } from 'lucide-react';

import { Dialog, DialogContent } from '@/shared/ui/shadcn/ui/dialog';
import { Sheet, SheetContent } from '@/shared/ui/shadcn/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn/ui/tooltip';

import type { EventItem } from '@/shared/dummy-data/events/events';
import { useViewMode, type ViewMode } from '../lib/use-view-mode';
import { EventDetailContent } from './EventDetailContent';

interface EventDetailModalSheetProps {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultViewMode?: ViewMode;
  onMemberClick?: (memberId: string) => void;
  onEdit?: (eventId: string) => void;
  currentUserId?: string;
  /** イベントリスト（eventIdからイベントを検索する用） */
  events?: EventItem[];
}

export function EventDetailModalSheet({
  eventId,
  open,
  onOpenChange,
  defaultViewMode = 'modal',
  onMemberClick,
  onEdit,
  currentUserId = '1', // TODO: 実際のログインユーザーIDに置き換え
  events = [],
}: EventDetailModalSheetProps) {
  const { viewMode, toggleViewMode, isModal } = useViewMode(defaultViewMode);

  // イベントリストから検索
  const event = eventId ? events.find((e) => e.id === eventId) : null;

  // 参加状態を確認
  const isParticipating = event
    ? event.participants.some(
        (p) => p.userId === currentUserId && p.status === 'registered',
      )
    : false;

  // 主催者かどうか
  const isOwner = event?.creator.id === currentUserId;

  const handleToggleParticipation = () => {
    // TODO: API呼び出し
    if (isParticipating) {
      alert(`${event?.title}への参加をキャンセルしました（未実装）`);
    } else {
      alert(`${event?.title}に参加申込しました（未実装）`);
    }
  };

  const handleEdit = () => {
    if (event) {
      onEdit?.(event.id);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    // TODO: API呼び出し
    if (confirm(`「${event?.title}」を削除してもよろしいですか？`)) {
      alert(`${event?.title}を削除しました（未実装）`);
      onOpenChange(false);
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
          <div className='flex max-h-[85vh] flex-col'>
            <EventDetailContent
              event={event}
              isOwner={isOwner}
              isParticipating={isParticipating}
              onToggleParticipation={handleToggleParticipation}
              onMemberClick={onMemberClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
          isOwner={isOwner}
          isParticipating={isParticipating}
          onToggleParticipation={handleToggleParticipation}
          onMemberClick={onMemberClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </SheetContent>
    </Sheet>
  );
}
