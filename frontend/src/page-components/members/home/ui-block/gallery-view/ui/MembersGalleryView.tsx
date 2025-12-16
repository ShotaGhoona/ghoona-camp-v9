'use client';

import type { MemberItem } from '@/shared/dummy-data/members/members';
import { GalleryViewWidget } from '@/widgets/view/gallery-view/ui/GalleryViewWidget';

import { MemberCard } from './components/MemberCard';

interface MembersGalleryViewProps {
  members: MemberItem[];
  onMemberClick?: (member: MemberItem) => void;
}

export function MembersGalleryView({
  members,
  onMemberClick,
}: MembersGalleryViewProps) {
  return (
    <GalleryViewWidget
      data={members}
      keyExtractor={(member) => member.id}
      cardRenderer={(member) => (
        <MemberCard member={member} onClick={onMemberClick} />
      )}
    />
  );
}
