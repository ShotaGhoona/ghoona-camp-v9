'use client';

import { cn } from '@/shared/ui/shadcn/lib/utils';
import { Label } from '@/shared/ui/shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/ui/select';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  description?: string;
  className?: string;
  triggerClassName?: string;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = '選択してください',
  disabled,
  description,
  className,
  triggerClassName,
}: SelectFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className='text-sm font-medium'>
          {label}
        </Label>
      )}
      {description && (
        <p className='text-xs text-muted-foreground'>{description}</p>
      )}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className={cn(
            'w-full rounded-lg border-none bg-muted/50 shadow-inset transition-shadow',
            'focus:ring-2 focus:ring-primary/20',
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
