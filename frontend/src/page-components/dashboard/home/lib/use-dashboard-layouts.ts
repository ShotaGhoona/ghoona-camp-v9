'use client';

import { useState, useCallback, useMemo } from 'react';

import { BLOCK_CONFIGS, DEFAULT_LAYOUTS } from '../config/block-config';
import type { DashboardBlockType, DashboardLayoutItem } from '../model/types';

export function useDashboardLayouts() {
  const [layouts, setLayouts] =
    useState<DashboardLayoutItem[]>(DEFAULT_LAYOUTS);

  // レイアウト変更時のハンドラ
  const handleLayoutChange = useCallback(
    (newLayout: readonly { i: string; x: number; y: number; w: number; h: number }[]) => {
      setLayouts((prevLayouts) => {
        return newLayout.map((item) => {
          const existingItem = prevLayouts.find((l) => l.i === item.i);
          return {
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            blockType: existingItem?.blockType ?? ('block-a' as DashboardBlockType),
          };
        });
      });

      // TODO: バックエンドで保存
    },
    [],
  );

  // ブロック追加
  const handleAddBlock = useCallback((blockType: DashboardBlockType) => {
    const config = BLOCK_CONFIGS[blockType];
    const newId = `item-${Date.now()}`;

    const newBlock: DashboardLayoutItem = {
      i: newId,
      x: 0,
      y: Infinity, // 一番下に追加
      w: config.constraints.defaultW,
      h: config.constraints.defaultH,
      blockType,
    };

    setLayouts((prev) => [...prev, newBlock]);

    // TODO: バックエンドで保存
  }, []);

  // ブロック削除
  const handleRemoveBlock = useCallback((itemId: string) => {
    setLayouts((prev) => prev.filter((item) => item.i !== itemId));

    // TODO: バックエンドで保存
  }, []);

  // レイアウトに制約を適用
  const layoutsWithConstraints = useMemo(() => {
    return layouts.map((item) => {
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
  }, [layouts]);

  return {
    layouts,
    layoutsWithConstraints,
    handleLayoutChange,
    handleAddBlock,
    handleRemoveBlock,
  };
}
