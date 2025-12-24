# ダッシュボード ui-block 導入時の注意点

## 基本アーキテクチャ

### ラッパーパターン

ダッシュボードでは各ブロックを「薄いラッパー」で包んでデータを流し込む。

```
┌─────────────────────────────────────┐
│ DashboardContainer                   │
│  └─ GridLayout                       │
│      └─ BlockRenderContent           │
│          └─ {BlockName}Block (ラッパー)│  ← データフェッチ
│              └─ {OriginalComponent}  │  ← プレゼンテーション
└─────────────────────────────────────┘
```

### ラッパーの責務

```typescript
// ラッパーの基本構造
'use client';

import { useAppSelector } from '@/store/hooks';
import { use{Feature} } from '@/features/domain/{domain}/...';
import { OriginalComponent } from '@/page-components/{page}/...';

export function {BlockName}Block() {
  // 1. 認証情報取得
  const { user } = useAppSelector((state) => state.auth);

  // 2. データフェッチ
  const { data, isLoading } = use{Feature}(user?.id ?? null);

  // 3. データ加工（必要に応じて）
  const processedData = ...;

  // 4. プレゼンテーションコンポーネントに渡す
  return <OriginalComponent {...processedData} />;
}
```

---

## 注意点

### 1. データフェッチの重複

**問題**: 同じデータを使う複数ブロックを配置すると、各ブロックが個別にAPIを呼ぶ

**対策**:
- React Query のキャッシュが効くため、同一クエリキーなら実際のAPI呼び出しは1回
- `staleTime` を適切に設定（多くは5分キャッシュ）
- 気になる場合は `DashboardContainer` でデータフェッチしてprops経由で渡す

```typescript
// 例: useUserTitleAchievements は複数ブロックで使用
// → React Queryのキャッシュで実質1回のみAPI呼び出し
```

### 2. 認証状態の取得

**パターン**: 全ラッパーで統一

```typescript
const { user } = useAppSelector((state) => state.auth);
```

**注意**: `user` が `null` の場合のハンドリング
- hookの `enabled` オプションで制御
- または早期リターンでプレースホルダー表示

```typescript
const { data } = useUserTitleAchievements(user?.id ?? null);
// hook内で enabled: !!userId としている
```

### 3. ローディング状態

**推奨**: 各ブロックでスケルトン表示

```typescript
export function StatsCardsBlock() {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useAttendanceStatistics(user?.id ?? null);

  // ローディング中はスケルトン
  if (isLoading) {
    return <StatsCardsSkeleton />;
  }

  return <StatsCardsSection statistics={data?.data ?? null} />;
}
```

**注意**: 元コンポーネントが `isLoading` propsを受け取る場合はそちらを使用

### 4. サイズ制約の設定

**block-config.ts での設定**:

```typescript
'stats-cards': {
  type: 'stats-cards',
  label: '参加統計',
  constraints: {
    minW: 4,   // 最小幅（グリッド単位）
    maxW: 6,   // 最大幅
    minH: 3,   // 最小高さ
    maxH: 4,   // 最大高さ
    defaultW: 4, // デフォルト幅
    defaultH: 3, // デフォルト高さ
  },
},
```

**考慮点**:
- 元コンポーネントのデザインを確認
- 横長向き / 縦長向き / 正方形向きを判断
- 最小サイズはコンテンツが崩れない範囲で設定

### 5. 月ナビゲーションを持つコンポーネント

**対象**: GoalsTimelineView, EventsGalleryView, ActivityCalendarView など

**問題**: 元コンポーネントが月の状態管理を親に依存している

**対策**: ラッパー内で状態管理

```typescript
export function EventsBlock() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  const { data } = useEvents({ year: currentYear, month: currentMonth });

  const handlePrevMonth = () => { ... };
  const handleNextMonth = () => { ... };

  return (
    <EventsGalleryView
      events={data?.data.events ?? []}
      currentYear={currentYear}
      currentMonth={currentMonth}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
    />
  );
}
```

### 6. モーダル連携

**問題**: 元コンポーネントがアイテムクリックでモーダルを開く場合

**対策A**: ラッパーでモーダル状態管理

```typescript
export function RankingBlock() {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEntryClick = (entry: RankingEntry) => {
    setSelectedMemberId(entry.user.id);
    setIsModalOpen(true);
  };

  return (
    <>
      <RankingColumn onEntryClick={handleEntryClick} ... />
      <MemberDetailModalSheet
        memberId={selectedMemberId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
```

**対策B**: グローバルモーダル管理（複雑な場合）
- Zustand や Context で管理
- 将来的に検討

### 7. 編集モード対応

**現状**: `isEditMode` は `BlockRenderContent` から渡されていない

**理由**: 新しいブロック（current-title等）は `isEditMode` を使わない設計

**もし必要な場合**:
1. `BlockRenderContentProps` に追加
2. 各ラッパーに `isEditMode` を渡す
3. 元コンポーネントに伝播

### 8. エラーハンドリング

**推奨**: 各ラッパーでエラー状態を処理

```typescript
export function GoalsBlock() {
  const { data, isLoading, isError } = useMyGoals();

  if (isError) {
    return (
      <Card className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">データの取得に失敗しました</p>
      </Card>
    );
  }

  if (isLoading) {
    return <GoalsSkeleton />;
  }

  return <GoalsTimelineView goals={data?.data.goals ?? []} />;
}
```

---

## チェックリスト（1ブロック導入時）

### 準備
- [ ] 元コンポーネントのpropsを確認
- [ ] 必要なhook（データフェッチ）を特定
- [ ] サイズ制約を検討

### 実装
- [ ] `model/types.ts` に型追加
- [ ] `config/block-config.ts` に設定追加
- [ ] `ui-block/{block-name}-block/ui/{BlockName}Block.tsx` 作成
- [ ] `ui/components/BlockRenderContent.tsx` にimport + case追加

### 確認
- [ ] 型チェック通過
- [ ] ダッシュボードで表示確認
- [ ] ブロック追加ダイアログに表示される
- [ ] リサイズ・ドラッグ動作確認
- [ ] ローディング表示確認

---

## ディレクトリ規約

```
dashboard/home/
├── config/
│   └── block-config.ts       # ブロック設定
├── model/
│   └── types.ts              # 型定義
├── lib/
│   ├── use-dashboard-layouts.ts
│   └── use-grid-background.ts
├── ui/
│   ├── DashboardContainer.tsx
│   ├── GridBackground.tsx
│   └── components/
│       ├── AddBlockDialog.tsx
│       ├── BlockRenderContent.tsx
│       └── DashboardHeaderActions.tsx
└── ui-block/
    ├── current-title-block/
    │   └── ui/CurrentTitleBlock.tsx
    ├── title-journey-block/
    │   └── ui/TitleJourneyBlock.tsx
    ├── user-stats-block/
    │   └── ui/UserStatsBlock.tsx
    └── {new-block}/                   # 新規追加
        └── ui/{NewBlock}Block.tsx
```
