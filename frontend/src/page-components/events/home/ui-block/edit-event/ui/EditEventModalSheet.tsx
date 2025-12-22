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
import {
  useViewMode,
  type ViewMode,
} from '../../event-detail-modal/lib/use-view-mode';
import { EditEventContent } from './EditEventContent';

interface EditEventModalSheetProps {
  eventId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultViewMode?: ViewMode;
  /** イベントリスト（eventIdからイベントを検索する用） */
  events?: EventItem[];
}

export function EditEventModalSheet({
  eventId,
  open,
  onOpenChange,
  defaultViewMode = 'modal',
  events = [],
}: EditEventModalSheetProps) {
  const { viewMode, toggleViewMode, isModal } = useViewMode(defaultViewMode);

  // イベントリストから検索
  const event = eventId ? events.find((e) => e.id === eventId) : null;

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!event) {
    return null;
  }

  // ビューモード切替ボタン
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
            <EditEventContent event={event} onClose={handleClose} />
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
        <EditEventContent event={event} onClose={handleClose} />
      </SheetContent>
    </Sheet>
  );
}
