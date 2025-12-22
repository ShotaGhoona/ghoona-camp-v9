'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import { cn } from '@/shared/ui/shadcn/lib/utils';
import { Label } from '@/shared/ui/shadcn/ui/label';
import { Badge } from '@/shared/ui/shadcn/ui/badge';
import { Button } from '@/shared/ui/shadcn/ui/button';

export interface TagsFieldProps {
  id: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxItems?: number;
  maxLength?: number;
  description?: string;
  className?: string;
}

export function TagsField({
  id,
  label,
  value,
  onChange,
  placeholder = 'タグを入力',
  disabled,
  maxItems = 20,
  maxLength = 50,
  description,
  className,
}: TagsFieldProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxItems) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className='text-sm font-medium'>
        {label}
      </Label>
      <div className='rounded-lg bg-background shadow-raised-sm'>
        {/* 入力エリア */}
        <div className='flex items-center gap-2 px-3 py-2'>
          <input
            id={id}
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || value.length >= maxItems}
            maxLength={maxLength}
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
            onClick={addTag}
            disabled={disabled || value.length >= maxItems || !inputValue.trim()}
            className='size-7 shrink-0 text-muted-foreground hover:text-foreground'
          >
            <Plus className='size-4' />
          </Button>
        </div>
        {/* セパレーター + バッジエリア */}
        {value.length > 0 && (
          <>
            <div className='mx-3 border-t border-border/50' />
            <div className='flex flex-wrap gap-1.5 px-3 py-2'>
              {value.map((tag) => (
                <Badge
                  key={tag}
                  variant='secondary'
                  className='cursor-pointer gap-1 bg-background/60 px-2 py-0.5 text-xs hover:bg-background'
                  onClick={() => !disabled && removeTag(tag)}
                >
                  {tag}
                  <X className='size-3' />
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
