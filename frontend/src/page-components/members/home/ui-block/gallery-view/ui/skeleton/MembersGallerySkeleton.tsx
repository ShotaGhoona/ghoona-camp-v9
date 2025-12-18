'use client';

import { MemberCardSkeleton } from './MemberCardSkeleton';

interface MembersGallerySkeletonProps {
  /** 表示するスケルトンカードの数 */
  count?: number;
  /** グリッドのカラム数 */
  columns?: number;
}

export function MembersGallerySkeleton({
  count = 10,
  columns = 5,
}: MembersGallerySkeletonProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: count }).map((_, index) => (
            <MemberCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
