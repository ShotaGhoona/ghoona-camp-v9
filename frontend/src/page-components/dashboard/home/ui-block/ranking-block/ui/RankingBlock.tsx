'use client';

import { useRankings } from '@/features/domain/attendance/get-rankings/lib/use-rankings';
import { useAppSelector } from '@/store/hooks';
import { RankingColumn } from '@/page-components/ranking/home/ui-block/ranking-list/ui/RankingColumn';

export function RankingBlock() {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useRankings();

  const currentUser = data?.data.currentUser;
  const currentUserId = user?.id ?? null;

  return (
    <RankingColumn
      type='monthly'
      entries={data?.data.monthly.entries ?? []}
      myRank={currentUser?.monthly.rank ?? 0}
      myScore={currentUser?.monthly.score ?? 0}
      currentUserId={currentUserId}
      isLoading={isLoading}
    />
  );
}
