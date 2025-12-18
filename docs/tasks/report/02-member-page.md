# メンバーページ 実装レポート

## 概要

メンバー一覧をギャラリー形式で表示し、フィルター機能とメンバー詳細モーダルを備えたページ。

## 関連コミット

| コミット | メッセージ |
|----------|------------|
| `e0ed41a` | feat: member gallery |
| `1203c0b` | feat: member page filter |
| `0efc274` | feat: member detail modal |

## ディレクトリ構成

```
frontend/src/page-components/members/home/
├── ui/
│   └── MembersHomeContainer.tsx    # メインコンテナ
└── ui-block/
    ├── gallery-view/
    │   └── ui/
    │       ├── MembersGalleryView.tsx
    │       └── components/
    │           └── MemberCard.tsx  # メンバーカード
    └── filter-sidebar/
        ├── lib/
        │   └── use-tag-search.ts   # タグ検索Hook
        ├── model/
        │   └── types.ts            # フィルター状態の型
        └── ui/
            ├── MembersFilterSidebar.tsx
            ├── FilterToggleButton.tsx
            ├── SearchWindow.tsx
            └── components/
                └── TagSearchInput.tsx

frontend/src/widgets/member/member-detail-modal/
├── lib/
│   ├── use-view-mode.ts            # モーダル/シート切り替え
│   └── use-rival-action.ts         # ライバル操作ロジック
└── ui/
    ├── MemberDetailModalSheet.tsx  # モーダル/シート切り替え可能
    └── MemberDetailContent.tsx     # 詳細コンテンツ
```

## 実装内容

### 1. ギャラリービュー

- **GalleryViewWidget**（汎用Widget）を使用したグリッド表示
- ページネーション対応
- レスポンシブグリッド（画面幅に応じてカラム数変動）

### 2. メンバーカード（MemberCard）

ホバー時のインタラクション：

- 背景画像が拡大表示（blur解除）
- グラデーションオーバーレイ
- アバターがフェードアウト、Eyeアイコン表示
- パルスリングアニメーション
- 名前が白色に変化、位置が下にスライド

```tsx
// ホバーエフェクトの主要クラス
"transition-all duration-500 hover:shadow-lg"
"opacity-0 group-hover:opacity-100"
"group-hover:translate-y-6"
```

### 3. フィルターサイドバー

| フィルター項目 | 説明 |
|----------------|------|
| キーワード検索 | 名前、taglineで検索 |
| スキル | 複数選択可能なタグ |
| 興味 | 複数選択可能なタグ |
| 称号レベル | 称号で絞り込み |

- **タグ検索**: 入力に応じて候補をフィルタリング、選択済みは除外
- **フィルターカウント**: アクティブなフィルター数をバッジ表示

### 4. メンバー詳細モーダル

表示モード切り替え機能：

- **モーダルモード**: 中央に表示（Dialog）
- **シートモード**: 右からスライドイン（Sheet）
- 右上のトグルボタンで切り替え可能

表示内容：
- アバター（大）
- 名前、tagline
- 現在の称号（バッジ）
- SNSリンク（Twitter, Instagram, LinkedIn等）
- スキルタグ
- 興味タグ
- ライバル設定ボタン

### 5. ライバル機能

**lib/use-rival-action.ts:**
- 認証ユーザーのライバル一覧を取得
- ライバル追加/削除のmutationを管理
- ボタン状態（disabled, pending）を計算

**ボタン表示ロジック:**
| 条件 | 表示 |
|------|------|
| 自分自身 | ボタン非表示 |
| ライバル未登録 | 「ライバルに設定する」（primary） |
| ライバル登録済 | 「ライバルを解除する」（destructive） |
| 上限（3人）到達 | 「ライバル枠が上限に達しています」 |
| 処理中 | ローディングスピナー表示 |

**使用Feature hooks:**
- `useRivals` - ライバル一覧取得
- `useAddRival` - ライバル追加
- `useDeleteRival` - ライバル削除

## フィルタリングロジック

```typescript
// 暫定実装（バックエンド接続時に削除予定）
const filteredMembers = useMemo(() => {
  return dummyMembers.filter((member) => {
    // キーワード検索
    // スキルフィルター（OR条件）
    // 興味フィルター（OR条件）
    // 称号フィルター
    return true;
  });
}, [filter]);
```

## ダミーデータ

`shared/dummy-data/members/members.ts`に20名分のダミーメンバーを定義。

## 技術的ポイント

1. **アニメーション**: Tailwindの`transition`と`group-hover`で宣言的に実装
2. **状態分離**: UI状態（`filter`, `selectedMemberId`）のみフロントで管理
3. **再利用性**: `MemberDetailModalSheet`は他ページ（ランキング等）からも呼び出し可能
