'use client';

import { PanelRight, Square } from 'lucide-react';

import { Dialog, DialogContent } from '@/shared/ui/shadcn/ui/dialog';
import { Sheet, SheetContent } from '@/shared/ui/shadcn/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn/ui/tooltip';

import { dummyMembers } from '@/shared/dummy-data/members/members';
import { useViewMode, type ViewMode } from '../lib/use-view-mode';
import { MemberDetailContent } from './MemberDetailContent';

interface MemberDetailModalSheetProps {
  memberId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultViewMode?: ViewMode;
}

export function MemberDetailModalSheet({
  memberId,
  open,
  onOpenChange,
  defaultViewMode = 'modal',
}: MemberDetailModalSheetProps) {
  const { viewMode, toggleViewMode, isModal } = useViewMode(defaultViewMode);

  // ダミーデータからメンバーを取得
  const member = memberId
    ? dummyMembers.find((m) => m.id === memberId)
    : null;

  const handleSetRival = () => {
    // TODO: API呼び出し
    alert(`${member?.displayName}をライバルに設定しました（未実装）`);
  };

  if (!member) {
    return null;
  }

  // 切り替えボタン
  const ViewModeToggle = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggleViewMode}
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background text-muted-foreground shadow-inset-sm transition-all hover:text-foreground hover:shadow-inset-sm"
        >
          {isModal ? (
            <PanelRight className="size-4" />
          ) : (
            <Square className="size-4" />
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
          className="max-h-[85vh] max-w-md gap-0 overflow-hidden border-0 bg-background p-0"
          showCloseButton={false}
        >
          {ViewModeToggle}
          <div className="max-h-[85vh]">
            <MemberDetailContent member={member} onSetRival={handleSetRival} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // シートモード
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-hidden border-0 bg-background p-0 sm:max-w-md"
        showCloseButton={false}
      >
        {ViewModeToggle}
        <MemberDetailContent member={member} onSetRival={handleSetRival} />
      </SheetContent>
    </Sheet>
  );
}
