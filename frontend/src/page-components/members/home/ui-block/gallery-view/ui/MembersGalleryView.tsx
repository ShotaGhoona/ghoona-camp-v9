'use client';

import type { UserListItem } from '@/entities/domain/user/model/types';
import { GalleryViewWidget } from '@/widgets/view/gallery-view/ui/GalleryViewWidget';

import { MemberCard } from './components/MemberCard';
import { MembersGallerySkeleton } from './skeleton/MembersGallerySkeleton';

interface MembersGalleryViewProps {
  members: UserListItem[];
  onMemberClick?: (member: UserListItem) => void;
  isLoading?: boolean;
}

export function MembersGalleryView({
  members,
  onMemberClick,
  isLoading,
}: MembersGalleryViewProps) {
  if (isLoading) {
    return <MembersGallerySkeleton />;
  }

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
