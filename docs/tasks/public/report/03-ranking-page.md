# ランキングページ 実装レポート

## 概要

3種類のランキング（月間・総合・連続）を横並びで表示し、メンバーの参加状況を可視化するページ。

## 関連コミット

| コミット | メッセージ |
|----------|------------|
| `3c27085` | feat: ranking page |

## ディレクトリ構成

```
frontend/src/page-components/ranking/home/
├── ui/
│   └── RankingHomeContainer.tsx    # メインコンテナ
└── ui-block/
    └── ranking-list/
        └── ui/
            ├── RankingColumn.tsx       # ランキング列
            └── components/
                ├── TopThreeItem.tsx    # トップ3表示
                └── RankingItem.tsx     # 4位以下表示

frontend/src/shared/dummy-data/ranking/ranking.ts  # ダミーデータ
```

## 実装内容

### 1. 3種類のランキング

| タイプ | 表示名 | アイコン | 説明 |
|--------|--------|----------|------|
| `monthly` | 今月 | Calendar | 今月の参加日数 |
| `total` | 総合 | Trophy | 累計参加日数 |
| `streak` | 連続 | Flame | 連続参加日数 |

### 2. RankingColumn（ランキング列）

各列の構成：

```
┌─────────────────────────┐
│ ヘッダー                │
│ [アイコン] タイトル     │
│            自分: XX日/X位│
├─────────────────────────┤
│ トップ3（横並び）       │
│ [1位] [2位] [3位]       │
├─────────────────────────┤
│ 4位以下（縦リスト）     │
│ 4. ○○○  XX日           │
│ 5. ○○○  XX日           │
│ ...                     │
└─────────────────────────┘
```

### 3. TopThreeItem（トップ3）

- 大きめのアバター表示
- 順位バッジ（1位:金、2位:銀、3位:銅）
- スコア表示（日数）
- ホバーでシャドウ強調

### 4. RankingItem（4位以下）

- コンパクトな横並びレイアウト
- 順位番号 + アバター + 名前 + スコア
- 自分のエントリはハイライト表示

### 5. メンバー詳細連携

ランキングエントリをクリックすると`MemberDetailModalSheet`が開く（メンバーページと共通Widget使用）。

## UI設計ポイント

### 自分のスコア表示

ヘッダー右側に自分のスコアと順位を常時表示：

```tsx
<div className="flex items-baseline gap-1.5">
  <span className="text-lg font-bold tabular-nums">{myScore}</span>
  <span className="text-[10px] text-muted-foreground">日</span>
  <span className="mx-1 text-muted-foreground/50">/</span>
  <span className="rounded bg-primary text-white">{myRank}</span>
  <span className="text-[10px] text-muted-foreground">位</span>
</div>
```

### 3列レイアウト

- `flex min-h-0 flex-1`で等幅分割
- 各列内は`ScrollArea`でスクロール可能
- ヘッダーは固定、リスト部分のみスクロール

## ダミーデータ

`shared/dummy-data/ranking/ranking.ts`に以下を定義：

- `monthlyRanking`: 月間ランキング（10名）
- `totalRanking`: 総合ランキング（10名）
- `streakRanking`: 連続ランキング（10名）
- `getScoreValue()`: ランキングタイプに応じたスコア取得関数

## 技術的ポイント

1. **型安全**: `RankingType`と`RankingEntry`で厳密な型定義
2. **設定の集約**: `COLUMN_CONFIG`で各列の設定を一元管理
3. **Widget再利用**: `MemberDetailModalSheet`をそのまま利用
