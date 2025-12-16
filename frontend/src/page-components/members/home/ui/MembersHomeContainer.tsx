'use client';

import { Users } from 'lucide-react';

import { dummyMembers } from '@/shared/dummy-data/members/members';
import type { MemberItem } from '@/shared/dummy-data/members/members';

import { MembersGalleryView } from '../ui-block/gallery-view/ui/MembersGalleryView';

export function MembersHomeContainer() {
  const handleMemberClick = (member: MemberItem) => {
    // TODO: 詳細モーダルを開く
    alert(`${member.displayName}の詳細モーダルを開く（未実装）`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">メンバー</h1>
            <p className="text-sm text-muted-foreground">
              {dummyMembers.length}人のメンバーが参加中
            </p>
          </div>
        </div>
      </div>

      {/* ギャラリーコンテンツ */}
      <MembersGalleryView
        members={dummyMembers}
        onMemberClick={handleMemberClick}
      />
    </div>
  );
}
