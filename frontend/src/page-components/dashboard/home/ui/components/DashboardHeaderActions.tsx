'use client';

import { Plus, Pencil, Check } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/ui/button';

interface DashboardFabProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onAddBlockClick: () => void;
}

export function DashboardFab({
  isEditMode,
  onToggleEditMode,
  onAddBlockClick,
}: DashboardFabProps) {
  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3'>
      {/* メインFAB: 編集/完了 */}
      <Button
        size='icon'
        className='h-14 w-14 rounded-full shadow-lg'
        onClick={onToggleEditMode}
      >
        {isEditMode ? (
          <Check className='h-6 w-6' />
        ) : (
          <Pencil className='h-6 w-6' />
        )}
      </Button>

      {/* 編集モード時のみ表示: ブロック追加 */}
      {isEditMode && (
        <Button
          size='icon'
          variant='secondary'
          className='h-12 w-12 rounded-full shadow-lg'
          onClick={onAddBlockClick}
        >
          <Plus className='h-5 w-5' />
        </Button>
      )}
    </div>
  );
}
