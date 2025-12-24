'use client';

import { useState, useRef, useEffect } from 'react';
import { GridLayout } from 'react-grid-layout';

import { GRID_CONFIG } from '../config/block-config';
import { useDashboardLayouts } from '../lib/use-dashboard-layouts';
import { useGridBackground } from '../lib/use-grid-background';
import { AddBlockDialog } from './components/AddBlockDialog';
import { BlockRenderContent } from './components/BlockRenderContent';
import { DashboardHeaderActions } from './components/DashboardHeaderActions';
import { GridBackground } from './GridBackground';

import 'react-grid-layout/css/styles.css';

const { ROW_HEIGHT, COLS, MARGIN } = GRID_CONFIG;

export function DashboardContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);

  const {
    layouts,
    layoutsWithConstraints,
    handleLayoutChange,
    handleAddBlock,
    handleRemoveBlock,
  } = useDashboardLayouts();

  const {
    placeholder,
    gridRows,
    gridWidth,
    cellWidth,
    handleDrag,
    handleDragStop,
    handleResize,
    handleResizeStop,
  } = useGridBackground({
    layouts,
    containerWidth,
    cols: COLS,
    margin: MARGIN,
  });

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

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      {/* ヘッダー */}
      <div className='flex items-center justify-between border-b px-6 py-4'>
        <h1 className='text-xl font-bold'>ダッシュボード</h1>
        <DashboardHeaderActions
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          onAddBlockClick={() => setIsAddBlockModalOpen(true)}
        />
      </div>

      {/* グリッド */}
      <div ref={containerRef} className='relative flex-1 overflow-auto p-6'>
        {/* 編集モード時のグリッド背景 */}
        {isEditMode && (
          <GridBackground
            cols={COLS}
            rows={gridRows}
            cellWidth={cellWidth}
            rowHeight={ROW_HEIGHT}
            gap={MARGIN}
            placeholder={placeholder}
          />
        )}
        <GridLayout
          className={isEditMode ? '[&_.react-grid-placeholder]:hidden' : ''}
          layout={layoutsWithConstraints}
          width={gridWidth}
          gridConfig={{
            cols: COLS,
            rowHeight: ROW_HEIGHT,
            margin: [MARGIN, MARGIN],
            containerPadding: [0, 0],
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
          onDrag={handleDrag}
          onDragStop={handleDragStop}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
        >
          {layouts.map((item) => (
            <div key={item.i} className='relative'>
              <BlockRenderContent
                blockType={item.blockType}
                isEditMode={isEditMode}
                onRemove={() => handleRemoveBlock(item.i)}
              />
            </div>
          ))}
        </GridLayout>
      </div>

      <AddBlockDialog
        open={isAddBlockModalOpen}
        onOpenChange={setIsAddBlockModalOpen}
        onAddBlock={handleAddBlock}
      />
    </div>
  );
}
