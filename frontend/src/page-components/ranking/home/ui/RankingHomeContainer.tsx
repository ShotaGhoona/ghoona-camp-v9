'use client';

import { useState } from 'react';

import type { RankingEntry } from '@/shared/dummy-data/ranking/ranking';
import {
  monthlyRanking,
  totalRanking,
  streakRanking,
} from '@/shared/dummy-data/ranking/ranking';
import { MemberDetailModalSheet } from '@/widgets/member/member-detail-modal/ui/MemberDetailModalSheet';

import { RankingColumn } from '../ui-block/ranking-list/ui/RankingColumn';

export function RankingHomeContainer() {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleEntryClick = (entry: RankingEntry) => {
    setSelectedMemberId(entry.user.id);
    setIsDetailModalOpen(true);
  };

  return (
    <div className='flex min-h-0 flex-1 gap-0 px-2 py-4'>
      <RankingColumn
        type='monthly'
        entries={monthlyRanking}
        onEntryClick={handleEntryClick}
      />
      <RankingColumn
        type='total'
        entries={totalRanking}
        onEntryClick={handleEntryClick}
      />
      <RankingColumn
        type='streak'
        entries={streakRanking}
        onEntryClick={handleEntryClick}
      />

      {/* メンバー詳細モーダル */}
      <MemberDetailModalSheet
        memberId={selectedMemberId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        defaultViewMode='modal'
      />
    </div>
  );
}
