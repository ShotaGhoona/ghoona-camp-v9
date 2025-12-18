'use client';

import { useState, useEffect, useRef } from 'react';

import { useUsers } from '@/features/domain/user/get-users/lib/use-users';

const DEFAULT_PAGE_SIZE = 24;

export type MembersFilter = {
  search?: string;
  skills?: string[];
  interests?: string[];
  titleLevels?: number[];
};

export function useMembersGallery(filter: MembersFilter) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // フィルター変更時に1ページ目に戻す
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [filter.search, filter.skills, filter.interests, filter.titleLevels]);

  const { data, isLoading } = useUsers({
    search: filter.search,
    skills: filter.skills,
    interests: filter.interests,
    titleLevels: filter.titleLevels,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const members = data?.data.users ?? [];
  const total = data?.data.pagination.total ?? 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  return {
    members,
    total,
    isLoading,
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  };
}
