'use client';

import { PanelRight, Square } from 'lucide-react';

import { Dialog, DialogContent } from '@/shared/ui/shadcn/ui/dialog';
import { Sheet, SheetContent } from '@/shared/ui/shadcn/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn/ui/tooltip';

import {
  useViewMode,
  type ViewMode,
} from '../../goal-detail-modal/lib/use-view-mode';
import { CreateGoalContent } from './CreateGoalContent';
import { GoalComparePanel } from './GoalComparePanel';
import { useCompareMode } from '../lib/use-compare-mode';

interface CreateGoalModalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultViewMode?: ViewMode;
}

export function CreateGoalModalSheet({
  open,
  onOpenChange,
  defaultViewMode = 'modal',
}: CreateGoalModalSheetProps) {
  const { viewMode, toggleViewMode, isModal } = useViewMode(defaultViewMode);
  const { isCompareMode, toggleCompareMode } = useCompareMode();

  const handleClose = () => {
    onOpenChange(false);
  };

  // ビューモード切替ボタン（右上）
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
          className={`max-h-[85vh] gap-0 overflow-hidden border-0 bg-background p-0 transition-all duration-300 ${
            isCompareMode ? 'sm:max-w-4xl' : 'sm:max-w-md'
          }`}
          showCloseButton={false}
        >
          {ViewModeToggle}
          <div className='flex max-h-[85vh]'>
            {/* 比較パネル（左側） */}
            {isCompareMode && (
              <div className='w-1/2 border-r'>
                <GoalComparePanel />
              </div>
            )}
            {/* フォーム（右側） */}
            <div className={isCompareMode ? 'w-1/2' : 'w-full'}>
              <CreateGoalContent
                onClose={handleClose}
                isCompareMode={isCompareMode}
                onToggleCompareMode={toggleCompareMode}
              />
            </div>
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
        className={`gap-0 overflow-hidden border-0 bg-background p-0 transition-all duration-300 ${
          isCompareMode ? 'w-full sm:max-w-4xl' : 'w-full sm:max-w-md'
        }`}
        showCloseButton={false}
      >
        {ViewModeToggle}
        <div className='flex h-full'>
          {/* 比較パネル（左側） */}
          {isCompareMode && (
            <div className='w-1/2 border-r'>
              <GoalComparePanel />
            </div>
          )}
          {/* フォーム（右側） */}
          <div className={isCompareMode ? 'w-1/2' : 'w-full'}>
            <CreateGoalContent
              onClose={handleClose}
              isCompareMode={isCompareMode}
              onToggleCompareMode={toggleCompareMode}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
