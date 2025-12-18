'use client';

import { useMemo, type ReactNode } from 'react';
import { cn } from '@/shared/ui/shadcn/lib/utils';
import { ScrollArea, ScrollBar } from '@/shared/ui/shadcn/ui/scroll-area';

interface TimelineViewWidgetProps<T> {
  /** 表示する年 */
  year: number;
  /** 表示する月（1-12） */
  month: number;
  /** 表示するデータ配列 */
  data: T[];
  /** データから開始日（YYYY-MM-DD）を取得する関数 */
  startDateExtractor: (item: T) => string;
  /** データから終了日（YYYY-MM-DD）を取得する関数。nullの場合は無期限 */
  endDateExtractor: (item: T) => string | null;
  /** 左側のラベルをレンダリングする関数 */
  labelRenderer: (item: T) => ReactNode;
  /** バーをレンダリングする関数（オプション、デフォルトのバーを使用） */
  barRenderer?: (item: T, barProps: TimelineBarProps) => ReactNode;
  /** アイテムクリック時のコールバック */
  onItemClick?: (item: T) => void;
  /** ユニークなキーを取得する関数 */
  keyExtractor: (item: T) => string | number;
  /** データが空の時に表示するコンテンツ */
  emptyContent?: ReactNode;
  /** 追加のクラス名 */
  className?: string;
  /** 行の高さ（px） */
  rowHeight?: number;
  /** 日付セルの幅（px） */
  cellWidth?: number;
}

export interface TimelineBarProps {
  /** バーの左位置（px） */
  left: number;
  /** バーの幅（px） */
  width: number;
  /** 開始日が表示範囲外か */
  startsBeforeRange: boolean;
  /** 終了日が表示範囲外か（または無期限） */
  endsAfterRange: boolean;
}

/** 月の日数を取得 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** 日付文字列をDateに変換 */
function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/** 今日の日付を取得（時刻なし） */
function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function TimelineViewWidget<T>({
  year,
  month,
  data,
  startDateExtractor,
  endDateExtractor,
  labelRenderer,
  barRenderer,
  onItemClick,
  keyExtractor,
  emptyContent,
  className,
  rowHeight = 64,
  cellWidth = 40,
}: TimelineViewWidgetProps<T>) {
  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 月の範囲
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month - 1, daysInMonth);

  // 今日の日付
  const today = useMemo(() => getToday(), []);
  const todayInMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month
      ? today.getDate()
      : null;

  // この月に表示するデータをフィルタリング
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const start = parseDate(startDateExtractor(item));
      const endStr = endDateExtractor(item);
      const end = endStr ? parseDate(endStr) : null;

      // 開始日が月末より後なら除外
      if (start > monthEnd) return false;
      // 終了日が月初より前なら除外
      if (end && end < monthStart) return false;

      return true;
    });
  }, [data, startDateExtractor, endDateExtractor, monthStart, monthEnd]);

  // バーの位置を計算
  const calculateBarProps = (item: T): TimelineBarProps => {
    const start = parseDate(startDateExtractor(item));
    const endStr = endDateExtractor(item);
    const end = endStr ? parseDate(endStr) : null;

    // 表示範囲内での開始位置
    const startsBeforeRange = start < monthStart;
    const effectiveStart = startsBeforeRange ? 1 : start.getDate();

    // 表示範囲内での終了位置
    const endsAfterRange = !end || end > monthEnd;
    const effectiveEnd = endsAfterRange ? daysInMonth : end!.getDate();

    // 位置とサイズを計算
    const left = (effectiveStart - 1) * cellWidth;
    const width = (effectiveEnd - effectiveStart + 1) * cellWidth;

    return {
      left,
      width,
      startsBeforeRange,
      endsAfterRange,
    };
  };

  // データが空の場合
  if (filteredData.length === 0 && emptyContent) {
    return (
      <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
        <div className='flex min-h-0 flex-1 items-center justify-center'>
          {emptyContent}
        </div>
      </div>
    );
  }

  const labelWidth = 240;
  const totalWidth = labelWidth + daysInMonth * cellWidth;

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <ScrollArea className='min-h-0 flex-1'>
        <div style={{ minWidth: totalWidth }}>
          {/* ヘッダー（日付） */}
          <div className='sticky top-0 z-10 flex' style={{ height: 48 }}>
            {/* ラベル列ヘッダー */}
            <div
              className='sticky left-0 z-20 flex shrink-0 items-center bg-background px-4'
              style={{ width: labelWidth }}
            >
              <span className='text-sm font-bold text-foreground'>
                {year}年{month}月
              </span>
            </div>

            {/* 日付セル */}
            <div className='flex'>
              {days.map((day) => {
                const date = new Date(year, month - 1, day);
                const dayOfWeek = date.getDay();
                const isSunday = dayOfWeek === 0;
                const isSaturday = dayOfWeek === 6;
                const isToday = day === todayInMonth;

                return (
                  <div
                    key={day}
                    className={cn(
                      'flex shrink-0 flex-col items-center justify-center text-xs font-medium',
                      isToday && 'relative',
                    )}
                    style={{ width: cellWidth }}
                  >
                    {isToday ? (
                      <span className='flex size-7 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground shadow-raised-sm'>
                        {day}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'text-muted-foreground',
                          isSunday && 'text-red-500',
                          isSaturday && 'text-blue-500',
                        )}
                      >
                        {day}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* データ行 */}
          {filteredData.map((item, index) => {
            const barProps = calculateBarProps(item);

            return (
              <div
                key={keyExtractor(item)}
                className={cn(
                  'flex transition-colors',
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                )}
                style={{ height: rowHeight }}
              >
                {/* ラベル列 */}
                <div
                  className='sticky left-0 z-10 flex shrink-0 items-center bg-inherit px-4'
                  style={{ width: labelWidth }}
                >
                  {labelRenderer(item)}
                </div>

                {/* タイムライン領域 */}
                <div
                  className='relative flex-1'
                  style={{ width: daysInMonth * cellWidth }}
                >
                  {/* 今日の列ハイライト */}
                  {todayInMonth && (
                    <div
                      className='absolute top-0 h-full bg-primary/5'
                      style={{
                        left: (todayInMonth - 1) * cellWidth,
                        width: cellWidth,
                      }}
                    />
                  )}

                  {/* バー */}
                  <div
                    className='absolute top-1/2 -translate-y-1/2 cursor-pointer'
                    style={{
                      left: barProps.left + 4,
                      width: barProps.width - 8,
                    }}
                    onClick={() => onItemClick?.(item)}
                  >
                    {barRenderer ? (
                      barRenderer(item, barProps)
                    ) : (
                      <DefaultBar barProps={barProps} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation='horizontal' />
        <ScrollBar orientation='vertical' />
      </ScrollArea>
    </div>
  );
}

/** デフォルトのバーコンポーネント */
function DefaultBar({ barProps }: { barProps: TimelineBarProps }) {
  return (
    <div
      className={cn(
        'h-8 bg-primary shadow-raised-sm transition-all hover:shadow-raised',
        barProps.startsBeforeRange ? 'rounded-l' : 'rounded-l-full',
        barProps.endsAfterRange ? 'rounded-r' : 'rounded-r-full',
      )}
    />
  );
}
