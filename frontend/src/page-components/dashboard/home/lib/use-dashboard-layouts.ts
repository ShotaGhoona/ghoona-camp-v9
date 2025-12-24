'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import type {
  DashboardBlock,
  DashboardBlockType,
} from '@/entities/domain/dashboard/model/types';
import { useDashboardLayout } from '@/features/domain/dashboard/get-layout/lib/use-dashboard-layout';
import { useUpdateLayout } from '@/features/domain/dashboard/update-layout/lib/use-update-layout';

import { BLOCK_CONFIGS } from '../config/block-config';
import type { GridLayoutItem } from '../model/types';

// DashboardBlock → GridLayoutItem 変換
function toGridLayoutItem(block: DashboardBlock): GridLayoutItem {
  const config = BLOCK_CONFIGS[block.type];
  return {
    i: block.id,
    x: block.x,
    y: block.y,
    w: block.w,
    h: block.h,
    minW: config.constraints.minW,
    maxW: config.constraints.maxW,
    minH: config.constraints.minH,
    maxH: config.constraints.maxH,
  };
}

export function useDashboardLayouts() {
  const { data: layoutData, isLoading } = useDashboardLayout();
  const { mutate: updateLayout } = useUpdateLayout();

  const [blocks, setBlocks] = useState<DashboardBlock[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // デバウンス用のタイマーRef
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // APIデータが取得されたらローカル状態に反映
  useEffect(() => {
    if (layoutData && !isInitialized) {
      setBlocks(layoutData.data.blocks);
      setIsInitialized(true);
    }
  }, [layoutData, isInitialized]);

  // デバウンスでAPIに保存
  const saveToApi = useCallback(
    (newBlocks: DashboardBlock[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        updateLayout({ blocks: newBlocks });
      }, 500); // 500msデバウンス
    },
    [updateLayout],
  );

  // react-grid-layoutからのレイアウト変更
  const handleLayoutChange = useCallback(
    (newLayout: readonly { i: string; x: number; y: number; w: number; h: number }[]) => {
      setBlocks((prevBlocks) => {
        const updatedBlocks = newLayout.map((item) => {
          const existingBlock = prevBlocks.find((b) => b.id === item.i);
          return {
            id: item.i,
            type: existingBlock?.type ?? ('current-title' as DashboardBlockType),
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
          };
        });

        saveToApi(updatedBlocks);
        return updatedBlocks;
      });
    },
    [saveToApi],
  );

  // ブロック追加
  const handleAddBlock = useCallback(
    (blockType: DashboardBlockType) => {
      const config = BLOCK_CONFIGS[blockType];
      const newId = `block-${Date.now()}`;

      const newBlock: DashboardBlock = {
        id: newId,
        type: blockType,
        x: 0,
        y: Infinity, // 一番下に追加
        w: config.constraints.defaultW,
        h: config.constraints.defaultH,
      };

      setBlocks((prev) => {
        const newBlocks = [...prev, newBlock];
        saveToApi(newBlocks);
        return newBlocks;
      });
    },
    [saveToApi],
  );

  // ブロック削除
  const handleRemoveBlock = useCallback(
    (blockId: string) => {
      setBlocks((prev) => {
        const newBlocks = prev.filter((block) => block.id !== blockId);
        saveToApi(newBlocks);
        return newBlocks;
      });
    },
    [saveToApi],
  );

  // react-grid-layout用のレイアウト（制約付き）
  const gridLayouts = useMemo(() => {
    return blocks.map(toGridLayoutItem);
  }, [blocks]);

  return {
    blocks,
    gridLayouts,
    isLoading,
    handleLayoutChange,
    handleAddBlock,
    handleRemoveBlock,
  };
}
