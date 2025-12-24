'use client';

import { Trash2 } from 'lucide-react';

import type { DashboardBlockType } from '../../model/types';
import { ActivityCalendarBlock } from '../../ui-block/activity-calendar-block/ui/ActivityCalendarBlock';
import { CurrentTitleBlock } from '../../ui-block/current-title-block/ui/CurrentTitleBlock';
import { EventsCalendarBlock } from '../../ui-block/events-calendar-block/ui/EventsCalendarBlock';
import { GoalsSidebarBlock } from '../../ui-block/goals-sidebar-block/ui/GoalsSidebarBlock';
import { GoalsTimelineBlock } from '../../ui-block/goals-timeline-block/ui/GoalsTimelineBlock';
import { RankingBlock } from '../../ui-block/ranking-block/ui/RankingBlock';
import { TitleJourneyBlock } from '../../ui-block/title-journey-block/ui/TitleJourneyBlock';
import { UserStatsBlock } from '../../ui-block/user-stats-block/ui/UserStatsBlock';

interface BlockRenderContentProps {
  blockType: DashboardBlockType;
  isEditMode: boolean;
  onRemove: () => void;
}

export function BlockRenderContent({
  blockType,
  isEditMode,
  onRemove,
}: BlockRenderContentProps) {
  const renderBlockComponent = () => {
    switch (blockType) {
      case 'current-title':
        return <CurrentTitleBlock />;
      case 'title-journey':
        return <TitleJourneyBlock />;
      case 'user-stats':
        return <UserStatsBlock />;
      case 'activity-calendar':
        return <ActivityCalendarBlock />;
      case 'events-calendar':
        return <EventsCalendarBlock />;
      case 'ranking':
        return <RankingBlock />;
      case 'goals-sidebar':
        return <GoalsSidebarBlock />;
      case 'goals-timeline':
        return <GoalsTimelineBlock />;
      default:
        return null;
    }
  };

  return (
    <>
      {isEditMode && (
        <>
          {/* ドラッグハンドル（右下のリサイズ領域を除く） */}
          <div className='drag-handle absolute bottom-5 left-0 right-5 top-0 z-10 cursor-move' />

          {/* 削除ボタン */}
          <button
            type='button'
            onClick={onRemove}
            className='absolute -right-2 -top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90'
          >
            <Trash2 className='h-3 w-3' />
          </button>
        </>
      )}
      {renderBlockComponent()}
    </>
  );
}
