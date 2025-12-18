'use client';

import type { ReactNode } from 'react';

import { NoData } from '@/shared/ui/components/empty-design/ui/NoData';

import { PageNation } from '../../shared/ui/PageNation';
import {
  useGalleryView,
  type UseGalleryViewOptions,
} from '../lib/use-gallery-view';

interface GalleryViewWidgetProps<T> extends UseGalleryViewOptions<T> {
  /** カードをレンダリングする関数 */
  cardRenderer: (item: T, index: number) => ReactNode;
  /** ユニークなキーを取得する関数 */
  keyExtractor: (item: T) => string | number;
}

export function GalleryViewWidget<T>({
  cardRenderer,
  keyExtractor,
  ...options
}: GalleryViewWidgetProps<T>) {
  const {
    displayData,
    gridColumns,
    gridColumnOptions,
    pagination,
    isEmpty,
    handlePageChange,
    handlePageSizeChange,
    handleGridColumnsChange,
  } = useGalleryView(options);

  if (isEmpty) {
    return (
      <div className='flex min-h-0 flex-1 flex-col'>
        <div className='flex min-h-0 flex-1 items-center justify-center'>
          <NoData />
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {/* グリッドコンテンツ */}
      <div className='min-h-0 flex-1 overflow-auto p-6'>
        <div
          className='grid gap-4'
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
          }}
        >
          {displayData.map((item, index) => (
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
