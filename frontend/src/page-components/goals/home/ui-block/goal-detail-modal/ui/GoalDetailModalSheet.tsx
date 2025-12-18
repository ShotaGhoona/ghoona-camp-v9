'use client';

import { PanelRight, Square } from 'lucide-react';

import { Dialog, DialogContent } from '@/shared/ui/shadcn/ui/dialog';
import { Sheet, SheetContent } from '@/shared/ui/shadcn/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn/ui/tooltip';

import type { GoalItem } from '@/entities/domain/goal/model/types';
import { useViewMode, type ViewMode } from '../lib/use-view-mode';
import { GoalDetailContent } from './GoalDetailContent';

interface GoalDetailModalSheetProps {
  goalId: string | null;
  goal?: GoalItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultViewMode?: ViewMode;
  onMemberClick?: (memberId: string) => void;
  onEdit?: (goalId: string) => void;
  currentUserId?: string;
  /** 自分の目標リスト（goalIdから目標を検索する用） */
  myGoals?: GoalItem[];
  /** 公開目標リスト（goalIdから目標を検索する用） */
  publicGoals?: GoalItem[];
}

export function GoalDetailModalSheet({
  goalId,
  goal: goalProp,
  open,
  onOpenChange,
  defaultViewMode = 'modal',
  onMemberClick,
  onEdit,
  currentUserId,
  myGoals = [],
  publicGoals = [],
}: GoalDetailModalSheetProps) {
  const { viewMode, toggleViewMode, isModal } = useViewMode(defaultViewMode);

  // 目標を検索（propsから渡された場合はそれを使用、なければリストから検索）
  const goal =
    goalProp ??
    (goalId
      ? myGoals.find((g) => g.id === goalId) ??
        publicGoals.find((g) => g.id === goalId)
      : null);

  const handleEdit = () => {
    if (goal) {
      onEdit?.(goal.id);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!goal) {
    return null;
  }

  const isOwn = currentUserId === goal.userId;

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
            <GoalDetailContent
              goal={goal}
              isOwn={isOwn}
              onEdit={handleEdit}
              onClose={handleClose}
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
        <GoalDetailContent
          goal={goal}
          isOwn={isOwn}
          onEdit={handleEdit}
          onClose={handleClose}
          onMemberClick={onMemberClick}
        />
      </SheetContent>
    </Sheet>
  );
}
