'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GridLayout } from 'react-grid-layout';
import { Plus, Pencil, X, Trash2 } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/ui/dialog';

import { BLOCK_CONFIGS, DEFAULT_LAYOUTS } from '../lib/block-config';
import { renderBlock } from '../lib/block-renderer';
import type { DashboardBlockType, DashboardLayoutItem } from '../lib/types';

import 'react-grid-layout/css/styles.css';

const ROW_HEIGHT = 100;

export function DashboardContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  const [layouts, setLayouts] =
    useState<DashboardLayoutItem[]>(DEFAULT_LAYOUTS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);

  // コンテナ幅の監視
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // レイアウト変更時のハンドラ
  const handleLayoutChange = useCallback(
    (newLayout: readonly { i: string; x: number; y: number; w: number; h: number }[]) => {
      // 既存のblockType情報を保持しながらレイアウトを更新
      const updatedLayouts = newLayout.map((item) => {
        const existingItem = layouts.find((l) => l.i === item.i);
        return {
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          blockType: existingItem?.blockType ?? ('block-a' as DashboardBlockType),
        };
      });
      setLayouts(updatedLayouts);

      // TODO: バックエンドで保存
    },
    [layouts],
  );

  // ブロック追加
  const handleAddBlock = useCallback((blockType: DashboardBlockType) => {
    const config = BLOCK_CONFIGS[blockType];
    const newId = `item-${Date.now()}`;

    const newBlock: DashboardLayoutItem = {
      i: newId,
      x: 0,
      y: Infinity, // 一番下に追加
      w: config.defaultW,
      h: config.defaultH,
      minW: config.constraints.minW,
      maxW: config.constraints.maxW,
      minH: config.constraints.minH,
      maxH: config.constraints.maxH,
      blockType,
    };

    setLayouts((prev) => [...prev, newBlock]);
    setIsAddBlockModalOpen(false);

    // TODO: バックエンドで保存
  }, []);

  // ブロック削除
  const handleRemoveBlock = useCallback((itemId: string) => {
    setLayouts((prev) => prev.filter((item) => item.i !== itemId));

    // TODO: バックエンドで保存
  }, []);

  // レイアウトに制約を適用
  const layoutsWithConstraints = layouts.map((item) => {
    const config = BLOCK_CONFIGS[item.blockType];
    return {
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: config.constraints.minW,
      maxW: config.constraints.maxW,
      minH: config.constraints.minH,
      maxH: config.constraints.maxH,
    };
  });

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      {/* ヘッダー */}
      <div className='flex items-center justify-between border-b px-6 py-4'>
        <h1 className='text-xl font-bold'>ダッシュボード</h1>
        <div className='flex items-center gap-2'>
          {isEditMode && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsAddBlockModalOpen(true)}
            >
              <Plus className='mr-1 h-4 w-4' />
              ブロック追加
            </Button>
          )}
          <Button
            variant={isEditMode ? 'default' : 'outline'}
            size='sm'
            onClick={() => setIsEditMode(!isEditMode)}
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
      </div>

      {/* グリッド */}
      <div ref={containerRef} className='flex-1 overflow-auto p-6'>
        <GridLayout
          layout={layoutsWithConstraints}
          width={containerWidth - 48}
          gridConfig={{
            cols: 12,
            rowHeight: ROW_HEIGHT,
            margin: [16, 16],
          }}
          dragConfig={{
            enabled: isEditMode,
            handle: '.drag-handle',
          }}
          resizeConfig={{
            enabled: isEditMode,
            handles: ['se'],
          }}
          onLayoutChange={handleLayoutChange}
        >
          {layouts.map((item) => (
            <div
              key={item.i}
              className='relative'
            >
              {/* 編集モード時のオーバーレイ */}
              {isEditMode && (
                <>
                  {/* ドラッグハンドル（右下のリサイズ領域を除く） */}
                  <div className='drag-handle absolute bottom-5 left-0 right-5 top-0 z-10 cursor-move' />

                  {/* 削除ボタン */}
                  <button
                    type='button'
                    onClick={() => handleRemoveBlock(item.i)}
                    className='absolute -right-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90'
                  >
                    <Trash2 className='h-3 w-3' />
                  </button>
                </>
              )}

              {/* ブロックコンテンツ */}
              {renderBlock({
                blockType: item.blockType,
                isEditMode,
              })}
            </div>
          ))}
        </GridLayout>
      </div>

      {/* ブロック追加モーダル */}
      <Dialog open={isAddBlockModalOpen} onOpenChange={setIsAddBlockModalOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>ブロックを追加</DialogTitle>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-3 py-4'>
            {Object.values(BLOCK_CONFIGS).map((config) => (
              <button
                key={config.type}
                type='button'
                onClick={() => handleAddBlock(config.type)}
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
    </div>
  );
}
