'use client';

import { useRef } from 'react';
import { Camera, User } from 'lucide-react';

import { cn } from '@/shared/ui/shadcn/lib/utils';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(event.target?.result as string);
      };
      reader.readAsDataURL(file);
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
          disabled={disabled}
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
            <Camera className='size-6 text-white' />
          </div>
        </button>
      </div>

      {/* 下部の余白（アバターがはみ出す分） */}
      <div className='h-14' />

      {/* 隠しファイル入力 */}
      <input
        ref={inputRef}
        id={id}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        disabled={disabled}
        className='hidden'
      />
    </div>
  );
}
