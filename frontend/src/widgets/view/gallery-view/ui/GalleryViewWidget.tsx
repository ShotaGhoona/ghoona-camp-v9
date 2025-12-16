'use client';

import { useState, useMemo, type ReactNode } from 'react';

import { cn } from '@/shared/ui/shadcn/lib/utils';

import { PageNation } from '../../shared/ui/PageNation';
import type { PaginationConfig } from '../../shared/model/types';

interface GalleryViewWidgetProps<T> {
  /** 表示するデータ配列 */
  data: T[];
  /** カードをレンダリングする関数 */
  cardRenderer: (item: T, index: number) => ReactNode;
  /** ユニークなキーを取得する関数 */
  keyExtractor: (item: T) => string | number;
  /** 固定カラム数のデフォルト値 */
  defaultGridColumns?: number;
  /** 固定カラム数の選択肢（指定するとグリッド数選択UIが表示される） */
  gridColumnOptions?: number[];
  /** 1ページあたりの表示件数（デフォルト: 24） */
  defaultPageSize?: number;
  /** ページサイズの選択肢 */
  pageSizeOptions?: number[];
  /** カード間のギャップ（Tailwind gap値、デフォルト: 4） */
  gap?: number;
  /** データが空の時に表示するコンテンツ */
  emptyContent?: ReactNode;
  /** 追加のクラス名 */
  className?: string;
}

/** ギャップからTailwindクラスを生成 */
function getGapClass(gap: number): string {
  return `gap-${gap}`;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [24, 48, 96];
const DEFAULT_GRID_COLUMN_OPTIONS = [3, 4, 5, 6, 8];

export function GalleryViewWidget<T>({
  data,
  cardRenderer,
  keyExtractor,
  defaultGridColumns = 5,
  gridColumnOptions = DEFAULT_GRID_COLUMN_OPTIONS,
  defaultPageSize = 24,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  gap = 4,
  emptyContent,
  className,
}: GalleryViewWidgetProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [gridColumns, setGridColumns] = useState(defaultGridColumns);

  // ページネーション計算
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize]);

  // ページサイズ変更時は1ページ目に戻る
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // ページ変更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // PaginationConfig
  const pagination: PaginationConfig = {
    currentPage,
    pageSize,
    totalItems: data.length,
    pageSizeOptions,
  };

  // グリッドカラム数変更
  const handleGridColumnsChange = (newColumns: number) => {
    setGridColumns(newColumns);
  };

  // データが空の場合
  if (data.length === 0) {
    return (
      <div className={cn('flex flex-1 flex-col', className)}>
        <div className="flex flex-1 items-center justify-center">
          {emptyContent ?? (
            <p className="text-muted-foreground">データがありません</p>
          )}
        </div>
      </div>
    );
  }

  const gapClass = getGapClass(gap);

  return (
    <div className={cn('flex flex-1 flex-col', className)}>
      {/* グリッドコンテンツ */}
      <div className="flex-1 overflow-auto p-6">
        <div
          className={cn('grid', gapClass)}
          style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
        >
          {paginatedData.map((item, index) => (
            <div key={keyExtractor(item)}>{cardRenderer(item, index)}</div>
          ))}
        </div>
      </div>

      {/* ページネーション */}
      <PageNation
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        gridColumns={gridColumns}
        gridColumnOptions={gridColumnOptions}
        onGridColumnsChange={handleGridColumnsChange}
      />
    </div>
  );
}
