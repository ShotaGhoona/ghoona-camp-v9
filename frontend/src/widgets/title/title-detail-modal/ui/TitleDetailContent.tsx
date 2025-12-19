'use client';

import { Calendar, Crown, Users, User, Loader2 } from 'lucide-react';

import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import { Separator } from '@/shared/ui/shadcn/ui/separator';
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
  return (
    <div className='flex h-full flex-col'>
      <ScrollArea className='flex-1'>
        <div className='flex flex-col'>
          {/* ヘッダー部分 - 画像 */}
          <div className='relative h-72 overflow-hidden'>
            <img
              src={title.imageUrl}
              alt={title.nameJp}
              className={cn(
                'size-full object-cover object-top',
                !isAchieved && 'opacity-60 grayscale',
              )}
            />
            <div className='absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent' />

            {/* レベル */}
            <p className='absolute left-4 top-4 text-sm font-medium text-white/80 drop-shadow-md'>
              Lv.{title.level}
            </p>
          </div>

          {/* プロフィール情報 */}
          <div className='space-y-5 px-6 pb-6'>
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
              <p className='text-sm leading-relaxed'>{title.story}</p>
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
                <div className='flex items-center justify-center py-4'>
                  <Loader2 className='size-5 animate-spin text-muted-foreground' />
                </div>
              ) : holders.length > 0 ? (
                <div className='flex flex-wrap gap-1'>
                  {holders.slice(0, 12).map((holder) => (
                    <button
                      key={holder.id}
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
                  ))}
                  {holderCount > 12 && (
                    <div className='flex size-10 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground shadow-raised-sm'>
                      +{holderCount - 12}
                    </div>
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
      </ScrollArea>
    </div>
  );
}
