'use client';

import { useState } from 'react';
import { Eye, EyeOff, Globe, Lock, Save, User, X } from 'lucide-react';

import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import { Separator } from '@/shared/ui/shadcn/ui/separator';
import { Switch } from '@/shared/ui/shadcn/ui/switch';
import { Label } from '@/shared/ui/shadcn/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn/ui/tooltip';
import { TextField } from '@/shared/ui/form-fields/ui/TextField';
import { TextareaField } from '@/shared/ui/form-fields/ui/TextareaField';
import { DateField } from '@/shared/ui/form-fields/ui/DateField';

import { CURRENT_USER_ID } from '@/shared/dummy-data/goals/goals';
import { dummyMembers } from '@/shared/dummy-data/members/members';

export interface CreateGoalFormData {
  title: string;
  description: string;
  startedAt: string;
  endedAt: string;
  isPublic: boolean;
}

interface CreateGoalContentProps {
  onSave: (data: CreateGoalFormData) => void;
  onCancel: () => void;
  isCompareMode?: boolean;
  onToggleCompareMode?: () => void;
}

function getDefaultFormData(): CreateGoalFormData {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  return {
    title: '',
    description: '',
    startedAt: todayStr,
    endedAt: '',
    isPublic: false,
  };
}

export function CreateGoalContent({
  onSave,
  onCancel,
  isCompareMode = false,
  onToggleCompareMode,
}: CreateGoalContentProps) {
  const [formData, setFormData] = useState<CreateGoalFormData>(getDefaultFormData);

  // 現在のユーザー情報を取得
  const currentUser = dummyMembers.find((m) => m.id === CURRENT_USER_ID);

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, title: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleStartedAtChange = (value: string) => {
    setFormData((prev) => ({ ...prev, startedAt: value }));
  };

  const handleEndedAtChange = (value: string) => {
    setFormData((prev) => ({ ...prev, endedAt: value }));
  };

  const handlePublicChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPublic: checked }));
  };

  const handleClearEndDate = () => {
    setFormData((prev) => ({ ...prev, endedAt: '' }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {/* ヘッダー部分 */}
          <div className="relative">
            {/* 背景グラデーション */}
            <div className="h-24 bg-gradient-to-br from-primary via-primary/40 to-primary/5" />

            {/* 自分のアバター */}
            <div className="absolute left-1/2 top-12 -translate-x-1/2">
              <div className="size-24 overflow-hidden rounded-full bg-background shadow-raised">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.displayName}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted">
                    <User className="size-10 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* フォーム */}
          <div className="mt-14 space-y-5 px-6 pb-6">
            {/* タイトル & 説明 */}
            <div className="text-center">
              <h2 className="text-xl font-bold">新しい目標を作成</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                朝活で達成したい目標を設定しましょう
              </p>
            </div>

            {/* フォームフィールド */}
            <div className="space-y-4">
              {/* タイトル */}
              <TextField
                id="goal-title"
                label="目標タイトル *"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="例: TypeScriptをマスターする"
              />

              {/* 詳細説明 */}
              <TextareaField
                id="goal-description"
                label="詳細説明"
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="目標の詳細や達成条件を記入してください..."
                rows={3}
              />

              {/* 期間設定 */}
              <div className="grid grid-cols-2 gap-3">
                <DateField
                  id="goal-started-at"
                  label="開始日 *"
                  value={formData.startedAt}
                  onChange={handleStartedAtChange}
                />
                <div className="space-y-1">
                  <DateField
                    id="goal-ended-at"
                    label="終了日（任意）"
                    value={formData.endedAt}
                    onChange={handleEndedAtChange}
                    placeholder="終了日を設定"
                  />
                  {formData.endedAt && (
                    <button
                      type="button"
                      onClick={handleClearEndDate}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      クリア
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* 公開設定 */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                公開設定
              </h3>
              <div className="flex items-center justify-between rounded-lg p-3 shadow-raised-sm">
                <div className="flex items-center gap-3">
                  {formData.isPublic ? (
                    <Globe className="size-5 text-primary" />
                  ) : (
                    <Lock className="size-5 text-muted-foreground" />
                  )}
                  <div>
                    <Label htmlFor="goal-public" className="text-sm font-medium">
                      {formData.isPublic ? '公開' : '非公開'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.isPublic
                        ? '他のメンバーがこの目標を閲覧できます'
                        : 'この目標はあなただけが閲覧できます'}
                    </p>
                  </div>
                </div>
                <Switch
                  id="goal-public"
                  checked={formData.isPublic}
                  onCheckedChange={handlePublicChange}
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* アクションボタン */}
      <div className="flex gap-2 border-t bg-background px-6 py-4">
        {/* 比較モード切替ボタン */}
        {onToggleCompareMode && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onToggleCompareMode}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-raised-sm transition-all hover:bg-muted ${
                  isCompareMode ? 'border-primary bg-primary/10 text-primary' : ''
                }`}
              >
                {isCompareMode ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {isCompareMode ? 'みんなの目標を閉じる' : 'みんなの目標を見ながら作成'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* キャンセルボタン */}
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-raised-sm transition-all hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        {/* 作成ボタン */}
        <button
          type="button"
          onClick={handleSubmit}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-raised-sm transition-all hover:bg-primary/90"
        >
          <Save className="size-4" />
          作成する
        </button>
      </div>
    </div>
  );
}
