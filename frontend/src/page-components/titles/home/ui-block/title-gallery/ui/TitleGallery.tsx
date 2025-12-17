'use client';

import type { TitleWithHolders, UserTitleProgress } from '@/shared/dummy-data/titles/titles';

import { TitleCard } from './components/TitleCard';

interface TitleGalleryProps {
  titles: TitleWithHolders[];
  userProgress: UserTitleProgress;
  onTitleClick?: (title: TitleWithHolders) => void;
}

export function TitleGallery({ titles, userProgress, onTitleClick }: TitleGalleryProps) {
  const achievedLevels = new Set(userProgress.achievements.map((a) => a.titleLevel));

  return (
      <div className="flex min-h-0 flex-1 overflow-x-auto pb-2 h-full">
        {titles.map((title) => {
          const isAchieved = achievedLevels.has(title.level);
          const isCurrent = title.level === userProgress.currentTitle.level;

          return (
            <TitleCard
              key={title.level}
              title={title}
              isAchieved={isAchieved}
              isCurrent={isCurrent}
              onClick={onTitleClick}
            />
          );
        })}
      </div>
  );
}
