'use client';

import {
  Calendar,
  Flame,
  Loader2,
  Sparkles,
  Swords,
  Trophy,
  User,
} from 'lucide-react';

import { Badge } from '@/shared/ui/shadcn/ui/badge';
import { Separator } from '@/shared/ui/shadcn/ui/separator';
import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn/ui/tooltip';

import type { UserDetail } from '@/entities/domain/user/model/types';
import {
  getSnsIcon,
  getSnsLabel,
  type SnsPlatform,
} from '@/shared/types/user/sns';
import type { TitleLevel } from '@/shared/domain/title/model/types';
import { getTitleByLevel } from '@/shared/domain/title/lib/title-utils';
import { useRivalAction } from '../lib/use-rival-action';

interface MemberDetailContentProps {
  user: UserDetail;
}

export function MemberDetailContent({ user }: MemberDetailContentProps) {
  const currentTitle = getTitleByLevel(user.currentTitleLevel as TitleLevel);

  // ライバル操作ロジック
  const {
    isRival,
    isSelf,
    isDisabled,
    isPending,
    remainingSlots,
    handleRivalAction,
  } = useRivalAction({
    targetUserId: user.id,
    targetDisplayName: user.displayName,
  });
  return (
    <div className='flex h-full flex-col'>
      <ScrollArea className='flex-1'>
        <div className='flex flex-col'>
          {/* ヘッダー部分 - アバター & 基本情報 */}
          <div className='relative'>
            {/* 背景グラデーション */}
            <div className='h-24 bg-gradient-to-br from-primary via-primary/40 to-primary/5' />

            {/* ソーシャルリンク - 左上 */}
            {user.socialLinks.length > 0 && (
              <div className='absolute left-3 top-3 flex gap-1.5'>
                {user.socialLinks.map((link) => {
                  const Icon = getSnsIcon(link.platform as SnsPlatform);
                  return (
                    <Tooltip key={link.url}>
                      <TooltipTrigger asChild>
                        <a
                          href={link.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex size-8 items-center justify-center rounded-full bg-background text-muted-foreground shadow-inset-sm transition-all hover:text-foreground hover:shadow-inset-sm'
                        >
                          <Icon className='size-4' />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getSnsLabel(link.platform as SnsPlatform)}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            {/* アバター */}
            <div className='absolute left-1/2 top-12 -translate-x-1/2'>
              <div className='size-24 overflow-hidden rounded-full bg-background shadow-raised'>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName ?? ''}
                    className='size-full object-cover'
                  />
                ) : (
                  <div className='flex size-full items-center justify-center bg-muted'>
                    <User className='size-10 text-muted-foreground' />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* プロフィール情報 */}
          <div className='mt-14 space-y-5 px-6 pb-6'>
            {/* 名前 & タグライン */}
            <div className='text-center'>
              <h2 className='text-xl font-bold'>{user.displayName}</h2>
              {user.tagline && (
                <p className='mt-1 text-sm text-muted-foreground'>
                  {user.tagline}
                </p>
              )}
            </div>

            {/* 称号 */}
            {currentTitle && (
              <div className='flex justify-center'>
                <Badge variant='default' className='gap-1.5 px-3 py-1'>
                  <Trophy className='size-3.5' />
                  {currentTitle.nameJp}
                </Badge>
              </div>
            )}

            {/* 統計情報 */}
            <div className='grid grid-cols-3 gap-3 rounded-xl p-4 shadow-raised-sm'>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-1 text-lg font-bold text-primary'>
                  <Calendar className='size-4' />
                  {user.totalAttendanceDays}
                </div>
                <p className='text-xs text-muted-foreground'>総参加日数</p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-1 text-lg font-bold text-orange-500'>
                  <Flame className='size-4' />
                  {user.currentStreakDays}
                </div>
                <p className='text-xs text-muted-foreground'>連続日数</p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-1 text-lg font-bold text-amber-500'>
                  <Sparkles className='size-4' />
                  {user.maxStreakDays}
                </div>
                <p className='text-xs text-muted-foreground'>最大連続</p>
              </div>
            </div>

            {/* 自己紹介 */}
            {user.bio && (
              <div>
                <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
                  自己紹介
                </h3>
                <p className='text-sm leading-relaxed'>{user.bio}</p>
              </div>
            )}

            {/* ビジョン */}
            {user.vision && user.isVisionPublic && (
              <div>
                <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
                  ビジョン
                </h3>
                <div className='rounded-lg bg-primary/5 px-4 py-3 text-center'>
                  <p className='text-base font-medium leading-relaxed text-primary'>
                    &ldquo;{user.vision}&rdquo;
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* スキル */}
            {user.skills.length > 0 && (
              <div>
                <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
                  スキル
                </h3>
                <div className='flex flex-wrap gap-1.5'>
                  {user.skills.map((skill) => (
                    <Badge key={skill} variant='outline' className='text-xs'>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 興味・関心 */}
            {user.interests.length > 0 && (
              <div>
                <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
                  興味・関心
                </h3>
                <div className='flex flex-wrap gap-1.5'>
                  {user.interests.map((interest) => (
                    <Badge key={interest} variant='outline' className='text-xs'>
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* ライバル設定ボタン */}
      {!isSelf && (
        <div className='border-t bg-background px-6 py-4'>
          <button
            type='button'
            onClick={handleRivalAction}
            disabled={isDisabled}
            className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-raised-sm transition-all disabled:cursor-not-allowed ${
              isRival
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : remainingSlots <= 0
                  ? 'text-muted-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Swords className='size-4' />
            )}
            {isRival
              ? 'ライバルを解除する'
              : remainingSlots <= 0
                ? 'ライバル枠が上限に達しています'
                : 'ライバルに設定する'}
          </button>
        </div>
      )}
    </div>
  );
}
