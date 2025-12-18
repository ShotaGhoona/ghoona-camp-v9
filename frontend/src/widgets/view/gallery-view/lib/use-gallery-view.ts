'use client';

import { useState } from 'react';

import type { PaginationConfig } from '../../shared/model/types';

const DEFAULT_PAGE_SIZE = 24;
const DEFAULT_PAGE_SIZE_OPTIONS = [24, 48, 96];
const DEFAULT_GRID_COLUMN_OPTIONS = [3, 4, 5, 6, 8];

export type UseGalleryViewOptions<T> = {
  data: T[];
  defaultGridColumns?: number;
  gridColumnOptions?: number[];
  pageSizeOptions?: number[];
  // サーバーサイドページネーション用（controlled mode）
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export function useGalleryView<T>({
  data,
  defaultGridColumns = 5,
  gridColumnOptions = DEFAULT_GRID_COLUMN_OPTIONS,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  totalItems,
  currentPage: controlledCurrentPage,
  pageSize: controlledPageSize,
  onPageChange,
  onPageSizeChange,
}: UseGalleryViewOptions<T>) {
  // controlled mode判定
  const isControlled = totalItems !== undefined && onPageChange !== undefined;

  // 内部状態（uncontrolled mode用）
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [gridColumns, setGridColumns] = useState(defaultGridColumns);

  // 実際に使用する値
  const currentPage = isControlled
    ? (controlledCurrentPage ?? 1)
    : internalCurrentPage;
  const pageSize = isControlled
    ? (controlledPageSize ?? DEFAULT_PAGE_SIZE)
    : internalPageSize;
  const total = isControlled ? totalItems : data.length;

  // 表示データ（controlled mode: データそのまま、uncontrolled mode: スライス）
  const displayData = isControlled
    ? data
    : data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ページサイズ変更
  const handlePageSizeChange = (newPageSize: number) => {
    if (isControlled) {
      onPageSizeChange?.(newPageSize);
      onPageChange?.(1);
    } else {
      setInternalPageSize(newPageSize);
      setInternalCurrentPage(1);
    }
  };

  // ページ変更
  const handlePageChange = (page: number) => {
    if (isControlled) {
      onPageChange?.(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  // グリッドカラム数変更
  const handleGridColumnsChange = (newColumns: number) => {
    setGridColumns(newColumns);
  };

  // PaginationConfig
  const pagination: PaginationConfig = {
    currentPage,
    pageSize,
    totalItems: total,
    pageSizeOptions,
  };

  // 空データ判定
  const isEmpty = data.length === 0 && total === 0;

  return {
    displayData,
    gridColumns,
    gridColumnOptions,
    pagination,
    isEmpty,
    handlePageChange,
    handlePageSizeChange,
    handleGridColumnsChange,
  };
}
