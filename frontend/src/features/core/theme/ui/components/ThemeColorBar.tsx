'use client';

import { cn } from '@/shared/ui/shadcn/lib/utils';

interface ThemeColorBarProps {
  name: string;
  hex: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ThemeColorBar({
  name,
  hex,
  isSelected,
  onClick,
}: ThemeColorBarProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'group flex w-full cursor-pointer items-center gap-3 rounded-xl py-2 px-3 transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isSelected
          ? 'shadow-inset-sm'
          : 'hover:bg-muted/30',
      )}
    >
      {/* 色名 */}
      <span
        className={cn(
          'w-24 text-left text-sm font-medium transition-colors',
          isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
        )}
      >
        {name}
      </span>

      {/* 棒グラフ */}
      <div className='relative h-6 flex-1'>
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full shadow-raised-sm transition-all duration-500 ease-out',
            isSelected
              ? 'w-full'
              : 'w-[15%] group-hover:w-[25%]',
          )}
          style={{ backgroundColor: hex }}
        />
      </div>
    </button>
  );
}
