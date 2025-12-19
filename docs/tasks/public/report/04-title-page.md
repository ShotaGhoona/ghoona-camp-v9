# タイトルページ 実装レポート

## 概要

ユーザーの称号進捗状況と、獲得可能な全称号のギャラリーを表示するページ。

## 関連コミット

| コミット | メッセージ |
|----------|------------|
| `f95efa3` | feat: title page |

## ディレクトリ構成

```
frontend/src/page-components/titles/home/
├── ui/
│   └── TitlesHomeContainer.tsx    # メインコンテナ
└── ui-block/
    ├── user-stats/
    │   └── ui/
    │       ├── CurrentTitleCard.tsx     # 現在の称号カード
    │       ├── UserStatsCard.tsx        # あなたの記録
    │       └── NextTitleProgress.tsx    # 称号ジャーニー
    └── title-gallery/
        └── ui/
            ├── TitleGallery.tsx         # 称号ギャラリー
            └── components/
                └── TitleCard.tsx        # 称号カード

frontend/src/widgets/title/title-detail-modal/
├── lib/
│   └── use-view-mode.ts
└── ui/
    ├── TitleDetailModalSheet.tsx
    └── TitleDetailContent.tsx

frontend/public/IMG/title/
├── 1.png ~ 8.png  # 称号画像（8種類）
```

## 実装内容

### 1. ページレイアウト

```
┌─────────────────────────────────────────────┐
│ 上部: ユーザー進捗カード群（横並び）        │
│ [現在の称号] [あなたの記録] [称号ジャーニー]│
├─────────────────────────────────────────────┤
│ 下部: 称号ギャラリー（横スクロール）        │
│ [Lv1] [Lv2] [Lv3] [Lv4] ...                 │
└─────────────────────────────────────────────┘
```

### 2. CurrentTitleCard（現在の称号）

- 称号名（日本語）
- 称号画像
- レベルバッジ
- 称号の説明

### 3. UserStatsCard（あなたの記録）

- 総参加日数
- 獲得済み称号数

### 4. TitleJourneyProgress（称号ジャーニー）

全称号の進捗を視覚化：

```
[Lv1:達成] ─ [Lv2:達成] ─ [Lv3:現在] ─ [Lv4:未達] ─ [Lv5:未達] ...
```

- 達成済み: 塗りつぶしアイコン
- 現在: ハイライト表示
- 未達成: 薄い表示

### 5. TitleGallery（称号ギャラリー）

全称号を横スクロールで表示：

- 獲得済み称号: フルカラー表示
- 未獲得称号: グレースケール、ロックアイコン
- クリックで詳細モーダル表示

### 6. TitleCard（称号カード）

- 称号画像（`/IMG/title/{level}.png`）
- 称号名
- 必要日数（「XX日で獲得」）
- 獲得状態の視覚的表現

### 7. 称号詳細モーダル

モーダル/シート切り替え可能（メンバー詳細と同じパターン）：

- 称号画像（大）
- 称号名、レベル
- 獲得条件
- 現在の保持者一覧（クリックでメンバー詳細へ）

## 称号システム

8段階のレベル制：

| レベル | 必要日数 |
|--------|----------|
| Lv1 | 1日 |
| Lv2 | 7日 |
| Lv3 | 30日 |
| Lv4 | 90日 |
| Lv5 | 180日 |
| Lv6 | 365日 |
| Lv7 | 730日 |
| Lv8 | 1095日 |

## 画像アセット

`frontend/public/IMG/title/`に8枚の称号画像（PNG形式）を配置。

## ダミーデータ

`shared/dummy-data/titles/titles.ts`：

- `dummyTitlesWithHolders`: 各称号と保持者リスト
- `dummyUserTitleProgress`: ログインユーザーの進捗情報

## 技術的ポイント

1. **画像の条件分岐**: 獲得状態でグレースケール/カラー切り替え
2. **モーダル連携**: 称号詳細 → メンバー詳細への遷移
3. **進捗可視化**: レベルごとの達成状況を直感的に表示
