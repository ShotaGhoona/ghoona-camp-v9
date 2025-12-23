'use client';

import { useRef, useState } from 'react';
import { Camera, User, Loader2 } from 'lucide-react';

import { cn } from '@/shared/ui/shadcn/lib/utils';
import { uploadImageToS3 } from '@/shared/lib/upload/upload-to-s3';

export interface AvatarFieldProps {
  id: string;
  value: string | null;
  onChange: (value: string | null) => void;
  fallback?: string;
  disabled?: boolean;
  className?: string;
}

export function AvatarField({
  id,
  value,
  onChange,
  disabled,
  className,
}: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const publicUrl = await uploadImageToS3(file);
      onChange(publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      // TODO: エラーハンドリング（toast表示など）
    } finally {
      setIsUploading(false);
      // input をリセットして同じファイルを再選択可能にする
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* グラデーション背景 */}
      <div className='h-24 rounded-t-lg bg-gradient-to-br from-primary via-primary/40 to-primary/5' />

      {/* アバター - 中央配置 */}
      <div className='absolute left-1/2 top-12 -translate-x-1/2'>
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          className='group relative size-24 overflow-hidden rounded-full bg-background shadow-raised disabled:cursor-not-allowed'
        >
          {value ? (
            <img
              src={value}
              alt='プロフィール画像'
              className='size-full object-cover'
            />
          ) : (
            <div className='flex size-full items-center justify-center bg-muted'>
              <User className='size-10 text-muted-foreground' />
            </div>
          )}
          {/* ホバーオーバーレイ */}
          <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
            {isUploading ? (
              <Loader2 className='size-6 animate-spin text-white' />
            ) : (
              <Camera className='size-6 text-white' />
            )}
          </div>
          {/* アップロード中のオーバーレイ（常に表示） */}
          {isUploading && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
              <Loader2 className='size-6 animate-spin text-white' />
            </div>
          )}
        </button>
      </div>

      {/* 下部の余白（アバターがはみ出す分） */}
      <div className='h-14' />

      {/* 隠しファイル入力 */}
      <input
        ref={inputRef}
        id={id}
        type='file'
        accept='image/png,image/jpeg,image/gif,image/webp'
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className='hidden'
      />
    </div>
  );
}
