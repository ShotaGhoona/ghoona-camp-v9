'use client';

import { Check, Sun, Moon, Monitor } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/shadcn/ui/sheet';
import { cn } from '@/shared/ui/shadcn/lib/utils';
import { useTheme } from '../lib/theme-context';
import { themePresetList } from '../constants/theme-presets';
import type { ThemeMode } from '../model/types';

interface ThemeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const modes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'ライト', icon: Sun },
  { value: 'dark', label: 'ダーク', icon: Moon },
  { value: 'system', label: 'システム', icon: Monitor },
];

export function ThemeSheet({ open, onOpenChange }: ThemeSheetProps) {
  const { settings, setPreset, setMode } = useTheme();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle>テーマ設定</SheetTitle>
          <SheetDescription>
            アプリの表示設定を変更できます
          </SheetDescription>
        </SheetHeader>

        <div className='space-y-6 px-4'>
          {/* カラープリセット */}
          <div className='space-y-3'>
            <h3 className='text-sm font-medium text-foreground'>テーマカラー</h3>
            <div className='flex flex-wrap gap-2'>
              {themePresetList.map((preset) => {
                const isSelected = settings.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type='button'
                    onClick={() => setPreset(preset.id)}
                    className={cn(
                      'group relative flex flex-col items-center gap-2 rounded-lg p-3 transition-colors',
                      'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected && 'bg-muted',
                    )}
                  >
                    <div
                      className={cn(
                        'relative size-10 rounded-full transition-transform',
                        'group-hover:scale-110',
                        isSelected && 'ring-2 ring-offset-2 ring-foreground',
                      )}
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && (
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <Check className='size-5 text-white drop-shadow-md' />
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isSelected ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* モード切り替え */}
          <div className='space-y-3'>
            <h3 className='text-sm font-medium text-foreground'>表示モード</h3>
            <div className='inline-flex rounded-lg bg-muted p-1'>
              {modes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type='button'
                  onClick={() => setMode(value)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    settings.mode === value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className='size-4' />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
