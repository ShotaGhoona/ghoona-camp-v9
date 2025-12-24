'use client';

import { Trash2 } from 'lucide-react';

import type { DashboardBlockType } from '../../model/types';
import { BlockA } from '../../ui-block/block-a/ui/BlockA';
import { BlockB } from '../../ui-block/block-b/ui/BlockB';
import { BlockC } from '../../ui-block/block-c/ui/BlockC';
import { BlockD } from '../../ui-block/block-d/ui/BlockD';
import { BlockE } from '../../ui-block/block-e/ui/BlockE';
import { BlockF } from '../../ui-block/block-f/ui/BlockF';
import { BlockG } from '../../ui-block/block-g/ui/BlockG';
import { BlockH } from '../../ui-block/block-h/ui/BlockH';
import { BlockI } from '../../ui-block/block-i/ui/BlockI';
import { BlockJ } from '../../ui-block/block-j/ui/BlockJ';

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
  const renderBlockComponent = () => {
    switch (blockType) {
      case 'block-a':
        return <BlockA isEditMode={isEditMode} />;
      case 'block-b':
        return <BlockB isEditMode={isEditMode} />;
      case 'block-c':
        return <BlockC isEditMode={isEditMode} />;
      case 'block-d':
        return <BlockD isEditMode={isEditMode} />;
      case 'block-e':
        return <BlockE isEditMode={isEditMode} />;
      case 'block-f':
        return <BlockF isEditMode={isEditMode} />;
      case 'block-g':
        return <BlockG isEditMode={isEditMode} />;
      case 'block-h':
        return <BlockH isEditMode={isEditMode} />;
      case 'block-i':
        return <BlockI isEditMode={isEditMode} />;
      case 'block-j':
        return <BlockJ isEditMode={isEditMode} />;
      default:
        return null;
    }
  };

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
      {renderBlockComponent()}
    </>
  );
}
