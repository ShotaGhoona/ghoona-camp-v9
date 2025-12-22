'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, User, X } from 'lucide-react';

import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import { Separator } from '@/shared/ui/shadcn/ui/separator';
import { Switch } from '@/shared/ui/shadcn/ui/switch';
import { Label } from '@/shared/ui/shadcn/ui/label';
import { TextField } from '@/shared/ui/form-fields/ui/TextField';
import { TextareaField } from '@/shared/ui/form-fields/ui/TextareaField';
import { DateField } from '@/shared/ui/form-fields/ui/DateField';
import { TimeField } from '@/shared/ui/form-fields/ui/TimeField';
import { SelectField } from '@/shared/ui/form-fields/ui/SelectField';
import { NumberField } from '@/shared/ui/form-fields/ui/NumberField';

import { useEventDetail } from '@/features/domain/event/get-event-detail/lib/use-event-detail';
import { useUpdateEvent } from '@/features/domain/event/update-event/lib/use-update-event';
import type {
  EventType,
  RecurrencePattern,
  EventDetail,
} from '@/entities/domain/event/model/types';
import { ALL_EVENT_TYPES, EVENT_TYPE_LABELS } from '@/shared/domain/event/data/event-master';

export interface EditEventFormData {
  title: string;
  description: string;
  eventType: EventType;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  maxParticipants: number | null;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern | null;
}

interface EditEventContentProps {
  eventId: string | null;
  onClose?: () => void;
}

function getFormDataFromEvent(event: EventDetail): EditEventFormData {
  return {
    title: event.title,
    description: event.description ?? '',
    eventType: event.eventType,
    scheduledDate: event.scheduledDate,
    startTime: event.startTime,
    endTime: event.endTime,
    maxParticipants: event.maxParticipants,
    isRecurring: event.isRecurring,
    recurrencePattern: event.recurrencePattern,
  };
}

const eventTypeOptions = ALL_EVENT_TYPES.map((type) => ({
  value: type,
  label: EVENT_TYPE_LABELS[type],
}));

const recurrenceOptions = [
  { value: 'daily', label: '毎日' },
  { value: 'weekly', label: '毎週' },
  { value: 'monthly', label: '毎月' },
];

export function EditEventContent({ eventId, onClose }: EditEventContentProps) {
  // API: イベント詳細取得
  const { data: eventData, isLoading } = useEventDetail(eventId);
  const event = eventData?.data.event ?? null;

  const [formData, setFormData] = useState<EditEventFormData | null>(null);

  // イベントデータが取得できたらフォームに反映
  useEffect(() => {
    if (event && !formData) {
      setFormData(getFormDataFromEvent(event));
    }
  }, [event, formData]);

  // API: イベント更新
  const updateEvent = useUpdateEvent({
    onSuccess: () => {
      onClose?.();
    },
  });

  const handleTitleChange = (value: string) => {
    setFormData((prev) => (prev ? { ...prev, title: value } : prev));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => (prev ? { ...prev, description: value } : prev));
  };

  const handleEventTypeChange = (value: string) => {
    setFormData((prev) =>
      prev ? { ...prev, eventType: value as EventType } : prev,
    );
  };

  const handleScheduledDateChange = (value: string) => {
    setFormData((prev) => (prev ? { ...prev, scheduledDate: value } : prev));
  };

  const handleStartTimeChange = (value: string) => {
    setFormData((prev) => (prev ? { ...prev, startTime: value } : prev));
  };

  const handleEndTimeChange = (value: string) => {
    setFormData((prev) => (prev ? { ...prev, endTime: value } : prev));
  };

  const handleMaxParticipantsChange = (value: number | '') => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            maxParticipants: value === '' || value === 0 ? null : value,
          }
        : prev,
    );
  };

  const handleIsRecurringChange = (checked: boolean) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            isRecurring: checked,
            recurrencePattern: checked ? 'weekly' : null,
          }
        : prev,
    );
  };

  const handleRecurrencePatternChange = (value: string) => {
    setFormData((prev) =>
      prev ? { ...prev, recurrencePattern: value as RecurrencePattern } : prev,
    );
  };

  const handleSubmit = () => {
    if (!eventId || !formData) return;

    if (!formData.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    if (!formData.scheduledDate) {
      alert('開催日を入力してください');
      return;
    }

    updateEvent.mutate({
      eventId,
      data: {
        title: formData.title,
        description: formData.description || null,
        eventType: formData.eventType,
        scheduledDate: formData.scheduledDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxParticipants: formData.maxParticipants,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.recurrencePattern,
      },
    });
  };

  const handleCancel = () => {
    onClose?.();
  };

  // ローディング中
  if (isLoading || !event || !formData) {
    return (
      <div className='flex min-h-[300px] flex-1 items-center justify-center'>
        <Loader2 className='size-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <ScrollArea className='min-h-0 flex-1'>
        <div className='flex flex-col'>
          {/* ヘッダー部分 */}
          <div className='relative'>
            {/* 背景グラデーション */}
            <div className='h-24 bg-gradient-to-br from-primary via-primary/40 to-primary/5' />

            {/* アバター */}
            <div className='absolute left-1/2 top-12 -translate-x-1/2'>
              <div className='size-24 overflow-hidden rounded-full bg-background shadow-raised'>
                <div className='flex size-full items-center justify-center bg-muted'>
                  {event.creator.avatarUrl ? (
                    <img
                      src={event.creator.avatarUrl}
                      alt={event.creator.displayName ?? ''}
                      className='size-full object-cover'
                    />
                  ) : (
                    <User className='size-10 text-muted-foreground' />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* フォーム */}
          <div className='mt-14 space-y-5 px-6 pb-6'>
            {/* タイトル & 説明 */}
            <div className='text-center'>
              <h2 className='text-xl font-bold'>イベントを編集</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                イベントの内容を更新します
              </p>
            </div>

            {/* フォームフィールド */}
            <div className='space-y-4'>
              {/* タイトル */}
              <TextField
                id='event-title'
                label='イベント名 *'
                value={formData.title}
                onChange={handleTitleChange}
                placeholder='例: 朝の瞑想会'
              />

              {/* イベントタイプ */}
              <SelectField
                id='event-type'
                label='カテゴリ *'
                value={formData.eventType}
                onChange={handleEventTypeChange}
                options={eventTypeOptions}
              />

              {/* 詳細説明 */}
              <TextareaField
                id='event-description'
                label='詳細説明'
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder='イベントの詳細を記入してください...'
                rows={3}
              />

              {/* 日時設定 */}
              <div className='space-y-3'>
                <DateField
                  id='event-scheduled-date'
                  label='開催日 *'
                  value={formData.scheduledDate}
                  onChange={handleScheduledDateChange}
                />
                <div className='grid grid-cols-2 gap-3'>
                  <TimeField
                    id='event-start-time'
                    label='開始時間 *'
                    value={formData.startTime}
                    onChange={handleStartTimeChange}
                  />
                  <TimeField
                    id='event-end-time'
                    label='終了時間 *'
                    value={formData.endTime}
                    onChange={handleEndTimeChange}
                  />
                </div>
              </div>

              {/* 定員 */}
              <NumberField
                id='event-max-participants'
                label='定員（任意）'
                value={formData.maxParticipants ?? 0}
                onChange={handleMaxParticipantsChange}
                placeholder='0で無制限'
              />
            </div>

            <Separator />

            {/* 繰り返し設定 */}
            <div>
              <h3 className='mb-3 text-sm font-semibold text-muted-foreground'>
                繰り返し設定
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between rounded-lg p-3 shadow-raised-sm'>
                  <div className='flex items-center gap-3'>
                    <div>
                      <Label
                        htmlFor='event-recurring'
                        className='text-sm font-medium'
                      >
                        定期開催にする
                      </Label>
                      <p className='text-xs text-muted-foreground'>
                        繰り返しスケジュールを設定します
                      </p>
                    </div>
                  </div>
                  <Switch
                    id='event-recurring'
                    checked={formData.isRecurring}
                    onCheckedChange={handleIsRecurringChange}
                  />
                </div>

                {formData.isRecurring && (
                  <SelectField
                    id='event-recurrence-pattern'
                    label='繰り返しパターン'
                    value={formData.recurrencePattern ?? 'weekly'}
                    onChange={handleRecurrencePatternChange}
                    options={recurrenceOptions}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* アクションボタン */}
      <div className='flex gap-2 border-t bg-background px-6 py-4'>
        {/* キャンセルボタン */}
        <button
          type='button'
          onClick={handleCancel}
          disabled={updateEvent.isPending}
          className='flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-raised-sm transition-all hover:bg-muted disabled:opacity-50'
        >
          <X className='size-4' />
        </button>

        {/* 更新ボタン */}
        <button
          type='button'
          onClick={handleSubmit}
          disabled={updateEvent.isPending}
          className='flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-raised-sm transition-all hover:bg-primary/90 disabled:opacity-50'
        >
          <Save className='size-4' />
          {updateEvent.isPending ? '更新中...' : '更新する'}
        </button>
      </div>
    </div>
  );
}
