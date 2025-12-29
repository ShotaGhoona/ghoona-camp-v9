'use client';

import { Trash2 } from 'lucide-react';

import type { DashboardBlockType } from '@/entities/domain/dashboard/model/types';
import { BLOCK_CONFIGS } from '../../config/block-config';

interface BlockRenderContentProps {
  blockType: DashboardBlockType;
  isEditMode: boolean;
  onRemove: () => void;
}

export function BlockRenderContent({
  blockType,
  isEditMode,
  onRemove,
}: BlockRenderContentProps) {
  const { Component } = BLOCK_CONFIGS[blockType];

  return (
    <>
      {isEditMode && (
        <>
          {/* ドラッグハンドル（右下のリサイズ領域を除く） */}
          <div className='drag-handle absolute bottom-5 left-0 right-5 top-0 z-10 cursor-move' />

          {/* 削除ボタン */}
          <button
            type='button'
            onClick={onRemove}
            className='absolute -right-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90'
          >
            <Trash2 className='h-3 w-3' />
          </button>
        </>
      )}
      <Component />
    </>
  );
}
