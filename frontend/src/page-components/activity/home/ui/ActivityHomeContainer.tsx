'use client';

import { useState } from 'react';

import { useAppSelector } from '@/store/hooks';
import { useAttendanceStatistics } from '@/features/domain/attendance/get-statistics/lib/use-attendance-statistics';
import { useMyEvents } from '@/features/domain/event/get-my-events/lib/use-my-events';
import { EventDetailModalSheet } from '@/page-components/events/home/ui-block/event-detail-modal/ui/EventDetailModalSheet';
import type { MyEventItem } from '@/entities/domain/event/model/types';

import { StatsCardsSection } from '../ui-block/stats-cards/ui/StatsCardsSection';
import { ActivityCalendarView } from '../ui-block/calendar-view/ui/ActivityCalendarView';

export function ActivityHomeContainer() {
  // 認証情報からユーザーIDを取得
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id ?? null;

  // 現在表示中の年月
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date().getMonth() + 1,
  );

  // イベント詳細モーダル
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // API: 参加統計
  const { data: statisticsResponse, isLoading: isStatisticsLoading } =
    useAttendanceStatistics(userId);

  // API: 自分のイベント
  const { data: myEventsResponse } = useMyEvents({
    year: currentYear,
    month: currentMonth,
  });

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
  const handleEventClick = (event: MyEventItem) => {
    setSelectedEventId(event.id);
    setIsDetailModalOpen(true);
  };

  // データ取得
  const statistics = statisticsResponse?.data ?? null;
  const myEvents = myEventsResponse?.data.events ?? [];

  return (
    <div className='flex min-h-0 flex-1 overflow-hidden'>
      {/* 左側: 統計サイドバー */}
      <StatsCardsSection
        statistics={statistics}
        isLoading={isStatisticsLoading}
      />

      {/* 右側: カレンダー */}
      <ActivityCalendarView
        year={currentYear}
        month={currentMonth}
        events={myEvents}
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
