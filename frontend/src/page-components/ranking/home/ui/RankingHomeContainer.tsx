'use client';

import { useState } from 'react';

import { useRankings } from '@/features/domain/attendance/get-rankings/lib/use-rankings';
import type { RankingEntry } from '@/entities/domain/attendance/model/types';
import { MemberDetailModalSheet } from '@/widgets/member/member-detail-modal/ui/MemberDetailModalSheet';
import { useAppSelector } from '@/store/hooks';

import { RankingColumn } from '../ui-block/ranking-list/ui/RankingColumn';

export function RankingHomeContainer() {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useRankings();

  const handleEntryClick = (entry: RankingEntry) => {
    setSelectedMemberId(entry.user.id);
    setIsDetailModalOpen(true);
  };

  const currentUser = data?.data.currentUser;
  const currentUserId = user?.id ?? null;

  return (
    <div className='flex min-h-0 flex-1 gap-0 px-2 py-4'>
      <RankingColumn
        type='monthly'
        entries={data?.data.monthly.entries ?? []}
        myRank={currentUser?.monthly.rank ?? 0}
        myScore={currentUser?.monthly.score ?? 0}
        currentUserId={currentUserId}
        isLoading={isLoading}
        onEntryClick={handleEntryClick}
      />
      <RankingColumn
        type='total'
        entries={data?.data.total.entries ?? []}
        myRank={currentUser?.total.rank ?? 0}
        myScore={currentUser?.total.score ?? 0}
        currentUserId={currentUserId}
        isLoading={isLoading}
        onEntryClick={handleEntryClick}
      />
      <RankingColumn
        type='streak'
        entries={data?.data.streak.entries ?? []}
        myRank={currentUser?.streak.rank ?? 0}
        myScore={currentUser?.streak.score ?? 0}
        currentUserId={currentUserId}
        isLoading={isLoading}
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
