# デザイン哲学

## コンセプト

**ソフトニューモーフィズム** - 柔らかく、触れたくなるUI

朝活コミュニティとして、毎朝触れるアプリだからこそ「心地よさ」を重視。
押し込む感覚、浮き上がる感覚で、物理的なフィードバックを表現する。

## シャドウシステム

| クラス | 用途 |
|--------|------|
| `shadow-raised` | カード、モーダル、ポップオーバー |
| `shadow-raised-sm` | ボタン、アイコンコンテナ、小要素 |
| `shadow-inset` | 入力フィールド、凹んだエリア |
| `shadow-inset-sm` | ホバー/アクティブ状態、小さな凹み |

## インタラクション原則

1. **押したら凹む**: ホバー/クリックで `shadow-raised` → `shadow-inset`
2. **背景色は控えめ**: 色変化より影の変化で状態を表現
3. **ボーダーレス**: 境界線ではなくシャドウで領域を分ける

## コンポーネントvariant

```
Card:     default / raised / inset
Button:   default / raised / inset / ghost / ...
Dropdown: default / raised / primary
```

## 色の使い方

- **Primary**: ヘッダー、アクセント、CTA
- **Muted**: 背景のニュアンス、アイコンコンテナ
- **Destructive**: 削除、ログアウトなど注意を引く操作

## アイコン

- lucide-reactを使用（SVG直書き禁止）
- アイコンコンテナ: `bg-muted rounded-md shadow-raised-sm`
