'use client';

import { useCallback } from 'react';

import type { PlaceholderPosition } from '../lib/use-grid-background';

interface GridBackgroundProps {
  cols: number;
  rows: number;
  cellWidth: number;
  rowHeight: number;
  gap: number;
  placeholder: PlaceholderPosition | null;
}

export function GridBackground({
  cols,
  rows,
  cellWidth,
  rowHeight,
  gap,
  placeholder,
}: GridBackgroundProps) {
  const isCellInPlaceholder = useCallback(
    (cellIndex: number) => {
      if (!placeholder) return false;
      const cellX = cellIndex % cols;
      const cellY = Math.floor(cellIndex / cols);
      return (
        cellX >= placeholder.x &&
        cellX < placeholder.x + placeholder.w &&
        cellY >= placeholder.y &&
        cellY < placeholder.y + placeholder.h
      );
    },
    [placeholder, cols],
  );

  return (
    <div
      className='pointer-events-none absolute left-6 top-6'
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellWidth}px)`,
        gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
        gap: `${gap}px`,
      }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div
          key={i}
          className={`rounded-md ${
            isCellInPlaceholder(i) ? 'bg-primary/30' : 'bg-muted/50'
          }`}
        />
      ))}
    </div>
  );
}
