'use client';

import type { LucideIcon } from 'lucide-react';
import { cardVariants } from '@/shared/ui/shadcn/ui/card';
import { cn } from '@/shared/ui/shadcn/lib/utils';

interface ThemeModeButtonProps {
  icon: LucideIcon;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ThemeModeButton({
  icon: Icon,
  label,
  isSelected,
  onClick,
}: ThemeModeButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        cardVariants({ variant: isSelected ? 'inset' : 'raised' }),
        'group flex flex-1 cursor-pointer flex-col items-center gap-2 py-4 transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        !isSelected && 'hover:-translate-y-0.5 hover:shadow-raised active:translate-y-0 active:shadow-raised-sm',
      )}
    >
      <Icon
        className={cn(
          'size-6 transition-all duration-300',
          isSelected
            ? 'text-primary'
            : 'text-muted-foreground group-hover:text-foreground group-hover:scale-110',
        )}
      />
      <span
        className={cn(
          'text-sm font-medium transition-colors duration-300',
          isSelected
            ? 'text-foreground'
            : 'text-muted-foreground group-hover:text-foreground',
        )}
      >
        {label}
      </span>
    </button>
  );
}
