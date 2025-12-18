'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/ui/button';
import { useAppSelector } from '@/store/hooks';
import type { GoalItem } from '@/entities/domain/goal/model/types';
import { useMyGoals } from '@/features/domain/goal/get-my-goals/lib/use-my-goals';
import { usePublicGoals } from '@/features/domain/goal/get-public-goals/lib/use-public-goals';
import { GoalDetailModalSheet } from '../ui-block/goal-detail-modal/ui/GoalDetailModalSheet';
import { CreateGoalModalSheet } from '../ui-block/create-goal/ui/CreateGoalModalSheet';
import { EditGoalModalSheet } from '../ui-block/edit-goal/ui/EditGoalModalSheet';
import { MemberDetailModalSheet } from '@/widgets/member/member-detail-modal/ui/MemberDetailModalSheet';

import { GoalsTimelineView } from '../ui-block/timeline-view/ui/GoalsTimelineView';
import { GoalsSidebar } from '../ui-block/goals-sidebar/ui/GoalsSidebar';

export function GoalsHomeContainer() {
  const { user } = useAppSelector((state) => state.auth);

  // 表示基準月
  const [baseYear, setBaseYear] = useState(() => new Date().getFullYear());
  const [baseMonth, setBaseMonth] = useState(() => new Date().getMonth() + 1);

  // 自分の目標取得
  const { data: myGoalsData, isLoading: isLoadingMyGoals } = useMyGoals({
    year: baseYear,
    month: baseMonth,
  });

  // 公開目標取得（モーダルで使用）
  const { data: publicGoalsData } = usePublicGoals({
    year: baseYear,
    month: baseMonth,
  });

  // 目標詳細モーダル
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 新規作成モーダル
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 編集モーダル
  const [editGoalId, setEditGoalId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // メンバー詳細モーダル
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // 月の移動
  const handlePrevMonth = () => {
    if (baseMonth === 1) {
      setBaseYear(baseYear - 1);
      setBaseMonth(12);
    } else {
      setBaseMonth(baseMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (baseMonth === 12) {
      setBaseYear(baseYear + 1);
      setBaseMonth(1);
    } else {
      setBaseMonth(baseMonth + 1);
    }
  };

  // 目標クリック
  const handleGoalClick = (goal: GoalItem) => {
    setSelectedGoalId(goal.id);
    setIsDetailModalOpen(true);
  };

  // 新規作成
  const handleCreateGoal = () => {
    setIsCreateModalOpen(true);
  };

  // 編集
  const handleEditGoal = (goalId: string) => {
    setEditGoalId(goalId);
    setIsEditModalOpen(true);
  };

  // メンバークリック
  const handleMemberClick = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsMemberModalOpen(true);
  };

  // 自分の目標
  const myGoals = myGoalsData?.data.goals ?? [];
  const publicGoals = publicGoalsData?.data.goals ?? [];

  return (
    <div className='flex min-h-0 flex-1 gap-4 overflow-hidden p-4'>
      {/* 左側: タイムライン */}
      <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden'>
        {/* ツールバー */}
        <div className='flex shrink-0 items-center gap-4'>
          {/* 月ナビゲーション */}
          <div className='flex items-center gap-2'>
            <Button
              variant='raised'
              size='icon'
              className='size-8'
              onClick={handlePrevMonth}
            >
              <ChevronLeft className='size-4' />
            </Button>
            <span className='min-w-[100px] text-center font-medium'>
              {baseYear}年{baseMonth}月
            </span>
            <Button
              variant='raised'
              size='icon'
              className='size-8'
              onClick={handleNextMonth}
            >
              <ChevronRight className='size-4' />
            </Button>
          </div>

          {/* 新規作成ボタン */}
          <Button variant='raised' onClick={handleCreateGoal} className='gap-2'>
            <Plus className='size-4' />
            新規作成
          </Button>
        </div>

        {/* タイムラインビュー */}
        <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
          <GoalsTimelineView
            year={baseYear}
            month={baseMonth}
            goals={myGoals}
            onGoalClick={handleGoalClick}
            isLoading={isLoadingMyGoals}
            currentUserId={user?.id}
          />
        </div>
      </div>

      {/* 右側: みんなの目標（サイドバー） */}
      <div className='w-96 shrink-0'>
        <GoalsSidebar
          year={baseYear}
          month={baseMonth}
          onGoalClick={handleGoalClick}
        />
      </div>

      {/* 目標詳細モーダル */}
      <GoalDetailModalSheet
        goalId={selectedGoalId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        defaultViewMode='modal'
        onMemberClick={handleMemberClick}
        onEdit={handleEditGoal}
        currentUserId={user?.id}
        myGoals={myGoals}
        publicGoals={publicGoals}
      />

      {/* 新規作成モーダル */}
      <CreateGoalModalSheet
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        defaultViewMode='modal'
      />

      {/* 編集モーダル */}
      <EditGoalModalSheet
        goalId={editGoalId}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        defaultViewMode='modal'
        myGoals={myGoals}
      />

      {/* メンバー詳細モーダル */}
      <MemberDetailModalSheet
        memberId={selectedMemberId}
        open={isMemberModalOpen}
        onOpenChange={setIsMemberModalOpen}
      />
    </div>
  );
}
