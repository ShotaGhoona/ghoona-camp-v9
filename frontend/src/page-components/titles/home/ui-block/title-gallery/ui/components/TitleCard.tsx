'use client';

import { cn } from '@/shared/ui/shadcn/lib/utils';

import type { TitleWithHolders } from '@/shared/dummy-data/titles/titles';

interface TitleCardProps {
  title: TitleWithHolders;
  isAchieved: boolean;
  isCurrent: boolean;
  onClick?: (title: TitleWithHolders) => void;
}

export function TitleCard({ title, isAchieved, isCurrent, onClick }: TitleCardProps) {
  return (
    <div
      className={cn(
        'group h-full shrink-0 cursor-pointer transition-transform duration-300 p-6',
        'hover:-translate-y-1'
      )}
      onClick={() => onClick?.(title)}
    >
      <div
        className={cn(
          'relative h-full overflow-hidden rounded-xl shadow-raised aspect-[3/4]',
          isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
          !isAchieved && 'grayscale'
        )}
      >
        <img
          src={title.imageUrl}
          alt={title.nameJp}
          className={cn(
            'size-full object-cover object-top',
            !isAchieved && 'opacity-50'
          )}
        />

        {/* 下部グラデーション */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

        {/* レベル */}
        <p className="absolute left-2 top-2 text-xs font-medium text-white/80">
          Lv.{title.level}
        </p>

        {/* テキスト */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-bold text-white">{title.nameJp}</p>
          <p className="text-xs text-white/70">{title.nameEn}</p>
        </div>
      </div>
    </div>
  );
}
