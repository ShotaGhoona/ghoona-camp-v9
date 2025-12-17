'use client';

import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';

import { dummyMembers } from '@/shared/dummy-data/members/members';
import type { MemberItem } from '@/shared/dummy-data/members/members';
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

  const handleMemberClick = (member: MemberItem) => {
    setSelectedMemberId(member.id);
    setIsDetailModalOpen(true);
  };

  // 今後消す==========================================
  const filteredMembers = useMemo(() => {
    return dummyMembers.filter((member) => {
      // キーワード検索
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const matchesName = member.displayName.toLowerCase().includes(query);
        const matchesTagline = member.tagline?.toLowerCase().includes(query);
        if (!matchesName && !matchesTagline) return false;
      }

      // スキルフィルター
      if (filter.selectedSkills.length > 0) {
        const hasSkill = filter.selectedSkills.some((skill) =>
          member.skills.includes(skill)
        );
        if (!hasSkill) return false;
      }

      // 興味フィルター
      if (filter.selectedInterests.length > 0) {
        const hasInterest = filter.selectedInterests.some((interest) =>
          member.interests.includes(interest)
        );
        if (!hasInterest) return false;
      }

      // 称号フィルター
      if (filter.selectedTitleLevels.length > 0) {
        if (!member.currentTitle) return false;
        if (!filter.selectedTitleLevels.includes(member.currentTitle.level)) {
          return false;
        }
      }

      return true;
    });
  }, [filter]);
  // =================================================

  const activeFilterCount = getActiveFilterCount(filter);

  const handleSearchChange = (value: string) => {
    setFilter((prev) => ({ ...prev, searchQuery: value }));
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* メインコンテンツ */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 shadow-raised">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">メンバー</h1>
              <p className="text-sm text-muted-foreground">
                {filteredMembers.length}人のメンバー
                {activeFilterCount > 0 && ` (全${dummyMembers.length}人中)`}
              </p>
            </div>
          </div>

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
          members={filteredMembers}
          onMemberClick={handleMemberClick}
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
