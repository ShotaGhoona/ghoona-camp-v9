'use client';

import { useState, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/ui/button';
import { dummyEvents } from '@/shared/dummy-data/events/events';
import type { EventItem } from '@/shared/dummy-data/events/events';
import { EventDetailModalSheet } from '@/widgets/event/event-detail-modal/ui/EventDetailModalSheet';
import { MemberDetailModalSheet } from '@/widgets/member/member-detail-modal/ui/MemberDetailModalSheet';

import { EventsGalleryView } from '../ui-block/gallery-view/ui/EventsGalleryView';
import { EventsCalendarView } from '../ui-block/calendar-view/ui/EventsCalendarView';
import { EventsFilterSidebar } from '../ui-block/filter-sidebar/ui/EventsFilterSidebar';
import { FilterToggleButton } from '../ui-block/filter-sidebar/ui/FilterToggleButton';
import type { EventsFilterState } from '../ui-block/filter-sidebar/model/types';
import {
  initialFilterState,
  getActiveFilterCount,
} from '../ui-block/filter-sidebar/model/types';
import { ViewChangeSwitch, type ViewType } from './components/ViewChangeSwitch';

/** 月名を取得 */
function getMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}

export function EventsHomeContainer() {
  // ビュー切り替え
  const [viewType, setViewType] = useState<ViewType>('gallery');

  // 現在表示中の年月
  const [currentYear, setCurrentYear] = useState(
    () => new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date().getMonth() + 1,
  );

  // フィルター
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState<EventsFilterState>(initialFilterState);

  // イベント詳細モーダル
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // メンバー詳細モーダル
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

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

  // メンバークリック（イベント詳細から）
  const handleMemberClick = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsMemberModalOpen(true);
  };

  // 今後消す==========================================
  // フィルタリング
  const filteredEvents = useMemo(() => {
    return dummyEvents.filter((event) => {
      // 月フィルター
      const eventDate = new Date(event.scheduledDate);
      if (
        eventDate.getFullYear() !== currentYear ||
        eventDate.getMonth() + 1 !== currentMonth
      ) {
        return false;
      }

      // イベントタイプフィルター
      if (filter.selectedEventTypes.length > 0) {
        if (!filter.selectedEventTypes.includes(event.eventType)) {
          return false;
        }
      }

      // 参加状態フィルター
      if (filter.participationStatus !== null) {
        // TODO: 実際にはログインユーザーIDで判定
        const isParticipating = event.participants.some(
          (p) => p.userId === 'user-001' && p.status === 'registered',
        );
        if (filter.participationStatus !== isParticipating) {
          return false;
        }
      }

      return true;
    });
  }, [currentYear, currentMonth, filter]);
  // =================================================

  const activeFilterCount = getActiveFilterCount(filter);

  return (
    <div className='flex min-h-0 flex-1 overflow-hidden'>
      {/* メインコンテンツ */}
      <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
        {/* ヘッダー */}
        <div className='flex items-center justify-between px-6 py-4 shadow-raised'>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-lg bg-primary/10'>
              <CalendarDays className='size-5 text-primary' />
            </div>
            <div>
              <h1 className='text-xl font-bold'>イベント</h1>
              <p className='text-sm text-muted-foreground'>
                {filteredEvents.length}件のイベント
                {activeFilterCount > 0 && ' (フィルター適用中)'}
              </p>
            </div>
          </div>

          {/* 月ナビゲーション & ビュー切り替え & フィルター */}
          <div className='flex items-center gap-4'>
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
                {getMonthLabel(currentYear, currentMonth)}
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

            {/* ビュー切り替え */}
            <ViewChangeSwitch value={viewType} onChange={setViewType} />

            {/* フィルタートグル */}
            <FilterToggleButton
              isOpen={isFilterOpen}
              activeCount={activeFilterCount}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            />
          </div>
        </div>

        {/* ビューコンテンツ */}
        {viewType === 'gallery' ? (
          <EventsGalleryView
            events={filteredEvents}
            onEventClick={handleEventClick}
          />
        ) : (
          <EventsCalendarView
            year={currentYear}
            month={currentMonth}
            events={filteredEvents}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {/* フィルターサイドバー */}
      <EventsFilterSidebar
        isOpen={isFilterOpen}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* イベント詳細モーダル */}
      <EventDetailModalSheet
        eventId={selectedEventId}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        defaultViewMode='modal'
        onMemberClick={handleMemberClick}
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
