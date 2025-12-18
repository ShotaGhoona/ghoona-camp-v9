'use client';

import { Filter } from 'lucide-react';

import { Button } from '@/shared/ui/shadcn/ui/button';
import { Badge } from '@/shared/ui/shadcn/ui/badge';

interface FilterToggleButtonProps {
  isOpen: boolean;
  activeCount: number;
  onClick: () => void;
}

export function FilterToggleButton({
  isOpen,
  activeCount,
  onClick,
}: FilterToggleButtonProps) {
  return (
    <Button
      variant={isOpen ? 'inset' : 'raised'}
      size='lg'
      onClick={onClick}
      className='gap-2'
    >
      <Filter className='size-4' />
      <span>フィルター</span>
      {activeCount > 0 && (
        <Badge
          variant='default'
          className='size-5 justify-center rounded-full p-0 text-xs'
        >
          {activeCount}
        </Badge>
      )}
    </Button>
  );
}
