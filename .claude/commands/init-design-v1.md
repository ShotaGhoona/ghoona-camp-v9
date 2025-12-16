---
description: FSD準拠のデモUI作成時の注意事項を読み込む
---

# FSD準拠 デモUI作成ガイドライン v1

このプロンプトを読んだ後、FRONTENDアーキテクチャドキュメントを確認してください。

@docs/rules/architecture/FRONTEND.md

---

## 1. ディレクトリ構造とファイル命名

### App層
- **できるだけ薄く**する
- `page-components`層の`slice/ui/XxxxContainer`を呼び出すだけにする
- ただしデザイン確認のみが目的の場合は`app/(public)/design-test/page.tsx`に直接全てを書くようにする

### Page-Components層の構造

```
page-components/
└── sample/
    ├── home/                    # 一覧ページ（一覧ページと詳細ページがある場合はhomeを用いる）
    │   ├── ui/
    │   │   └── SampleHomeContainer.tsx  # メインコンテナ
    │   ├── ui-block/
    │   │   ├── table-view/              # テーブル表示ブロック
    │   │   │   ├── ui/
    │   │   │   │   ├── SampleTable.tsx
    │   │   │   │   ├── components/      # 細かいコンポーネント
    │   │   │   │   │   └── SampleCard.tsx
    │   │   │   │   └── skeleton/
    │   │   │   │       └── SampleTableSkeleton.tsx
    │   │   │   ├── model/               # テーブル専用の型
    │   │   │   │   └── types.ts
    │   │   │   └── config/
    │   │   │       └── column-config.tsx
    │   │   ├── dashboard-panel/         # ダッシュボードパネル
    │   │   │   ├── ui/
    │   │   │   │   └── DashboardPanel.tsx
    │   │   │   └── model/
    │   │   └── header/                  # ヘッダーブロック
    │   │       └── ui/
    │   │           └── SampleHeader.tsx
    │   ├── dummy-data/                  # ダミーデータ（後で削除）
    │   │   └── samples.ts
    │   └── model/                       # ページ全体で共有する型（必要な場合）
    │       └── types.ts
    ├── detail/                  # 詳細ページ（1種類の場合）
    │   └── ui/
    │       └── SampleDetailContainer.tsx
    ├── basic-information/       # 詳細ページが複数ある場合
    │   └── ui/
    │       └── SampleBasicInformationContainer.tsx
    └── register/
        └── ui/
            └── SampleRegisterContainer.tsx
```

### ui-blockとは

- **目的**: 各UIブロックごとに`lib`、`model`、`config`等を持たせることで、どのロジック・型がどのコンポーネントに対応しているか明確にする
- **Container**: `ui/`には`XxxxContainer.tsx`を配置。`widgets/`や`shared/`からのimportは自由に行ってよい
- **スライス内分離**: 各ui-block内に`model/`や`lib/`を持たせることで、ロジックと型の対応関係を明確化
- **注意**: ui-blockは「コンポーネントの整理手段」であり、「widgetsやsharedの使用を制限するもの」ではない

### 命名ルール

| 種類 | 命名パターン | 例 |
|------|-------------|-----|
| メインコンテナ | `XxxxContainer` | `ItemMasterContainer` |
| ui-block名 | kebab-case | `table-view`, `dashboard-panel` |
| 分離コンポーネント | `XxxxPanel` (迷ったらこれ) | `ItemDetailPanel` |
| 明確な役割がある場合 | `XxxxHeader`, `XxxxTable` | `AllocateTable` |
| 細かいコンポーネント | `ui-block/[block]/ui/components/`内に配置 | `SourceTagPopover` |
| Widgetsのメイン | `XxxxWidget` (単数形) | `TableViewWidget` |

---

## 2. バックエンド接続を見据えた実装

### やること
- UI状態のみフロントで管理（`currentPage`, `filterState`, `sortState`等）
- アクション実行時は`alert()`で「xxxxxを消去（未実装）」のように表示
- コメント: `// TODO: API呼び出し`

### やらないこと
- フロントでのフィルター・ソート実装（バックエンドで行う）
- 接続時に消すロジックの実装

### どうしても必要な場合
```typescript
// 今後消す==========================================
const filteredData = data.filter(item => item.name.includes(searchQuery));
// =================================================
```

---

## 3. ダミーデータ

### 配置
`slice/dummy-data/`内に作成（`ui/`と同じ階層）

### ルール
- **型定義も同じファイルに書く**（後でentityの型と混乱を避けるため）
- APIレスポンス仕様がある場合は、その形に寄せる

```typescript
// slice/dummy-data/samples.ts

export interface SampleItem {
  id: number;
  name: string;
  email: string;
  // ...
}

export const dummySamples: SampleItem[] = [
  { id: 1, name: '山田太郎', email: 'yamada@example.com' },
  // ...
];
```

---

## 4. 型定義の配置

| 状況 | 配置場所 |
|------|----------|
| ダミーデータ用（後で消える） | `slice/dummy-data/xxx.ts`内 |
| ui-block専用の型（バックエンド接続後も残る） | `ui-block/[block]/model/types.ts` |
| ページ全体で共有する型 | `slice/model/types.ts` |

---

## 5. ローディング表示

- shadcn/uiの`Skeleton`を使用
- 配置: `slice/ui/skeleton/XxxxSkeleton.tsx`
- APIからデータを取得する等、実際にローディングが発生する部分にのみ作成する

```typescript
export function SampleTableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
```

---

## 6. UI実装ルール

### 基本
- **shadcn/ui**をベースに作る（`frontend/src/shared/ui/shadcn/ui/`）
- アイコンは**lucide-react**を使用（`<svg>`は使わない）
- ボタンは**icon + text**の構成を積極的に使う
- グラフ・チャートは**recharts**を使用
- Dialogを使う場合、DialogTriggerとDialogContentは同じコンポーネントにまとめ、open状態は内部で管理する
- ラベル付きインプットは`frontend/src/shared/ui/form-fields/ui/`にあるものを使う（パターンがない場合はここに新規追加する）
- データがない時のUI（フィルター後の空状態など）は`frontend/src/shared/ui/components/empty-design/`から適切なものを選んで使う
- 削除確認ダイアログは`frontend/src/shared/ui/components/delete-confirm-dialog/`にあるものを使う（用途に応じて新規追加可）

### レイアウト
- 全体を`h-screen`にする
- `flex min-h-0 flex-1`で子要素に引き継ぎ、スクロール箇所を適切に管理
- 横幅は基本的に`w-full`で画面いっぱいに使う（`max-w-7xl mx-auto`のような中央寄せ+余白は避ける）

```tsx
<div className="flex h-screen flex-col">
  <Header />
  <main className="flex min-h-0 flex-1 flex-col">
    <Content className="flex-1 overflow-auto" />
  </main>
</div>
```

### サイドバー・ヘッダー
- 全体で使うものは`widgets/`に配置

---

## 7. 禁止事項

- **バレルファイル（index.ts）による公開API**
  - コンパイル速度低下を招くため禁止
  - 直接ファイルパスでimportする

---

これらのルールに従ってデモUIを作成してください。
不明点があれば質問してください。

---

## 読み込み完了後の返信

以下のように返信してください：

```
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  ▄██▄
 ██◉◉██   FSD Design System v1 — Loaded
 ▀████▀   最高のプロダクトを作りましょう。
 ▄█▀▀█▄   何からデザインしますか？
▀▀ ▀▀ ▀▀  
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```
