'use client';

import { Plus, Pencil, X } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/ui/button';

interface DashboardHeaderActionsProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onAddBlockClick: () => void;
}

export function DashboardHeaderActions({
  isEditMode,
  onToggleEditMode,
  onAddBlockClick,
}: DashboardHeaderActionsProps) {
  return (
    <div className='flex items-center gap-2'>
      {isEditMode && (
        <Button variant='outline' size='sm' onClick={onAddBlockClick}>
          <Plus className='mr-1 h-4 w-4' />
          ブロック追加
        </Button>
      )}
      <Button
        variant={isEditMode ? 'default' : 'outline'}
        size='sm'
        onClick={onToggleEditMode}
      >
        {isEditMode ? (
          <>
            <X className='mr-1 h-4 w-4' />
            完了
          </>
        ) : (
          <>
            <Pencil className='mr-1 h-4 w-4' />
            編集
          </>
        )}
      </Button>
    </div>
  );
}
