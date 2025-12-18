# API接続時の注意事項

## 型定義
- ダミーデータの型をコピーしない（適当に作られている）
- バックエンドAPIレスポンスを正として`entities/domain/{domain}/model/types.ts`に定義
- 共通型（Pagination等）は`shared/types/`に配置

## よくある変換パターン
- `currentTitle`（object）→ `currentTitleLevel`（number）+ `getTitleByLevel()`で変換
- snake_case → camelCase（httpClientで自動変換 or 型定義時に注意）
- nullable対応（`string | null`）

## ローディング
- `isLoading`を子コンポーネントに伝播
- 各コンポーネント内でスケルトンを表示
- スケルトンは`ui/skeleton/`配下に配置

## FSD構成
```
entities/domain/{domain}/
├── model/types.ts    # 型定義
└── api/{domain}-api.ts  # APIクライアント

features/domain/{domain}/{feature}/
└── lib/use-{feature}.ts  # React Query hooks
```
