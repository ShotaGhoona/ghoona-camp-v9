'use client';

import { useAppSelector } from '@/store/hooks';
import type { TitleLevel } from '@/shared/domain/title/model/types';
import { getTitleByLevel } from '@/shared/domain/title/lib/title-utils';
import { useUserTitleAchievements } from '@/features/domain/title/get-user-title-achievements/lib/use-user-title-achievements';
import { CurrentTitleCard } from '@/page-components/titles/home/ui-block/user-stats/ui/CurrentTitleCard';

export function CurrentTitleBlock() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: achievementsData } = useUserTitleAchievements(user?.id ?? null);

  const currentTitleLevel = (achievementsData?.data.currentTitleLevel ?? 1) as TitleLevel;
  const currentTitle = getTitleByLevel(currentTitleLevel);

  return <CurrentTitleCard title={currentTitle} />;
}
