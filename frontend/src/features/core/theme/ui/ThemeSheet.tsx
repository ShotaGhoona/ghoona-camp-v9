'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/shadcn/ui/sheet';
import { Card, CardContent } from '@/shared/ui/shadcn/ui/card';
import { useTheme } from '../lib/theme-context';
import { themePresetList } from '../constants/theme-presets';
import { ThemeColorBar } from './components/ThemeColorBar';
import { ThemeModeButton } from './components/ThemeModeButton';
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
        </SheetHeader>

        <div className='space-y-6 px-4'>
          {/* カラープリセット - 縦並び棒グラフ */}
          <div className='space-y-3'>
            <h3 className='text-base font-medium text-foreground'>テーマカラー</h3>
            <Card variant='raised' className='py-3'>
              <CardContent className='space-y-1 px-3'>
                {themePresetList.map((preset) => (
                  <ThemeColorBar
                    key={preset.id}
                    name={preset.name}
                    hex={preset.hex}
                    isSelected={settings.presetId === preset.id}
                    onClick={() => setPreset(preset.id)}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* モード切り替え */}
          <div className='space-y-3'>
            <h3 className='text-base font-medium text-foreground'>表示モード</h3>
            <div className='flex gap-3'>
              {modes.map(({ value, label, icon }) => (
                <ThemeModeButton
                  key={value}
                  icon={icon}
                  label={label}
                  isSelected={settings.mode === value}
                  onClick={() => setMode(value)}
                />
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
