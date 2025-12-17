'use client';

import { useMemo, type ReactNode } from 'react';
import { cn } from '@/shared/ui/shadcn/lib/utils';
import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';

interface CalendarViewWidgetProps<T> {
  /** 表示する年 */
  year: number;
  /** 表示する月（1-12） */
  month: number;
  /** 表示するデータ配列 */
  data: T[];
  /** データから日付（YYYY-MM-DD）を取得する関数 */
  dateExtractor: (item: T) => string;
  /** カードをレンダリングする関数 */
  cardRenderer: (item: T, index: number) => ReactNode;
  /** ユニークなキーを取得する関数 */
  keyExtractor: (item: T) => string | number;
  /** データが空の時に表示するコンテンツ */
  emptyContent?: ReactNode;
  /** 追加のクラス名 */
  className?: string;
}

/** 曜日ラベル */
const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

/** 月の日数を取得 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** 月の最初の日の曜日を取得（0=日曜） */
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/** 日付をYYYY-MM-DD形式にフォーマット */
function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function CalendarViewWidget<T>({
  year,
  month,
  data,
  dateExtractor,
  cardRenderer,
  keyExtractor,
  emptyContent,
  className,
}: CalendarViewWidgetProps<T>) {
  // 日付ごとにデータをグループ化
  const dataByDate = useMemo(() => {
    const map = new Map<string, T[]>();
    data.forEach((item) => {
      const date = dateExtractor(item);
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(item);
    });
    return map;
  }, [data, dateExtractor]);

  // カレンダーグリッドを生成
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const grid: (number | null)[][] = [];
    let currentDay = 1;

    // 最大6週間分のグリッドを生成
    for (let week = 0; week < 6; week++) {
      const row: (number | null)[] = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        if (week === 0 && dayOfWeek < firstDay) {
          row.push(null); // 月初の空白
        } else if (currentDay > daysInMonth) {
          row.push(null); // 月末の空白
        } else {
          row.push(currentDay);
          currentDay++;
        }
      }
      grid.push(row);
      // 全ての日を配置したら終了
      if (currentDay > daysInMonth) {
        break;
      }
    }

    return grid;
  }, [year, month]);

  // 今日の日付
  const today = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }, []);

  // データが空の場合
  if (data.length === 0 && emptyContent) {
    return (
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          {emptyContent}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      {/* カレンダーグリッド */}
      <div className="flex min-h-0 flex-1 flex-col p-4">
        {/* 曜日ヘッダー */}
        <div className="mb-2 grid shrink-0 grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label, index) => (
            <div
              key={label}
              className={cn(
                'py-2 text-center text-sm font-medium',
                index === 0 && 'text-red-500',
                index === 6 && 'text-blue-500'
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7">
          {calendarGrid.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const dateString = day ? formatDate(year, month, day) : null;
              const dayData = dateString ? dataByDate.get(dateString) || [] : [];
              const isToday =
                day !== null &&
                year === today.year &&
                month === today.month &&
                day === today.day;
              const isSunday = dayIndex === 0;
              const isSaturday = dayIndex === 6;

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    'flex min-h-0 flex-col overflow-hidden rounded-md border border-transparent p-2',
                    day !== null && 'bg-muted/30',
                    day === null && 'bg-transparent'
                  )}
                >
                  {day !== null && (
                    <div className="flex flex-col h-full shadow-raised-sm rounded-lg">
                      {/* 日付ヘッダー */}
                      <div className="flex shrink-0 items-center justify-between px-2 py-1">
                        <span
                          className={cn(
                            'flex size-6 items-center justify-center rounded-full text-sm',
                            isToday && 'bg-primary font-bold text-primary-foreground',
                            !isToday && isSunday && 'text-red-500',
                            !isToday && isSaturday && 'text-blue-500'
                          )}
                        >
                          {day}
                        </span>
                        {dayData.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {dayData.length}件
                          </span>
                        )}
                      </div>

                      {/* イベントカード */}
                      <ScrollArea className="min-h-0 flex-1">
                        <div className="space-y-1 px-1 pb-1">
                          {dayData.map((item, index) => (
                            <div key={keyExtractor(item)}>
                              {cardRenderer(item, index)}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
