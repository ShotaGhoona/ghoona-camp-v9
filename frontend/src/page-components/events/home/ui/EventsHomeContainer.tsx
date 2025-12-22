'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/ui/button';
import { useAppSelector } from '@/store/hooks';
import { MemberDetailModalSheet } from '@/widgets/member/member-detail-modal/ui/MemberDetailModalSheet';

import { useEvents } from '@/features/domain/event/get-events/lib/use-events';
import type { EventListItem } from '@/entities/domain/event/model/types';

import { EventsGalleryView } from '../ui-block/gallery-view/ui/EventsGalleryView';
import { EventsCalendarView } from '../ui-block/calendar-view/ui/EventsCalendarView';
import { EventsFilterSidebar } from '../ui-block/filter-sidebar/ui/EventsFilterSidebar';
import { FilterToggleButton } from '../ui-block/filter-sidebar/ui/FilterToggleButton';
import { EventDetailModalSheet } from '../ui-block/event-detail-modal/ui/EventDetailModalSheet';
import { CreateEventModalSheet } from '../ui-block/create-event/ui/CreateEventModalSheet';
import { EditEventModalSheet } from '../ui-block/edit-event/ui/EditEventModalSheet';
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
  // 認証状態
  const { user } = useAppSelector((state) => state.auth);
  const currentUserId = user?.id ?? null;

  // ビュー切り替え
  const [viewType, setViewType] = useState<ViewType>('gallery');

  // 現在表示中の年月
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear(),
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

  // イベント作成モーダル
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // イベント編集モーダル
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // メンバー詳細モーダル
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // API: イベント一覧取得
  const { data: eventsData, isLoading } = useEvents({
    year: currentYear,
    month: currentMonth,
    eventTypes:
      filter.selectedEventTypes.length > 0
        ? filter.selectedEventTypes
        : undefined,
    participated: filter.participationStatus ?? undefined,
  });

  const events = eventsData?.data.events ?? [];

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
  const handleEventClick = (event: EventListItem) => {
    setSelectedEventId(event.id);
    setIsDetailModalOpen(true);
  };

  // 編集ボタンクリック（詳細モーダルから）
  const handleEdit = (eventId: string) => {
    setEditEventId(eventId);
    setIsEditModalOpen(true);
  };

  // メンバークリック（イベント詳細から）
  const handleMemberClick = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsMemberModalOpen(true);
  };

  // 新規作成ボタンクリック
  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const activeFilterCount = getActiveFilterCount(filter);

  return (
    <div className='flex min-h-0 flex-1 overflow-hidden'>
      {/* メインコンテンツ */}
      <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
        {/* ヘッダー */}
        <div className='flex items-center justify-between px-6 py-4'>
          <div className='flex items-center gap-3'></div>

          {/* 月ナビゲーション & ビュー切り替え & フィルター & 作成ボタン */}
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

            {/* 新規作成ボタン */}
            <Button
              onClick={handleCreateClick}
              variant='raised'
              size='lg'
              className='gap-2'
            >
              <Plus className='size-4' />
              新規作成
            </Button>
          </div>
        </div>

        {/* ビューコンテンツ */}
        {viewType === 'gallery' ? (
          <EventsGalleryView
            events={events}
            isLoading={isLoading}
            onEventClick={handleEventClick}
          />
        ) : (
          <EventsCalendarView
            year={currentYear}
            month={currentMonth}
            events={events}
            isLoading={isLoading}
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
        onEdit={handleEdit}
      />

      {/* イベント作成モーダル */}
      <CreateEventModalSheet
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {/* イベント編集モーダル */}
      <EditEventModalSheet
        eventId={editEventId}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
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
