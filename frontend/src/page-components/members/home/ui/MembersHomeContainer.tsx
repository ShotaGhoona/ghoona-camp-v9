'use client';

import { useState } from 'react';

import type { UserListItem } from '@/entities/domain/user/model/types';
import { useUsers } from '@/features/domain/user/get-users/lib/use-users';
import { MemberDetailModalSheet } from '@/widgets/member/member-detail-modal/ui/MemberDetailModalSheet';

import { MembersGalleryView } from '../ui-block/gallery-view/ui/MembersGalleryView';
import { MembersFilterSidebar } from '../ui-block/filter-sidebar/ui/MembersFilterSidebar';
import { FilterToggleButton } from '../ui-block/filter-sidebar/ui/FilterToggleButton';
import { SearchWindow } from '../ui-block/filter-sidebar/ui/SearchWindow';
import type { MembersFilterState } from '../ui-block/filter-sidebar/model/types';
import {
  initialFilterState,
  getActiveFilterCount,
} from '../ui-block/filter-sidebar/model/types';

export function MembersHomeContainer() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState<MembersFilterState>(initialFilterState);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // APIからユーザー一覧を取得
  const { data, isLoading } = useUsers({
    search: filter.searchQuery || undefined,
    skills: filter.selectedSkills.length > 0 ? filter.selectedSkills : undefined,
    interests: filter.selectedInterests.length > 0 ? filter.selectedInterests : undefined,
    titleLevels: filter.selectedTitleLevels.length > 0 ? filter.selectedTitleLevels : undefined,
  });

  const users = data?.data.users ?? [];
  const total = data?.data.pagination.total ?? 0;

  const handleMemberClick = (member: UserListItem) => {
    setSelectedMemberId(member.id);
    setIsDetailModalOpen(true);
  };

  const activeFilterCount = getActiveFilterCount(filter);

  const handleSearchChange = (value: string) => {
    setFilter((prev) => ({ ...prev, searchQuery: value }));
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* メインコンテンツ */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3"></div>

          {/* 検索 & フィルター */}
          <div className="flex items-center gap-3">
            <SearchWindow
              value={filter.searchQuery}
              onChange={handleSearchChange}
              placeholder="名前、一言で検索..."
            />
            <FilterToggleButton
              isOpen={isFilterOpen}
              activeCount={activeFilterCount}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            />
          </div>
        </div>

        {/* ギャラリーコンテンツ */}
        <MembersGalleryView
          members={users}
          onMemberClick={handleMemberClick}
          isLoading={isLoading}
        />
      </div>

      {/* フィルターサイドバー */}
      <MembersFilterSidebar
        isOpen={isFilterOpen}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* メンバー詳細モーダル */}
      <MemberDetailModalSheet
        memberId={selectedMemberId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        defaultViewMode="modal"
      />
    </div>
  );
}
