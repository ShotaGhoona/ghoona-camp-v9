# テーマ設定 実装レポート

## 概要

ユーザーが好みのテーマカラーと表示モード（ライト/ダーク/システム）を選択できる機能を実装。

## 関連コミット

| コミット | メッセージ |
|----------|------------|
| `6e372c3` | feat: テーマカラー設定 |
| `14d713a` | redesign: テーマカラー設定 |
| `ff70c09` | redesign: テーマカラー設定 |

## ディレクトリ構成

```
frontend/src/features/core/theme/
├── constants/
│   └── theme-presets.ts      # 5色のプリセット定義
├── lib/
│   ├── theme-context.tsx     # ThemeProvider / useTheme Hook
│   ├── theme-applier.ts      # CSS変数への適用ロジック
│   ├── theme-storage.ts      # localStorage永続化
│   └── theme-init-script.ts  # SSR対応の初期化スクリプト
├── model/
│   └── types.ts              # 型定義
└── ui/
    ├── ThemeSheet.tsx        # テーマ設定パネル（Sheet）
    └── components/
        ├── ThemeColorBar.tsx     # カラー選択バー
        └── ThemeModeButton.tsx   # モード切り替えボタン
```

## 実装内容

### 1. カラープリセット（5色）

| ID | 名前 | カラーコード |
|----|------|--------------|
| `purple` | Grape | `#655395` |
| `red` | Strawberry | `#d5697e` |
| `yellow` | Lemon | `#b59235` |
| `blue` | Soda | `#3f77a4` |
| `green` | Melon | `#698f75` |

### 2. 表示モード

- **ライト**: 常にライトモード
- **ダーク**: 常にダークモード
- **システム**: OSの設定に追従（`prefers-color-scheme`監視）

### 3. 状態管理

- **Context API**（`ThemeProvider`）でグローバル管理
- **localStorage**で永続化（`ghoona-theme`キー）
- システムモード時は`matchMedia`でリアルタイム監視

### 4. CSS変数適用

選択したプリセットに応じて、以下のCSS変数を動的に書き換え：

```css
--primary: <HSL値>
--ring: <HSL値>
--accent: <HSL値>
```

ライト/ダークモードで異なる値を適用（`primaryLight` / `primaryDark`）。

## UI構成

- **ThemeSheet**: 右からスライドするシートパネル
- **ThemeColorBar**: 横棒グラフ形式でカラー選択（選択中は幅が広がる）
- **ThemeModeButton**: アイコン付きの3択ボタン（Sun / Moon / Monitor）

## 技術的ポイント

1. **FOUC（Flash of Unstyled Content）対策**: `theme-init-script.ts`でSSR時に初期テーマを適用
2. **アクセシビリティ**: shadcn/uiのSheetコンポーネントでフォーカス管理
3. **パフォーマンス**: `useCallback`でセッター関数をメモ化

## デフォルト設定

```typescript
{
  presetId: 'red',  // Strawberry
  mode: 'system'    // システム設定に追従
}
```
