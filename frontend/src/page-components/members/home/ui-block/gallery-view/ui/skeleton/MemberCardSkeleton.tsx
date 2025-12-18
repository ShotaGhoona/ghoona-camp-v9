'use client';

import { Card } from '@/shared/ui/shadcn/ui/card';
import { Skeleton } from '@/shared/ui/shadcn/ui/skeleton';

export function MemberCardSkeleton() {
  return (
    <Card variant="raised" className="gap-0 overflow-hidden py-5">
      <div className="flex flex-col items-center gap-3 px-4">
        {/* アバター */}
        <Skeleton className="size-20 rounded-full" />

        {/* 名前・tagline */}
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* 称号バッジ */}
      <div className="flex justify-center px-4 pt-2">
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </Card>
  );
}
