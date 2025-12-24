'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/ui/dialog';

import { BLOCK_CONFIGS } from '../../config/block-config';
import type { DashboardBlockType } from '../../model/types';

interface AddBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBlock: (blockType: DashboardBlockType) => void;
}

export function AddBlockDialog({
  open,
  onOpenChange,
  onAddBlock,
}: AddBlockDialogProps) {
  const handleSelect = (blockType: DashboardBlockType) => {
    onAddBlock(blockType);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>ブロックを追加</DialogTitle>
        </DialogHeader>
        <div className='grid grid-cols-2 gap-3 py-4'>
          {Object.values(BLOCK_CONFIGS).map((config) => (
            <button
              key={config.type}
              type='button'
              onClick={() => handleSelect(config.type)}
              className='flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-accent'
            >
              <span className='font-medium'>{config.label}</span>
              <span className='text-xs text-muted-foreground'>
                {config.constraints.minW}x{config.constraints.minH} 〜{' '}
                {config.constraints.maxW}x{config.constraints.maxH}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
