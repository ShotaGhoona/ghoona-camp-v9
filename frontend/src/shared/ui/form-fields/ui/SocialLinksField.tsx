'use client';

import { Plus, Trash2 } from 'lucide-react';

import { cn } from '@/shared/ui/shadcn/lib/utils';
import { Label } from '@/shared/ui/shadcn/ui/label';
import { Button } from '@/shared/ui/shadcn/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/ui/select';
import type { SnsPlatform } from '@/shared/domain/sns/model/types';
import { SNS_PLATFORM_CONFIG } from '@/shared/domain/sns/data/sns-master';

export interface SocialLinkItem {
  platform: SnsPlatform;
  url: string;
  title?: string | null;
}

export interface SocialLinksFieldProps {
  id: string;
  label: string;
  value: SocialLinkItem[];
  onChange: (value: SocialLinkItem[]) => void;
  disabled?: boolean;
  maxItems?: number;
  description?: string;
  className?: string;
}

const SNS_PLATFORMS = Object.keys(SNS_PLATFORM_CONFIG) as SnsPlatform[];

export function SocialLinksField({
  id,
  label,
  value,
  onChange,
  disabled,
  maxItems = 10,
  description,
  className,
}: SocialLinksFieldProps) {
  const addLink = () => {
    if (value.length < maxItems) {
      onChange([...value, { platform: 'twitter', url: '' }]);
    }
  };

  const updateLink = (
    index: number,
    field: keyof SocialLinkItem,
    fieldValue: string,
  ) => {
    onChange(
      value.map((link, i) =>
        i === index ? { ...link, [field]: fieldValue } : link,
      ),
    );
  };

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className='text-sm font-medium'>
        {label}
      </Label>
      <div className='rounded-lg bg-background shadow-raised-sm'>
        {value.map((link, index) => {
          const Icon = SNS_PLATFORM_CONFIG[link.platform]?.icon;
          return (
            <div key={index}>
              {index > 0 && <div className='mx-3 border-t border-border/50' />}
              <div className='flex items-center gap-2 px-3 py-2'>
                <Select
                  value={link.platform}
                  onValueChange={(v) => updateLink(index, 'platform', v)}
                  disabled={disabled}
                >
                  <SelectTrigger className='h-8 w-auto gap-1.5 border-none bg-transparent px-2 shadow-none'>
                    {Icon && (
                      <Icon className='size-4 text-muted-foreground' />
                    )}
                    <span className='text-sm'>
                      {SNS_PLATFORM_CONFIG[link.platform].label}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {SNS_PLATFORMS.map((platform) => {
                      const PlatformIcon = SNS_PLATFORM_CONFIG[platform].icon;
                      return (
                        <SelectItem key={platform} value={platform}>
                          <div className='flex items-center gap-2'>
                            <PlatformIcon className='size-4' />
                            {SNS_PLATFORM_CONFIG[platform].label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <input
                  type='url'
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                  placeholder='URLを入力'
                  disabled={disabled}
                  className={cn(
                    'flex-1 bg-transparent text-sm outline-none',
                    'placeholder:text-muted-foreground/60',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => removeLink(index)}
                  disabled={disabled}
                  className='size-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                >
                  <Trash2 className='size-4' />
                </Button>
              </div>
            </div>
          );
        })}
        {/* 追加ボタン */}
        {value.length < maxItems && (
          <>
            {value.length > 0 && (
              <div className='mx-3 border-t border-border/50' />
            )}
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={addLink}
              disabled={disabled}
              className='w-full rounded-none text-muted-foreground hover:bg-transparent hover:text-muted-foreground'
            >
              <Plus className='mr-1.5 size-4' />
              追加
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
