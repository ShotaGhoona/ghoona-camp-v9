'use client';

import { useState } from 'react';

import {
  dummyTitlesWithHolders,
  dummyUserTitleProgress,
} from '@/shared/dummy-data/titles/titles';
import type { TitleWithHolders } from '@/shared/dummy-data/titles/titles';

import { CurrentTitleCard } from '../ui-block/user-stats/ui/CurrentTitleCard';
import { TitleJourneyProgress } from '../ui-block/user-stats/ui/NextTitleProgress';
import { UserStatsCard } from '../ui-block/user-stats/ui/UserStatsCard';
import { TitleGallery } from '../ui-block/title-gallery/ui/TitleGallery';
import { TitleDetailModalSheet } from '@/widgets/title/title-detail-modal/ui/TitleDetailModalSheet';
import { MemberDetailModalSheet } from '@/widgets/member/member-detail-modal/ui/MemberDetailModalSheet';

export function TitlesHomeContainer() {
  const [selectedTitleLevel, setSelectedTitleLevel] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const handleTitleClick = (title: TitleWithHolders) => {
    setSelectedTitleLevel(title.level);
    setIsDetailModalOpen(true);
  };

  const handleHolderClick = (holderId: string) => {
    setSelectedMemberId(holderId);
    setIsMemberModalOpen(true);
  };

  const { currentTitle, nextTitle, totalAttendanceDays, daysToNextTitle, progressPercentage, achievements } = dummyUserTitleProgress;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* メインコンテンツ（上下分割） */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* 上部: ユーザー進捗カード群（横並び） */}
        <div className="flex shrink-0 items-stretch gap-4 p-6">
          {/* 現在の称号 */}
          <div className="w-56 shrink-0">
            <CurrentTitleCard title={currentTitle} />
          </div>
          {/* あなたの記録 */}
          <div className="w-48 shrink-0">
            <UserStatsCard
              totalAttendanceDays={totalAttendanceDays}
              achievedTitlesCount={achievements.length}
            />
          </div>
          {/* 称号ジャーニー（flex-1で広く） */}
          <TitleJourneyProgress
            totalAttendanceDays={totalAttendanceDays}
            currentLevel={currentTitle.level}
          />
        </div>

        {/* 下部: 称号ギャラリー（横スクロール） */}
        <div className="min-h-0 flex-1">
          <TitleGallery
            titles={dummyTitlesWithHolders}
            userProgress={dummyUserTitleProgress}
            onTitleClick={handleTitleClick}
          />
        </div>
      </div>

      {/* 称号詳細モーダル */}
      <TitleDetailModalSheet
        titleLevel={selectedTitleLevel}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onHolderClick={handleHolderClick}
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
