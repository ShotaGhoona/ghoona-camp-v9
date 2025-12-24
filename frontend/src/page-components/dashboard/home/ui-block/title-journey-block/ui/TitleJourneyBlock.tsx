'use client';

import { useAppSelector } from '@/store/hooks';
import type { TitleLevel } from '@/shared/domain/title/model/types';
import { useUserTitleAchievements } from '@/features/domain/title/get-user-title-achievements/lib/use-user-title-achievements';
import { TitleJourneyProgress } from '@/page-components/titles/home/ui-block/user-stats/ui/NextTitleProgress';

export function TitleJourneyBlock() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: achievementsData } = useUserTitleAchievements(user?.id ?? null);

  const currentTitleLevel = (achievementsData?.data.currentTitleLevel ?? 1) as TitleLevel;
  const totalAttendanceDays = achievementsData?.data.totalAttendanceDays ?? 0;

  return (
    <TitleJourneyProgress
      totalAttendanceDays={totalAttendanceDays}
      currentLevel={currentTitleLevel}
    />
  );
}
