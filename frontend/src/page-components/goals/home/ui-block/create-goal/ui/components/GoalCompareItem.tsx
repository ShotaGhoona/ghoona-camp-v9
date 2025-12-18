'use client';

import { User } from 'lucide-react';

import { Badge } from '@/shared/ui/shadcn/ui/badge';

import type { GoalItem } from '@/entities/domain/goal/model/types';

interface GoalCompareItemProps {
  goal: GoalItem;
}

export function GoalCompareItem({ goal }: GoalCompareItemProps) {
  return (
    <div className='rounded-lg p-3 shadow-raised-sm'>
      <div className='flex items-start gap-3'>
        {/* アバター */}
        <div className='size-10 shrink-0 overflow-hidden rounded-full bg-muted shadow-inset-sm'>
          {goal.creator.avatarUrl ? (
            <img
              src={goal.creator.avatarUrl}
              alt={goal.creator.displayName ?? ''}
              className='size-full object-cover'
            />
          ) : (
            <div className='flex size-full items-center justify-center'>
              <User className='size-4 text-muted-foreground' />
            </div>
          )}
        </div>

        {/* 内容 */}
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>
              {goal.creator.displayName ?? '名前未設定'}
            </span>
            <Badge
              variant={goal.isActive ? 'default' : 'outline'}
              className='h-4 px-1 text-[10px]'
            >
              {goal.isActive ? '進行中' : '完了'}
            </Badge>
          </div>
          <p className='mt-1 text-sm font-medium leading-tight'>{goal.title}</p>
          {goal.description && (
            <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>
              {goal.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
