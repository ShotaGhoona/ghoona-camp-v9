'use client';

import { cn } from '@/shared/ui/shadcn/lib/utils';
import { Label } from '@/shared/ui/shadcn/ui/label';

export interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  description?: string;
  className?: string;
}

export function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
  maxLength,
  description,
  className,
}: TextareaFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id} className='text-sm font-medium'>
        {label}
      </Label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          'flex min-h-[80px] w-full resize-none rounded-lg border-none bg-background px-3 py-2 text-sm shadow-raised-sm outline-none transition-shadow',
          'placeholder:text-muted-foreground/60',
          'focus:ring-2 focus:ring-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      />
    </div>
  );
}
