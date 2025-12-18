'use client';

import { Calendar, Flame, Trophy } from 'lucide-react';

import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import type {
  RankingEntry,
  RankingType,
} from '@/shared/dummy-data/ranking/ranking';
import { getScoreValue } from '@/shared/dummy-data/ranking/ranking';

import { TopThreeItem } from './components/TopThreeItem';
import { RankingItem } from './components/RankingItem';

interface RankingColumnProps {
  type: RankingType;
  entries: RankingEntry[];
  onEntryClick?: (entry: RankingEntry) => void;
}

const COLUMN_CONFIG = {
  monthly: {
    title: '今月',
    subtitle: '参加日数',
    icon: Calendar,
  },
  total: {
    title: '総合',
    subtitle: '累計参加',
    icon: Trophy,
  },
  streak: {
    title: '連続',
    subtitle: '継続日数',
    icon: Flame,
  },
};

export function RankingColumn({
  type,
  entries,
  onEntryClick,
}: RankingColumnProps) {
  const config = COLUMN_CONFIG[type];
  const Icon = config.icon;

  const topThree = entries.filter((e) => e.rank <= 3);
  const rest = entries.filter((e) => e.rank > 3);

  // 自分のエントリを取得
  const currentUserEntry = entries.find((e) => e.isCurrentUser);
  const myScore = currentUserEntry ? getScoreValue(currentUserEntry, type) : 0;
  const myRank = currentUserEntry?.rank ?? '-';

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-0'>
      {/* ヘッダー */}
      <div className='shrink-0 px-4'>
        <div className='flex items-center justify-between rounded-xl bg-primary/20 p-3 shadow-raised'>
          {/* 左: アイコン + タイトル */}
          <div className='flex items-center gap-2.5'>
            <div className='flex size-9 items-center justify-center rounded-lg bg-primary/20'>
              <Icon className='size-4 text-primary' />
            </div>
            <div>
              <h2 className='text-sm font-bold leading-tight'>
                {config.title}
              </h2>
              <p className='text-[10px] text-muted-foreground'>
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* 右: 自分のスコア・順位 */}
          <div className='flex items-baseline gap-1.5'>
            <span className='text-lg font-bold tabular-nums'>{myScore}</span>
            <span className='text-[10px] text-muted-foreground'>日</span>
            <span className='mx-1 text-muted-foreground/50'>/</span>
            <span className='flex size-5 items-center justify-center rounded bg-primary text-[10px] font-bold text-white'>
              {myRank}
            </span>
            <span className='text-[10px] text-muted-foreground'>位</span>
          </div>
        </div>
      </div>

      {/* ランキングリスト */}
      <div className='min-h-0 flex-1 overflow-hidden'>
        <ScrollArea className='h-full'>
          <div className='flex flex-col gap-4 p-6'>
            {/* トップ3（横並び） */}
            <div className='flex gap-3'>
              {topThree.map((entry) => (
                <TopThreeItem
                  key={entry.user.id}
                  entry={entry}
                  rankingType={type}
                  onClick={onEntryClick}
                />
              ))}
            </div>

            {/* 4位以下 */}
            <div className='flex flex-col gap-2'>
              {rest.map((entry) => (
                <RankingItem
                  key={entry.user.id}
                  entry={entry}
                  rankingType={type}
                  onClick={onEntryClick}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
