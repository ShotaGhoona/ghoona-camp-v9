'use client';

import { useState, useCallback, useMemo } from 'react';

export interface PlaceholderPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface UseGridBackgroundParams {
  layouts: readonly LayoutItem[];
  containerWidth: number;
  cols: number;
  margin: number;
}

export function useGridBackground({
  layouts,
  containerWidth,
  cols,
  margin,
}: UseGridBackgroundParams) {
  const [placeholder, setPlaceholder] = useState<PlaceholderPosition | null>(null);

  // グリッド背景用の行数を計算
  const gridRows = useMemo(() => {
    const maxY = layouts.reduce((max, item) => {
      // y: Infinity のアイテム（新規追加直後）は除外
      if (!Number.isFinite(item.y)) return max;
      return Math.max(max, item.y + item.h);
    }, 0);
    return Math.max(maxY + 2, 6);
  }, [layouts]);

  // グリッドセルのサイズを計算
  const gridWidth = containerWidth - 48;
  const cellWidth = (gridWidth - margin * (cols - 1)) / cols;

  const handleDrag = useCallback(
    (
      _layout: readonly LayoutItem[],
      _oldItem: LayoutItem | null,
      newItem: LayoutItem | null,
    ) => {
      if (newItem) {
        setPlaceholder({ x: newItem.x, y: newItem.y, w: newItem.w, h: newItem.h });
      }
    },
    [],
  );

  const handleDragStop = useCallback(() => {
    setPlaceholder(null);
  }, []);

  const handleResize = useCallback(
    (
      _layout: readonly LayoutItem[],
      _oldItem: LayoutItem | null,
      newItem: LayoutItem | null,
    ) => {
      if (newItem) {
        setPlaceholder({ x: newItem.x, y: newItem.y, w: newItem.w, h: newItem.h });
      }
    },
    [],
  );

  const handleResizeStop = useCallback(() => {
    setPlaceholder(null);
  }, []);

  return {
    placeholder,
    gridRows,
    gridWidth,
    cellWidth,
    handleDrag,
    handleDragStop,
    handleResize,
    handleResizeStop,
  };
}
