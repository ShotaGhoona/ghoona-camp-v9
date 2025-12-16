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
        'flex flex-1 cursor-pointer flex-col items-center gap-2 py-4 transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <Icon
        className={cn(
          'size-6 transition-colors',
          isSelected ? 'text-primary' : 'text-muted-foreground',
        )}
      />
      <span
        className={cn(
          'text-sm font-medium transition-colors',
          isSelected ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
      </span>
    </button>
  );
}
