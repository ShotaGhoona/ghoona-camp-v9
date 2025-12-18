'use client';

import type { UserListItem } from '@/entities/domain/user/model/types';
import { GalleryViewWidget } from '@/widgets/view/gallery-view/ui/GalleryViewWidget';

import { MemberCard } from './components/MemberCard';
import { MembersGallerySkeleton } from './skeleton/MembersGallerySkeleton';
import {
  useMembersGallery,
  type MembersFilter,
} from '../lib/use-members-gallery';

interface MembersGalleryViewProps {
  filter: MembersFilter;
  onMemberClick?: (member: UserListItem) => void;
}

export function MembersGalleryView({
  filter,
  onMemberClick,
}: MembersGalleryViewProps) {
  const {
    members,
    total,
    isLoading,
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = useMembersGallery(filter);

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
      totalItems={total}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
