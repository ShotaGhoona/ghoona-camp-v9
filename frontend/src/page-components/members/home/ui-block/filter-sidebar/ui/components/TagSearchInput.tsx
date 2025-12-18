'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

import { cn } from '@/shared/ui/shadcn/lib/utils';
import { Input } from '@/shared/ui/shadcn/ui/input';
import { Button } from '@/shared/ui/shadcn/ui/button';

interface TagSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function TagSearchInput({
  value,
  onChange,
  onClear,
  placeholder = '検索...',
}: TagSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 展開時にフォーカス
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 外側クリックで閉じる（値がない場合のみ）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !value
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleClear = () => {
    onClear();
    setIsOpen(false);
  };

  // 値がある場合は常に展開状態
  const isExpanded = isOpen || value.length > 0;

  return (
    <div ref={containerRef} className='relative'>
      <div
        className={cn(
          'flex items-center overflow-hidden rounded-md transition-all duration-200 ease-out',
          isExpanded ? 'w-48 shadow-inset-sm' : 'w-7',
        )}
      >
        <Button
          variant='ghost'
          size='icon'
          className={cn('size-7 shrink-0', isExpanded && 'pointer-events-none')}
          onClick={() => setIsOpen(true)}
        >
          <Search className='size-3 text-muted-foreground' />
        </Button>

        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-7 border-none bg-transparent p-0 pr-6 text-xs shadow-none ring-0 transition-all duration-200 focus-visible:ring-0',
            isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0',
          )}
        />

        {value && (
          <Button
            variant='ghost'
            size='icon'
            className='absolute right-0 top-1/2 size-7 -translate-y-1/2'
            onClick={handleClear}
          >
            <X className='size-3' />
          </Button>
        )}
      </div>
    </div>
  );
}
