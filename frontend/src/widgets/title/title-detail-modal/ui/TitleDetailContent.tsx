'use client';

import { useState } from 'react';
import { Calendar, Crown, Users, User } from 'lucide-react';

import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import { Separator } from '@/shared/ui/shadcn/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn/ui/tooltip';
import { Skeleton } from '@/shared/ui/shadcn/ui/skeleton';
import { cn } from '@/shared/ui/shadcn/lib/utils';

import { useAppSelector } from '@/store/hooks';
import type { TitleLevel } from '@/shared/domain/title/model/types';
import { getTitleByLevel } from '@/shared/domain/title/lib/title-utils';
import { useTitleHolders } from '@/features/domain/title/get-title-holders/lib/use-title-holders';
import { useUserTitleAchievements } from '@/features/domain/title/get-user-title-achievements/lib/use-user-title-achievements';

interface TitleDetailContentProps {
  titleLevel: TitleLevel;
  onHolderClick?: (holderId: string) => void;
}

export function TitleDetailContent({
  titleLevel,
  onHolderClick,
}: TitleDetailContentProps) {
  const { user } = useAppSelector((state) => state.auth);

  // 称号マスターから取得
  const title = getTitleByLevel(titleLevel);

  // APIから保持者一覧を取得
  const { data: holdersData, isLoading: isLoadingHolders } =
    useTitleHolders(titleLevel);

  // ユーザーの称号実績を取得
  const { data: achievementsData } = useUserTitleAchievements(user?.id ?? null);

  // ユーザーの獲得状態を計算
  const achievements = achievementsData?.data.achievements ?? [];
  const currentTitleLevel = achievementsData?.data.currentTitleLevel ?? 1;
  const achievedLevels = new Set<TitleLevel>(
    achievements.map((a) => a.titleLevel),
  );
  const isAchieved = achievedLevels.has(titleLevel);
  const isCurrent = titleLevel === currentTitleLevel;
  const achievement = achievements.find((a) => a.titleLevel === titleLevel);
  const achievedAt = achievement?.achievedAt;

  // 保持者データ
  const holders = holdersData?.data.holders ?? [];
  const holderCount = holdersData?.data.total ?? 0;

  // ストーリー展開状態
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);

  // 保持者展開状態
  const [isHoldersExpanded, setIsHoldersExpanded] = useState(false);

  return (
    <div className='relative h-full overflow-hidden'>
      {/* 背景画像（固定） */}
      <div className='absolute inset-x-0 top-0 h-72'>
        <img
          src={title.imageUrl}
          alt={title.nameJp}
          className={cn(
            'size-full object-cover object-top',
            !isAchieved && 'opacity-60 grayscale',
          )}
        />
        {/* レベル */}
        <p className='absolute left-4 top-4 text-sm font-medium text-white/80 drop-shadow-md'>
          Lv.{title.level}
        </p>
      </div>

      {/* スクロールコンテンツ */}
      <ScrollArea className='h-full'>
        {/* スペーサー（写真が見える領域） */}
        <div className='h-56' />

        {/* コンテンツカード（写真を侵食） */}
        <div className='relative z-10'>
          {/* グラデーションオーバーレイ */}
          <div className='h-16 bg-gradient-to-t from-background to-transparent' />
          <div className='bg-background px-6 pb-6'>
            <div className='space-y-5'>
            {/* 名前 & ステータス */}
            <div className='text-center'>
              <h2 className='text-xl font-bold'>{title.nameJp}</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                {title.nameEn}
              </p>
              <p className='mt-2 text-xs text-muted-foreground'>
                {isCurrent ? '現在の称号' : isAchieved ? '獲得済み' : '未獲得'}
              </p>
            </div>

            {/* 獲得条件 & 獲得日 */}
            <div className='grid grid-cols-2 gap-3 rounded-xl p-4 shadow-raised-sm'>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-1 text-lg font-bold'>
                  <Crown className='size-4 text-amber-500' />
                  {title.requiredDays === 0
                    ? '初回'
                    : `${title.requiredDays}日`}
                </div>
                <p className='text-xs text-muted-foreground'>獲得条件</p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-1 text-lg font-bold'>
                  <Calendar className='size-4 text-primary' />
                  {achievedAt
                    ? new Date(achievedAt).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '---'}
                </div>
                <p className='text-xs text-muted-foreground'>獲得日</p>
              </div>
            </div>

            {/* ストーリー */}
            <div>
              <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
                Story
              </h3>
              <button
                type='button'
                onClick={() => setIsStoryExpanded(!isStoryExpanded)}
                className='relative w-full text-left'
              >
                <p
                  className={cn(
                    'text-sm leading-relaxed transition-all duration-300',
                    !isStoryExpanded && 'line-clamp-3',
                  )}
                >
                  {title.story}
                </p>
                {!isStoryExpanded && (
                  <div className='absolute inset-x-0 bottom-0 flex h-12 items-end justify-center bg-gradient-to-t from-background via-background/80 to-transparent'>
                    <span className='pb-1 text-xs text-muted-foreground'>
                      続きを読む
                    </span>
                  </div>
                )}
              </button>
            </div>

            <Separator />

            {/* 保持者一覧 */}
            <div>
              <div className='mb-3 flex items-center justify-between'>
                <h3 className='flex items-center gap-2 text-sm font-semibold text-muted-foreground'>
                  <Users className='size-4' />
                  保持者
                </h3>
                <span className='text-xs text-muted-foreground'>
                  {isLoadingHolders ? '...' : `${holderCount}人`}
                </span>
              </div>

              {isLoadingHolders ? (
                <div className='flex flex-wrap gap-1'>
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className='size-10 rounded-full' />
                  ))}
                </div>
              ) : holders.length > 0 ? (
                <div className='flex flex-wrap gap-1'>
                  {(isHoldersExpanded ? holders : holders.slice(0, 9)).map(
                    (holder) => (
                      <Tooltip key={holder.id}>
                        <TooltipTrigger asChild>
                          <button
                            type='button'
                            onClick={() => onHolderClick?.(holder.id)}
                            className='size-10 overflow-hidden rounded-full bg-muted shadow-raised-sm transition-transform hover:scale-105'
                          >
                            {holder.avatarUrl ? (
                              <img
                                src={holder.avatarUrl}
                                alt={holder.displayName ?? ''}
                                className='size-full object-cover'
                              />
                            ) : (
                              <div className='flex size-full items-center justify-center'>
                                <User className='size-4 text-muted-foreground' />
                              </div>
                            )}
                          </button>
                        </TooltipTrigger>
                        {holder.displayName && (
                          <TooltipContent>{holder.displayName}</TooltipContent>
                        )}
                      </Tooltip>
                    ),
                  )}
                  {holderCount > 9 && (
                    <button
                      type='button'
                      onClick={() => setIsHoldersExpanded(!isHoldersExpanded)}
                      className='flex size-10 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground shadow-raised-sm transition-colors hover:bg-muted/80'
                    >
                      {isHoldersExpanded ? '閉' : `+${holderCount - 9}`}
                    </button>
                  )}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>
                  まだ保持者がいません
                </p>
              )}
            </div>
          </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
