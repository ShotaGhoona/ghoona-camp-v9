'use client';

import { Sparkles } from 'lucide-react';

import { Card } from '@/shared/ui/shadcn/ui/card';
import { cn } from '@/shared/ui/shadcn/lib/utils';

import type { Title } from '@/shared/types/title/title';

interface CurrentTitleCardProps {
  title: Title;
}

export function CurrentTitleCard({ title }: CurrentTitleCardProps) {
  return (
    <Card variant='raised' className='h-full overflow-hidden p-0'>
      <div className='relative h-full'>
        {/* 背景画像 */}
        <div className='relative h-full min-h-32 overflow-hidden'>
          <img
            src={title.imageUrl}
            alt={title.nameJp}
            className='size-full object-cover object-top'
          />
          {/* グラデーションオーバーレイ */}
          <div className='absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent' />
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-40',
              title.colorTheme.gradient,
            )}
          />
        </div>

        {/* コンテンツ */}
        <div className='absolute inset-x-0 bottom-0 p-4'>
          <div className='flex items-center gap-2 text-xs text-white/80'>
            <Sparkles className='size-3' />
            <span>現在の称号</span>
          </div>
          <div className='mt-1 flex items-baseline gap-2'>
            <span className={cn('text-sm font-bold', title.colorTheme.text)}>
              Lv.{title.level}
            </span>
            <h3 className='text-lg font-bold text-foreground'>
              {title.nameJp}
            </h3>
          </div>
          <p className='text-xs text-muted-foreground'>{title.nameEn}</p>
        </div>
      </div>
    </Card>
  );
}
