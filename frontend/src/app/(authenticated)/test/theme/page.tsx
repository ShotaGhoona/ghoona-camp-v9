'use client';

import {
  Check,
  Sun,
  Moon,
  Monitor,
  Info,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/shadcn/ui/card';
import { Button } from '@/shared/ui/shadcn/ui/button';
import { Badge } from '@/shared/ui/shadcn/ui/badge';
import { Input } from '@/shared/ui/shadcn/ui/input';
import { Label } from '@/shared/ui/shadcn/ui/label';
import { Checkbox } from '@/shared/ui/shadcn/ui/checkbox';
import { Switch } from '@/shared/ui/shadcn/ui/switch';
import { Progress } from '@/shared/ui/shadcn/ui/progress';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/shared/ui/shadcn/ui/alert';
import { Separator } from '@/shared/ui/shadcn/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/shadcn/ui/radio-group';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/shadcn/ui/accordion';
import { cn } from '@/shared/ui/shadcn/lib/utils';
import { useTheme } from '@/features/core/theme/lib/theme-context';
import { themePresetList } from '@/features/core/theme/constants/theme-presets';
import type { ThemeMode } from '@/features/core/theme/model/types';

const modes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'ライト', icon: Sun },
  { value: 'dark', label: 'ダーク', icon: Moon },
  { value: 'system', label: 'システム', icon: Monitor },
];

export default function ThemeTestPage() {
  const { settings, setPreset, setMode } = useTheme();

  return (
    <div className='p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>テーマカラー テストページ</h1>
        <p className='text-muted-foreground'>
          各shadcn/uiコンポーネントがテーマカラーに正しく反応するかを確認できます
        </p>
      </div>

      {/* テーマピッカー */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>テーマ設定</CardTitle>
          <CardDescription>
            カラープリセットと表示モードを変更して、下のコンポーネントの変化を確認してください
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* カラープリセット */}
          <div className='space-y-3'>
            <h3 className='text-sm font-medium text-foreground'>
              テーマカラー
            </h3>
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
                        isSelected && 'ring-2 ring-foreground ring-offset-2',
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
                        isSelected
                          ? 'text-foreground'
                          : 'text-muted-foreground',
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
        </CardContent>
      </Card>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* ボタン */}
        <Card>
          <CardHeader>
            <CardTitle>Button</CardTitle>
            <CardDescription>ボタンの各バリアント</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2'>
            <Button variant='default'>Default (primary)</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='outline'>Outline</Button>
            <Button variant='ghost'>Ghost</Button>
            <Button variant='link'>Link</Button>
            <Button variant='destructive'>Destructive</Button>
          </CardContent>
        </Card>

        {/* バッジ */}
        <Card>
          <CardHeader>
            <CardTitle>Badge</CardTitle>
            <CardDescription>バッジの各バリアント</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2'>
            <Badge variant='default'>Default</Badge>
            <Badge variant='secondary'>Secondary</Badge>
            <Badge variant='outline'>Outline</Badge>
            <Badge variant='destructive'>Destructive</Badge>
          </CardContent>
        </Card>

        {/* フォーム要素 */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>入力系コンポーネント</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>メールアドレス</Label>
              <Input
                id='email'
                type='email'
                placeholder='example@example.com'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='select'>選択</Label>
              <Select>
                <SelectTrigger id='select'>
                  <SelectValue placeholder='選択してください' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='option1'>オプション1</SelectItem>
                  <SelectItem value='option2'>オプション2</SelectItem>
                  <SelectItem value='option3'>オプション3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* チェックボックス・スイッチ */}
        <Card>
          <CardHeader>
            <CardTitle>Checkbox & Switch</CardTitle>
            <CardDescription>選択系コンポーネント</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox id='terms' defaultChecked />
              <Label htmlFor='terms'>利用規約に同意する（checked）</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox id='terms2' />
              <Label htmlFor='terms2'>オプション設定</Label>
            </div>
            <Separator />
            <div className='flex items-center space-x-2'>
              <Switch id='airplane-mode' defaultChecked />
              <Label htmlFor='airplane-mode'>通知を有効にする（checked）</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <Switch id='airplane-mode2' />
              <Label htmlFor='airplane-mode2'>ダークモード</Label>
            </div>
          </CardContent>
        </Card>

        {/* ラジオグループ */}
        <Card>
          <CardHeader>
            <CardTitle>Radio Group</CardTitle>
            <CardDescription>ラジオボタン</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue='option1'>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='option1' id='r1' />
                <Label htmlFor='r1'>オプション1</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='option2' id='r2' />
                <Label htmlFor='r2'>オプション2</Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='option3' id='r3' />
                <Label htmlFor='r3'>オプション3</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* プログレス */}
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>進捗バー</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>25% 完了</p>
              <Progress value={25} />
            </div>
            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>75% 完了</p>
              <Progress value={75} />
            </div>
          </CardContent>
        </Card>

        {/* アラート */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Alert</CardTitle>
            <CardDescription>アラートメッセージ</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Alert>
              <Info className='size-4' />
              <AlertTitle>お知らせ</AlertTitle>
              <AlertDescription>
                デフォルトのアラートです。一般的な情報を表示します。
              </AlertDescription>
            </Alert>
            <Alert variant='destructive'>
              <AlertCircle className='size-4' />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>
                destructiveバリアントのアラートです。エラーや警告を表示します。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* アコーディオン */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Accordion</CardTitle>
            <CardDescription>アコーディオン</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type='single' collapsible>
              <AccordionItem value='item-1'>
                <AccordionTrigger>セクション1</AccordionTrigger>
                <AccordionContent>
                  アコーディオンの内容です。テーマカラーがボーダーやフォーカス状態に適用されます。
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value='item-2'>
                <AccordionTrigger>セクション2</AccordionTrigger>
                <AccordionContent>別のセクションの内容です。</AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* グローバルカラー使用ガイド */}
      <Card className='mt-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CheckCircle className='size-5 text-green-600' />
            使用可能なグローバルカラー
          </CardTitle>
          <CardDescription>
            テーマに連動して変化するCSS変数です。これらを使用してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* 推奨カラー */}
            <div className='space-y-3'>
              <h4 className='font-semibold text-green-700 dark:text-green-400'>
                ✅ テーマ連動（推奨）
              </h4>
              <div className='space-y-2 text-sm'>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded bg-primary' />
                  <code className='rounded bg-muted px-2 py-1'>bg-primary</code>
                  <span className='text-muted-foreground'>メインカラー</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded border bg-primary-foreground' />
                  <code className='rounded bg-muted px-2 py-1'>
                    text-primary-foreground
                  </code>
                  <span className='text-muted-foreground'>
                    primary上のテキスト
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded border-2 border-ring' />
                  <code className='rounded bg-muted px-2 py-1'>
                    ring-ring / border-ring
                  </code>
                  <span className='text-muted-foreground'>
                    フォーカスリング
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded bg-accent' />
                  <code className='rounded bg-muted px-2 py-1'>bg-accent</code>
                  <span className='text-muted-foreground'>
                    ホバー・選択状態
                  </span>
                </div>
              </div>
            </div>

            {/* 固定カラー */}
            <div className='space-y-3'>
              <h4 className='font-semibold text-blue-700 dark:text-blue-400'>
                🔒 固定カラー（テーマ非連動）
              </h4>
              <div className='space-y-2 text-sm'>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded border bg-background' />
                  <code className='rounded bg-muted px-2 py-1'>
                    bg-background
                  </code>
                  <span className='text-muted-foreground'>背景色</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded bg-foreground' />
                  <code className='rounded bg-muted px-2 py-1'>
                    text-foreground
                  </code>
                  <span className='text-muted-foreground'>メインテキスト</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded border bg-card' />
                  <code className='rounded bg-muted px-2 py-1'>bg-card</code>
                  <span className='text-muted-foreground'>カード背景</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded bg-muted' />
                  <code className='rounded bg-muted px-2 py-1'>bg-muted</code>
                  <span className='text-muted-foreground'>控えめな背景</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded bg-secondary' />
                  <code className='rounded bg-muted px-2 py-1'>
                    bg-secondary
                  </code>
                  <span className='text-muted-foreground'>セカンダリ背景</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded bg-destructive' />
                  <code className='rounded bg-muted px-2 py-1'>
                    bg-destructive
                  </code>
                  <span className='text-muted-foreground'>エラー・警告</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='size-6 rounded bg-border' />
                  <code className='rounded bg-muted px-2 py-1'>
                    border-border
                  </code>
                  <span className='text-muted-foreground'>ボーダー</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className='my-6' />

          {/* 注意事項 */}
          <div className='space-y-3'>
            <h4 className='font-semibold text-amber-700 dark:text-amber-400'>
              ⚠️ 実装時の注意事項
            </h4>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <strong>1. ブランドカラーにはprimaryを使用:</strong>{' '}
                ボタンやリンクなど、アプリのブランドカラーが必要な場所では
                <code className='rounded bg-muted px-1'>primary</code>
                を使用してください。
              </li>
              <li>
                <strong>2. ハードコードは避ける:</strong>{' '}
                <code className='rounded bg-muted px-1'>bg-[#d5697e]</code>
                のような直接指定は避け、CSS変数を使用してください。
              </li>
              <li>
                <strong>3. ダークモード対応:</strong>{' '}
                <code className='rounded bg-muted px-1'>dark:</code>
                プレフィックスを使わなくても、CSS変数を使えば自動的にダークモードに対応します。
              </li>
              <li>
                <strong>4. フォーカス状態:</strong> フォーカスリングには
                <code className='rounded bg-muted px-1'>ring-ring</code>
                を使用すると、テーマカラーに連動します。
              </li>
              <li>
                <strong>5. ホバー状態:</strong> ホバー時の背景には
                <code className='rounded bg-muted px-1'>hover:bg-accent</code>
                が推奨です。
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
