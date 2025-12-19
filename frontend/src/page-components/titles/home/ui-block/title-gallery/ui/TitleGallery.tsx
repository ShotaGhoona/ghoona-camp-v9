'use client';

import type { Title, TitleLevel } from '@/shared/domain/title/model/types';

import { TitleCard } from './components/TitleCard';

interface TitleGalleryProps {
  titles: Title[];
  currentTitleLevel: TitleLevel;
  achievedLevels: Set<TitleLevel>;
  onTitleClick?: (title: Title) => void;
}

export function TitleGallery({
  titles,
  currentTitleLevel,
  achievedLevels,
  onTitleClick,
}: TitleGalleryProps) {
  return (
    <div className='flex h-full min-h-0 flex-1 overflow-x-auto pb-2'>
      {titles.map((title) => {
        const isAchieved = achievedLevels.has(title.level);
        const isCurrent = title.level === currentTitleLevel;

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
