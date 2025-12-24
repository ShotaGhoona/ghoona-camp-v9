'use client';

import { useAppSelector } from '@/store/hooks';
import { useUserTitleAchievements } from '@/features/domain/title/get-user-title-achievements/lib/use-user-title-achievements';
import { UserStatsCard } from '@/page-components/titles/home/ui-block/user-stats/ui/UserStatsCard';

export function UserStatsBlock() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: achievementsData } = useUserTitleAchievements(user?.id ?? null);

  const totalAttendanceDays = achievementsData?.data.totalAttendanceDays ?? 0;
  const achievements = achievementsData?.data.achievements ?? [];

  return (
    <UserStatsCard
      totalAttendanceDays={totalAttendanceDays}
      achievedTitlesCount={achievements.length}
    />
  );
}
