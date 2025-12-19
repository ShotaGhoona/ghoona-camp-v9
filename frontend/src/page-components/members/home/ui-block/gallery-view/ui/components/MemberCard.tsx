'use client';

import { Eye, Trophy, User } from 'lucide-react';

import { Badge } from '@/shared/ui/shadcn/ui/badge';
import { Card } from '@/shared/ui/shadcn/ui/card';
import type { TitleLevel } from '@/shared/domain/title/model/types';
import { getTitleByLevel } from '@/shared/domain/title/lib/title-utils';
import type { UserListItem } from '@/entities/domain/user/model/types';

interface MemberCardProps {
  member: UserListItem;
  onClick?: (member: UserListItem) => void;
}

export function MemberCard({ member, onClick }: MemberCardProps) {
  const handleClick = () => {
    onClick?.(member);
  };

  return (
    <Card
      variant='raised'
      className='group relative h-full cursor-pointer gap-0 overflow-hidden py-5 transition-all duration-500 hover:shadow-lg'
      onClick={handleClick}
    >
      {/* 背景レイヤー - ホバー時に表示される拡大画像 */}
      <div className='pointer-events-none absolute inset-0 z-0'>
        {/* 背景画像 */}
        {member.avatarUrl && (
          <div
            className='absolute inset-0 scale-110 bg-cover bg-center opacity-0 blur-sm transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100 group-hover:blur-0'
            style={{ backgroundImage: `url(${member.avatarUrl})` }}
          />
        )}
        {/* グラデーションオーバーレイ */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100' />
      </div>

      {/* メインコンテンツ */}
      <div className='relative z-10 flex flex-col items-center gap-3 px-4'>
        {/* アバター部分 */}
        <div className='relative'>
          {/* アバター - ホバー時にフェードアウト */}
          <div className='relative size-20 overflow-hidden rounded-full shadow-inset transition-all duration-500 ease-out group-hover:scale-90 group-hover:opacity-0'>
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.displayName ?? ''}
                className='size-full object-cover'
              />
            ) : (
              <div className='flex size-full items-center justify-center bg-card'>
                <User className='size-8 text-muted-foreground' />
              </div>
            )}
          </div>

          {/* クリック誘導アフォーダンス - ホバー時に表示 */}
          <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 ease-out group-hover:opacity-100'>
            {/* パルスリング */}
            <div
              className='absolute size-16 animate-ping rounded-full bg-white/30'
              style={{ animationDuration: '1.5s' }}
            />
            <div className='absolute size-14 rounded-full bg-white/20 backdrop-blur-sm' />
            {/* アイコン */}
            <Eye className='relative size-6 text-white drop-shadow-lg' />
          </div>
        </div>

        {/* 名前・tagline */}
        <div className='flex flex-col items-center gap-1 text-center transition-all duration-500 ease-out group-hover:translate-y-6'>
          <h3 className='text-base font-semibold transition-colors duration-500 group-hover:text-white'>
            {member.displayName}
          </h3>
          {member.tagline && (
            <p className='line-clamp-2 text-xs text-muted-foreground transition-all duration-500 group-hover:line-clamp-none group-hover:text-white/80'>
              {member.tagline}
            </p>
          )}
        </div>
      </div>

      {/* 称号バッジ - ホバー時にフェードアウト */}
      {member.currentTitleLevel && (
        <div className='relative z-10 flex justify-center px-4 pt-2 transition-all duration-500 ease-out group-hover:opacity-0'>
          <Badge variant='default' className='gap-1 text-xs'>
            <Trophy className='size-3' />
            {getTitleByLevel(member.currentTitleLevel as TitleLevel).nameJp}
          </Badge>
        </div>
      )}
    </Card>
  );
}
