'use client';

import { useState } from 'react';
import { CalendarDays, Save, X } from 'lucide-react';

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

import {
  ALL_EVENT_TYPES,
  EVENT_TYPE_LABELS,
  type EventType,
} from '@/shared/dummy-data/events/events';

export interface CreateEventFormData {
  title: string;
  description: string;
  eventType: EventType;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  maxParticipants: number | null;
  isRecurring: boolean;
  recurrencePattern: string | null;
}

interface CreateEventContentProps {
  onClose?: () => void;
}

function getDefaultFormData(): CreateEventFormData {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  return {
    title: '',
    description: '',
    eventType: 'general',
    scheduledDate: todayStr,
    startTime: '06:00',
    endTime: '07:00',
    maxParticipants: null,
    isRecurring: false,
    recurrencePattern: null,
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

export function CreateEventContent({ onClose }: CreateEventContentProps) {
  const [formData, setFormData] =
    useState<CreateEventFormData>(getDefaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, title: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleEventTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, eventType: value as EventType }));
  };

  const handleScheduledDateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, scheduledDate: value }));
  };

  const handleStartTimeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, startTime: value }));
  };

  const handleEndTimeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, endTime: value }));
  };

  const handleMaxParticipantsChange = (value: number | '') => {
    setFormData((prev) => ({
      ...prev,
      maxParticipants: value === '' || value === 0 ? null : value,
    }));
  };

  const handleIsRecurringChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isRecurring: checked,
      recurrencePattern: checked ? 'weekly' : null,
    }));
  };

  const handleRecurrencePatternChange = (value: string) => {
    setFormData((prev) => ({ ...prev, recurrencePattern: value }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    if (!formData.scheduledDate) {
      alert('開催日を入力してください');
      return;
    }

    setIsSubmitting(true);
    // TODO: API呼び出し
    alert(`イベント「${formData.title}」を作成しました（未実装）`);
    setIsSubmitting(false);
    onClose?.();
  };

  const handleCancel = () => {
    onClose?.();
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <ScrollArea className='min-h-0 flex-1'>
        <div className='flex flex-col'>
          {/* ヘッダー部分 */}
          <div className='relative'>
            {/* 背景グラデーション */}
            <div className='h-24 bg-gradient-to-br from-primary via-primary/40 to-primary/5' />

            {/* アイコン */}
            <div className='absolute left-1/2 top-12 -translate-x-1/2'>
              <div className='size-24 overflow-hidden rounded-full bg-background shadow-raised'>
                <div className='flex size-full items-center justify-center bg-muted'>
                  <CalendarDays className='size-10 text-muted-foreground' />
                </div>
              </div>
            </div>
          </div>

          {/* フォーム */}
          <div className='mt-14 space-y-5 px-6 pb-6'>
            {/* タイトル & 説明 */}
            <div className='text-center'>
              <h2 className='text-xl font-bold'>新しいイベントを作成</h2>
              <p className='mt-1 text-sm text-muted-foreground'>
                みんなで参加できるイベントを企画しましょう
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
          disabled={isSubmitting}
          className='flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-raised-sm transition-all hover:bg-muted disabled:opacity-50'
        >
          <X className='size-4' />
        </button>

        {/* 作成ボタン */}
        <button
          type='button'
          onClick={handleSubmit}
          disabled={isSubmitting}
          className='flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-raised-sm transition-all hover:bg-primary/90 disabled:opacity-50'
        >
          <Save className='size-4' />
          {isSubmitting ? '作成中...' : '作成する'}
        </button>
      </div>
    </div>
  );
}
