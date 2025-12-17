'use client';

import { useState, useMemo } from 'react';

import { dummyUserStatistics } from '@/shared/dummy-data/activity/activity';
import { dummyEvents } from '@/shared/dummy-data/events/events';
import type { EventItem } from '@/shared/dummy-data/events/events';
import { EventDetailModalSheet } from '@/widgets/event/event-detail-modal/ui/EventDetailModalSheet';

import { StatsCardsSection } from '../ui-block/stats-cards/ui/StatsCardsSection';
import { ActivityCalendarView } from '../ui-block/calendar-view/ui/ActivityCalendarView';

/** ログインユーザーID（TODO: 実際の認証から取得） */
const CURRENT_USER_ID = '1';

export function ActivityHomeContainer() {
  // 現在表示中の年月
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date().getMonth() + 1,
  );

  // イベント詳細モーダル
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 月の移動
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // イベントクリック
  const handleEventClick = (event: EventItem) => {
    setSelectedEventId(event.id);
    setIsDetailModalOpen(true);
  };

  // 今後消す==========================================
  // 自分が参加したイベントをフィルタリング
  const participatedEvents = useMemo(() => {
    return dummyEvents.filter((event) => {
      // 月フィルター
      const eventDate = new Date(event.scheduledDate);
      if (
        eventDate.getFullYear() !== currentYear ||
        eventDate.getMonth() + 1 !== currentMonth
      ) {
        return false;
      }

      // 自分が参加しているかチェック
      const isParticipating = event.participants.some(
        (p) => p.userId === CURRENT_USER_ID && p.status === 'registered',
      );

      return isParticipating;
    });
  }, [currentYear, currentMonth]);
  // =================================================

  return (
    <div className='flex min-h-0 flex-1 overflow-hidden'>
      {/* 左側: 統計サイドバー */}
      <StatsCardsSection statistics={dummyUserStatistics} />

      {/* 右側: カレンダー */}
      <ActivityCalendarView
        year={currentYear}
        month={currentMonth}
        events={participatedEvents}
        onEventClick={handleEventClick}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* イベント詳細モーダル */}
      <EventDetailModalSheet
        eventId={selectedEventId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        defaultViewMode='modal'
      />
    </div>
  );
}
