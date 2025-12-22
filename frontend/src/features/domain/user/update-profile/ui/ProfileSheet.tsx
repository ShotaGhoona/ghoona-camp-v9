/**
 * プロフィール設定 Sheet
 */

'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { useAppSelector } from '@/store/hooks';
import { useUserDetail } from '@/features/domain/user/get-user-detail/lib/use-user-detail';
import { useUpdateProfile } from '../lib/use-update-profile';
import type { UpdateUserProfileRequest } from '@/entities/domain/user/model/types';
import { Sheet, SheetContent } from '@/shared/ui/shadcn/ui/sheet';
import { Button } from '@/shared/ui/shadcn/ui/button';
import { Skeleton } from '@/shared/ui/shadcn/ui/skeleton';
import { AvatarField } from '@/shared/ui/form-fields/ui/AvatarField';
import { TextField } from '@/shared/ui/form-fields/ui/TextField';
import { TextareaField } from '@/shared/ui/form-fields/ui/TextareaField';
import { TagsField } from '@/shared/ui/form-fields/ui/TagsField';
import {
  SocialLinksField,
  type SocialLinkItem,
} from '@/shared/ui/form-fields/ui/SocialLinksField';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormData = {
  avatarUrl: string | null;
  displayName: string;
  tagline: string;
  bio: string;
  skills: string[];
  interests: string[];
  socialLinks: SocialLinkItem[];
};

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useUserDetail(user?.id ?? null);
  const updateMutation = useUpdateProfile({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  const [formData, setFormData] = useState<FormData>({
    avatarUrl: null,
    displayName: '',
    tagline: '',
    bio: '',
    skills: [],
    interests: [],
    socialLinks: [],
  });

  // ユーザーデータをフォームに反映
  useEffect(() => {
    if (data?.data.user) {
      const u = data.data.user;
      setFormData({
        avatarUrl: u.avatarUrl ?? null,
        displayName: u.displayName ?? '',
        tagline: u.tagline ?? '',
        bio: u.bio ?? '',
        skills: u.skills ?? [],
        interests: u.interests ?? [],
        socialLinks:
          u.socialLinks?.map((link) => ({
            platform: link.platform,
            url: link.url,
            title: link.title,
          })) ?? [],
      });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const updateData: UpdateUserProfileRequest = {
      avatarUrl: formData.avatarUrl,
      displayName: formData.displayName || undefined,
      tagline: formData.tagline || null,
      bio: formData.bio || null,
      skills: formData.skills,
      interests: formData.interests,
      socialLinks: formData.socialLinks,
    };

    updateMutation.mutate({ userId: user.id, data: updateData });
  };

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-full flex-col p-0 sm:max-w-lg'
      >
        {isLoading ? (
          <div className='space-y-6 px-4 py-6'>
            <Skeleton className='h-24 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className='flex flex-1 flex-col overflow-hidden'
          >
            {/* スクロール可能なフォーム領域 */}
            <div className='flex-1 overflow-y-auto'>
              {/* アバター（padding無し） */}
              <AvatarField
                id='avatarUrl'
                value={formData.avatarUrl}
                onChange={(v) => updateField('avatarUrl', v)}
              />

              {/* 他のフィールド（padding有り） */}
              <div className='space-y-6 px-4 pb-6'>

              {/* 表示名 */}
              <TextField
                id='displayName'
                label='表示名'
                value={formData.displayName}
                onChange={(v) => updateField('displayName', v)}
                placeholder='表示名を入力'
                maxLength={100}
              />

              {/* キャッチコピー */}
              <TextField
                id='tagline'
                label='キャッチコピー'
                value={formData.tagline}
                onChange={(v) => updateField('tagline', v)}
                placeholder='一言で自分を表現'
                maxLength={150}
              />

              {/* 自己紹介 */}
              <TextareaField
                id='bio'
                label='自己紹介'
                value={formData.bio}
                onChange={(v) => updateField('bio', v)}
                placeholder='自己紹介を入力'
                maxLength={1000}
                rows={4}
              />

              {/* スキル */}
              <TagsField
                id='skills'
                label='スキル'
                value={formData.skills}
                onChange={(v) => updateField('skills', v)}
                placeholder='スキルを入力'
                maxItems={20}
                maxLength={50}
              />

              {/* 興味・関心 */}
              <TagsField
                id='interests'
                label='興味・関心'
                value={formData.interests}
                onChange={(v) => updateField('interests', v)}
                placeholder='興味・関心を入力'
                maxItems={20}
                maxLength={50}
              />

              {/* SNSリンク */}
                <SocialLinksField
                  id='socialLinks'
                  label='SNSリンク'
                  value={formData.socialLinks}
                  onChange={(v) => updateField('socialLinks', v)}
                  maxItems={10}
                />
              </div>
            </div>

            {/* 固定フッター */}
            <div className='flex shrink-0 justify-between border-t bg-background px-4 py-4 gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='rounded-lg shadow-raised-sm transition-shadow hover:shadow-inset-sm'
              >
                キャンセル
              </Button>
              <Button
                type='submit'
                disabled={updateMutation.isPending}
                className='rounded-lg shadow-raised-sm transition-shadow hover:shadow-inset-sm flex-1'
              >
                {updateMutation.isPending && (
                  <Loader2 className='mr-2 size-4 animate-spin' />
                )}
                保存
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
