'use client';

import { Search } from 'lucide-react';

import { Input } from '@/shared/ui/shadcn/ui/input';

interface SearchWindowProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchWindow({
  value,
  onChange,
  placeholder = '検索...',
}: SearchWindowProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-96 border-none pl-9 shadow-inset-sm"
      />
    </div>
  );
}
