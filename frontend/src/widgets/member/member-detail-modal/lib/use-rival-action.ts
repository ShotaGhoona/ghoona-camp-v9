/**
 * ライバル操作 Hook
 * メンバー詳細モーダルでのライバル追加/削除ロジック
 */

'use client';

import { toast } from 'sonner';

import { useRivals } from '@/features/domain/user/get-rivals/lib/use-rivals';
import { useAddRival } from '@/features/domain/user/add-rival/lib/use-add-rival';
import { useDeleteRival } from '@/features/domain/user/delete-rival/lib/use-delete-rival';
import { useAppSelector } from '@/store/hooks';

type UseRivalActionOptions = {
  targetUserId: string;
  targetDisplayName: string | null;
};

export function useRivalAction({
  targetUserId,
  targetDisplayName,
}: UseRivalActionOptions) {
  // 認証状態を取得
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id ?? null;

  // ライバル一覧を取得
  const { data: rivalsData } = useRivals(currentUserId);
  const rivals = rivalsData?.data.rivals ?? [];
  const remainingSlots = rivalsData?.data.remainingSlots ?? 3;

  // 現在表示中のユーザーがライバルかどうか
  const isRival = rivals.some((rival) => rival.rivalUser.id === targetUserId);
  const rivalRelation = rivals.find(
    (rival) => rival.rivalUser.id === targetUserId,
  );

  // ライバル追加/削除 mutations
  const addRival = useAddRival({
    onSuccess: () => {
      toast.success(`${targetDisplayName}をライバルに設定しました`);
    },
    onError: () => {
      toast.error('ライバルの設定に失敗しました');
    },
  });

  const deleteRival = useDeleteRival({
    onSuccess: () => {
      toast.success(`${targetDisplayName}をライバルから解除しました`);
    },
    onError: () => {
      toast.error('ライバルの解除に失敗しました');
    },
  });

  // 自分自身かどうか
  const isSelf = currentUserId === targetUserId;

  // ライバル設定/解除ハンドラー
  const handleRivalAction = () => {
    if (!currentUserId) return;

    if (isRival && rivalRelation) {
      deleteRival.mutate({ userId: currentUserId, rivalId: rivalRelation.id });
    } else {
      addRival.mutate({ userId: currentUserId, rivalUserId: targetUserId });
    }
  };

  // ボタンの無効化状態
  const isDisabled =
    !currentUserId ||
    isSelf ||
    addRival.isPending ||
    deleteRival.isPending ||
    (!isRival && remainingSlots <= 0);

  const isPending = addRival.isPending || deleteRival.isPending;

  return {
    isRival,
    isSelf,
    isDisabled,
    isPending,
    remainingSlots,
    handleRivalAction,
  };
}
