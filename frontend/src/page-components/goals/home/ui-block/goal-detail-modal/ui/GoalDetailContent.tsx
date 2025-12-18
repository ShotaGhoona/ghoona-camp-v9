'use client';

import {
  Calendar,
  Edit,
  Globe,
  Lock,
  Target,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/shared/ui/shadcn/ui/badge';
import { Progress } from '@/shared/ui/shadcn/ui/progress';
import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import { Separator } from '@/shared/ui/shadcn/ui/separator';

import type { GoalItem } from '@/entities/domain/goal/model/types';
import {
  getRemainingDays,
  getProgressPercent,
} from '@/entities/domain/goal/model/types';
import { useDeleteGoal } from '@/features/domain/goal/delete-goal/lib/use-delete-goal';

interface GoalDetailContentProps {
  goal: GoalItem;
  isOwn: boolean;
  onEdit?: () => void;
  onClose?: () => void;
  onMemberClick?: (memberId: string) => void;
}

/** 日付を短くフォーマット */
function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/** 残り日数の表示テキスト */
function getRemainingText(days: number | null): string {
  if (days === null) return '---';
  if (days < 0) return `${Math.abs(days)}日超過`;
  if (days === 0) return '今日まで';
  return `${days}日`;
}

export function GoalDetailContent({
  goal,
  isOwn,
  onEdit,
  onClose,
  onMemberClick,
}: GoalDetailContentProps) {
  const deleteGoalMutation = useDeleteGoal({
    onSuccess: () => {
      onClose?.();
    },
  });

  const remainingDays = getRemainingDays(goal);
  const progressPercent = getProgressPercent(goal);
  const remainingText = getRemainingText(remainingDays);
  const isOverdue = remainingDays !== null && remainingDays < 0;

  const handleMemberClick = () => {
    if (!isOwn && onMemberClick) {
      onMemberClick(goal.userId);
    }
  };

  const handleEdit = () => {
    onEdit?.();
  };

  const handleDelete = () => {
    if (confirm(`「${goal.title}」を削除してもよろしいですか？`)) {
      deleteGoalMutation.mutate(goal.id);
    }
  };

  return (
    <div className='flex h-full flex-col'>
      <ScrollArea className='flex-1'>
        <div className='flex flex-col'>
          {/* ヘッダー部分 */}
          <div className='relative'>
            {/* 背景グラデーション */}
            <div className='h-24 bg-gradient-to-br from-primary via-primary/40 to-primary/5' />

            {/* ステータスバッジ - 左上 */}
            <div className='absolute left-4 top-4 flex gap-1.5'>
              <Badge
                variant={goal.isActive ? 'default' : 'secondary'}
                className='bg-background/90'
              >
                {goal.isActive ? '進行中' : '完了'}
              </Badge>
              {isOwn && (
                <Badge variant='secondary' className='gap-1 bg-background/90'>
                  {goal.isPublic ? (
                    <>
                      <Globe className='size-3' />
                      公開
                    </>
                  ) : (
                    <>
                      <Lock className='size-3' />
                      非公開
                    </>
                  )}
                </Badge>
              )}
            </div>

            {/* アイコン */}
            <div className='absolute left-1/2 top-12 -translate-x-1/2'>
              <button
                type='button'
                onClick={handleMemberClick}
                disabled={isOwn}
                className='size-24 overflow-hidden rounded-full bg-background shadow-raised transition-transform hover:scale-105 disabled:cursor-default disabled:hover:scale-100'
              >
                <div className='flex size-full items-center justify-center bg-muted'>
                  <Target className='size-10 text-muted-foreground' />
                </div>
              </button>
            </div>
          </div>

          {/* 目標情報 */}
          <div className='mt-14 space-y-5 px-6 pb-6'>
            {/* タイトル */}
            <div className='text-center'>
              <h2 className='text-xl font-bold'>{goal.title}</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                {isOwn ? 'あなたの目標' : '他のメンバーの目標'}
              </p>
            </div>

            {/* 期間情報 */}
            <div className='grid grid-cols-3 gap-3 rounded-xl p-4 shadow-raised-sm'>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-1 text-lg font-bold text-primary'>
                  <Calendar className='size-4' />
                  {formatDateShort(goal.startedAt)}
                </div>
                <p className='text-xs text-muted-foreground'>開始日</p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-1 text-lg font-bold text-primary'>
                  <Calendar className='size-4' />
                  {goal.endedAt ? formatDateShort(goal.endedAt) : '---'}
                </div>
                <p className='text-xs text-muted-foreground'>終了日</p>
              </div>
              <div className='text-center'>
                <div
                  className={`flex items-center justify-center gap-1 text-lg font-bold ${isOverdue ? 'text-destructive' : 'text-orange-500'}`}
                >
                  <Target className='size-4' />
                  {remainingText}
                </div>
                <p className='text-xs text-muted-foreground'>残り</p>
              </div>
            </div>

            {/* 進捗バー */}
            {progressPercent !== null && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>進捗</span>
                  <span className='font-medium'>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className='h-2' />
              </div>
            )}

            {/* 詳細説明 */}
            {goal.description && (
              <div>
                <h3 className='mb-2 text-sm font-semibold text-muted-foreground'>
                  詳細
                </h3>
                <p className='whitespace-pre-wrap text-sm leading-relaxed'>
                  {goal.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* アクションボタン（自分の目標の場合のみ） */}
      {isOwn && (
        <div className='flex gap-3 border-t bg-background px-6 py-4'>
          <button
            type='button'
            onClick={handleDelete}
            disabled={deleteGoalMutation.isPending}
            className='flex items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive shadow-raised-sm transition-all hover:bg-destructive/20 disabled:opacity-50'
          >
            <Trash2 className='size-4' />
            {deleteGoalMutation.isPending ? '削除中...' : '削除'}
          </button>
          <button
            type='button'
            onClick={handleEdit}
            disabled={deleteGoalMutation.isPending}
            className='flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-raised-sm transition-all hover:bg-primary/90 disabled:opacity-50'
          >
            <Edit className='size-4' />
            編集する
          </button>
        </div>
      )}
    </div>
  );
}
