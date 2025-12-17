'use client';

import { CalendarDays, LayoutGrid } from 'lucide-react';
import { cn } from '@/shared/ui/shadcn/lib/utils';

export type ViewType = 'gallery' | 'calendar';

interface ViewChangeSwitchProps {
  value: ViewType;
  onChange: (value: ViewType) => void;
}

export function ViewChangeSwitch({ value, onChange }: ViewChangeSwitchProps) {
  return (
    <div className='flex items-center rounded-lg bg-muted p-1 shadow-inset-sm'>
      <button
        type='button'
        onClick={() => onChange('gallery')}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
          value === 'gallery'
            ? 'bg-background text-foreground shadow-raised-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <LayoutGrid className='size-4' />
        ギャラリー
      </button>
      <button
        type='button'
        onClick={() => onChange('calendar')}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
          value === 'calendar'
            ? 'bg-background text-foreground shadow-raised-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <CalendarDays className='size-4' />
        カレンダー
      </button>
    </div>
  );
}
