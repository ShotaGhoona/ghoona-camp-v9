'use client';

import { Skeleton } from '@/shared/ui/shadcn/ui/skeleton';
import { Separator } from '@/shared/ui/shadcn/ui/separator';
import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';

export function MemberDetailSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {/* ヘッダー部分 */}
          <div className="relative">
            {/* 背景グラデーション */}
            <div className="h-24 bg-gradient-to-br from-primary via-primary/40 to-primary/5" />

            {/* アバター */}
            <div className="absolute left-1/2 top-12 -translate-x-1/2">
              <Skeleton className="size-24 rounded-full" />
            </div>
          </div>

          {/* プロフィール情報 */}
          <div className="mt-14 space-y-5 px-6 pb-6">
            {/* 名前 & タグライン */}
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>

            {/* 称号 */}
            <div className="flex justify-center">
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-3 gap-3 rounded-xl p-4 shadow-raised-sm">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>

            {/* 自己紹介 */}
            <div>
              <Skeleton className="mb-2 h-4 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-3/4" />
            </div>

            {/* ビジョン */}
            <div>
              <Skeleton className="mb-2 h-4 w-16" />
              <div className="rounded-lg bg-primary/5 px-4 py-3">
                <Skeleton className="mx-auto h-5 w-48" />
              </div>
            </div>

            <Separator />

            {/* スキル */}
            <div>
              <Skeleton className="mb-2 h-4 w-12" />
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-5 w-16 rounded-full" />
                ))}
              </div>
            </div>

            {/* 興味・関心 */}
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-5 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* ライバル設定ボタン */}
      <div className="border-t bg-background px-6 py-4">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  );
}
