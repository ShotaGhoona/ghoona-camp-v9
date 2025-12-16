# フロントエンド アーキテクチャ設計書

## 目次

1. [技術スタック](#技術スタック)
2. [FSD アーキテクチャ](#fsdアーキテクチャ)
3. [認証設計](#認証設計)
4. [ディレクトリ構造](#ディレクトリ構造)
5. [実装計画](#実装計画)

---

## 技術スタック

### コアフレームワーク

- **Next.js 15.3.2** (App Router)
- **React 19.2.0**
- **TypeScript 5.4.5**

### UI ライブラリ

- **shadcn/ui** - 再利用可能なコンポーネントライブラリ
  - Radix UI 2.x ベース
  - class-variance-authority 0.7.0
- **Tailwind CSS 3.4.3** - ユーティリティファースト CSS フレームワーク
  - tailwindcss-animate 1.0.7

### 状態管理

- **Redux Toolkit 2.2.0** - グローバル状態管理（認証状態、ユーザー情報）
- **TanStack React Query 5.28.0** - サーバー状態管理、キャッシング
  - React Query Devtools 統合

### フォーム管理

- **React Hook Form 7.51.0** - パフォーマンスの良いフォーム管理
- **Zod 3.22.4** - TypeScript 型安全なバリデーション
- **@hookform/resolvers 3.3.4** - Zod 統合

### HTTP 通信

- **Axios 1.6.8** - HTTP クライアント
  - インターセプター実装（エラーハンドリング、認証エラー処理）
  - Cookie-based 認証対応（withCredentials: true）
  - React Query との統合

### テスト

- **Jest 29.7.0** - テストフレームワーク

### コード品質

- **ESLint 8.57.0** - 静的解析
  - Next.js 設定（eslint-config-next 15.3.2）
  - TypeScript ESLint 7.18.0
  - eslint-plugin-boundaries 4.2.2（FSD 層の依存関係チェック）
  - Prettier 統合
- **Prettier 3.2.5** - コードフォーマッター
  - prettier-plugin-tailwindcss 0.6.9

### インフラ

- **Docker** - コンテナ化（Dockerfile 実装済み）
- **Docker Compose** - 開発環境構築
- **GitHub Actions** - CI/CD（frontend-ci.yml 実装済み）

---

## FSD アーキテクチャ

### FSD (Feature-Sliced Design) とは

フロントエンドアプリケーションを階層的に整理するアーキテクチャパターンです。ビジネスドメインごとに機能を分割し、各層が明確な責務を持つことで保守性と拡張性を向上させます。

### 階層構造

```
最上層   → App (ルーティング、ページ構成)
           ↓
         Page-Components (ページコンポーネント)
           ↓
         Widgets (再利用可能なウィジェット)
           ↓
         Features (ユースケース、ビジネスロジック)
           ↓
         Entities (ドメインモデル、API通信)
           ↓
最下層   → Shared (共有コンポーネント、ユーティリティ)
```

### 依存関係のルール

**依存の方向**: 上位レイヤーから下位レイヤーへのみ。同じレイヤーの違うセグメント同士も import できない。

| 層                  | import できる層                     | import できない層                       |
| ------------------- | ----------------------------------- | --------------------------------------- |
| **Shared**          | Shared                              | すべて                                  |
| **Entities**        | Shared                              | Features, Widgets, Page-Components, App |
| **Features**        | Entities, Shared                    | Widgets, Page-Components, App           |
| **Widgets**         | Features, Entities, Shared          | Page-Components, App                    |
| **Page-Components** | Widgets, Features, Entities, Shared | App                                     |
| **App**             | すべて（最上位）                    | -                                       |

### 重要な制約

- ✅ 各層は下位レイヤーのみ import 可能
- ✅ UI コンポーネントとロジックを適切に分離
- ❌ 下位レイヤーが上位レイヤーを import しない
- ❌ 同レイヤー内での循環依存を避ける

---

## Shared 層

### 役割

アプリケーション全体で共有される汎用的なコード、コンポーネント、ユーティリティ。

### ディレクトリ構造

```
frontend/src/shared/
├── api/                 # 共有API関連
│   ├── client/          # HTTPクライアント
│   │   └── http-client.ts
│   └── types/           # API型定義
│       └── api-types.ts
├── lib/                 # カスタムフック・ライブラリ
│   └── react-query/     # React Query設定
│       └── QueryProvider.tsx
├── types/               # 共有型定義
├── ui/                  # 共有UIコンポーネント
│   └── shadcn/          # shadcn/uiコンポーネント
│       └── ui/
│           ├── button.tsx
│           ├── card.tsx
│           ├── input.tsx
│           └── label.tsx
└── utils/               # ユーティリティ関数
    ├── core/            # コアユーティリティ
    │   └── cn.ts
    └── storage/         # ストレージ操作
        └── storage.ts
```

> ※ バレルファイル（index.ts）は使用しない。コンパイル時間短縮のため、直接ファイルパスでインポートする。

### 含めるべきもの

- ビジネスロジックを持たないプリミティブな UI コンポーネント
- 汎用的なユーティリティ関数
- データ変換、フォーマット、ストレージ操作
- 複数の機能で使用される基本的な値オブジェクト

### 含めてはいけないもの

- 特定の機能に依存するビジネスロジック → `features/` へ
- ページ固有のコンポーネント → `widgets/` や `page-components/` へ
- 他のレイヤー（features, widgets, app）への依存

---

## Entities 層

### 役割

ビジネスドメインごとのデータモデル、API 通信、ドメインロジック。

### ディレクトリ構造

```
frontend/src/entities/
├── auth/                        # 認証ドメイン
│   ├── model/                   # 型定義
│   │   ├── types.ts
│   │   └── user.ts
│   └── api/                     # APIクライアント
│       └── auth-api.ts
└── shared/                      # エンティティ間共有
```

### 含めるべきもの

- ドメインエンティティの定義
- API レスポンス/リクエストの型定義
- データ変換ロジック（DTO ⇔ Entity）
- 特定エンティティに関する API 通信ロジック
- HTTP リクエスト/レスポンスの処理
- エラーハンドリング

### 含めてはいけないもの

- ページ固有のロジック → `widgets/` や `page-components/` へ
- 複数ドメインを横断する複雑なユースケース → `features/` へ
- React Hooks や State 管理 → `features/` へ

### 設計ポイント

- DTO とエンティティを明確に分離
- 変換メソッド（fromDTO, toDTO）を提供
- Shared 層の httpClient を使用
- 型安全な API 呼び出し

---

## Features 層

### 役割

ビジネスユースケースの実装、React Hooks、状態管理。

### ディレクトリ構造

```
frontend/src/features/
├── auth/
│   ├── login/
│   │   ├── model/               # 型定義
│   │   │   └── types.ts
│   │   └── lib/                 # ロジック・Hooks
│   │       ├── use-login.ts
│   │       └── login-executor.ts
│   ├── logout/
│   └── get-current-user/
└── shared/                      # フィーチャー間共有ロジック
```

### 含めるべきもの

- ユースケースの実装（CRUD 操作、検索、集計など）
- ビジネスロジックの調整・組み合わせ
- React Hooks（データ取得、状態管理）
- 複数エンティティを横断する処理
- バリデーションロジック
- データ変換・加工ロジック

### 含めてはいけないもの

- ページ全体のレイアウト → `page-components/` へ
- 複雑なウィジェット（複数フィーチャーの組み合わせ） → `widgets/` へ
- 汎用的なユーティリティ → `shared/` へ
- ドメインエンティティの定義 → `entities/` へ

### 設計ポイント

- Executor パターンでビジネスロジックをカプセル化
- React Hook で UI とロジックを分離
- エンティティの API クライアントを使用
- エラーハンドリングと状態管理

---

## Widgets 層

### 役割

複数フィーチャーを組み合わせた再利用可能なウィジェット。

### ディレクトリ構造

```
frontend/src/widgets/
├── common/                      # 共通ウィジェット
│   ├── header/                  # ヘッダー
│   └── side-filter/             # サイドフィルター
└── auth/                        # 認証関連ウィジェット
    └── login-form/
```

### 含めるべきもの

- 複数の Features を組み合わせた再利用可能なコンポーネント
- ページ横断で使用される複雑な UI パターン
- Features のロジックを使用する UI コンポーネント

### 含めてはいけないもの

- ページ全体のレイアウト → `page-components/` へ
- ビジネスロジック単体 → `features/` へ
- 汎用的なプリミティブコンポーネント → `shared/ui` へ

### 設計ポイント

- **再利用性**: 複数のページで使用可能な設計
- **独立性**: 単体で動作し、最小限の props で機能
- **Features との連携**: Features の Hooks を内部で使用

---

## Page-Components 層

### 役割

ページレベルのコンポーネント。

### ディレクトリ構造

```
frontend/src/page-components/
├── login/
│   ├── ui/
│   │   ├── LoginContainer.tsx
│   │   └── LoginPage.tsx
│   └── lib/
│       └── useLoginPage.ts
└── dashboard/
    └── ui/
        └── DashboardPage.tsx
```

### 含めるべきもの

- ページレベルのコンテナコンポーネント
- Widgets を組み合わせたページ構成
- ページ固有のカスタムフック（検索、フィルタリング等）
- ページ固有の状態管理と Context
- ページ固有の設定ファイル

### 含めてはいけないもの

- ルーティング定義 → `app/` へ
- 再利用可能な Widget → `widgets/` へ
- ビジネスロジック → `features/` へ
- 複数ページをまたぐ Context → `features/` へ

### 設計ポイント

- Widgets の組み立てに専念
- ロジックはカスタムフックで分離
- レイアウトと UI 構成に責務を限定

---

## App 層

### 役割

アプリケーションの最上位層。ルーティング、ページ構成、グローバルな設定。

### ディレクトリ構造

```
frontend/src/app/
├── (authenticated)/              # 認証が必要なルート
│   ├── layout.tsx               # 認証済みレイアウト
│   ├── dashboard/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── (public)/                    # 認証不要なルート
│   ├── login/
│   │   └── page.tsx
│   └── layout.tsx
├── layout.tsx                   # ルートレイアウト
├── globals.css                  # グローバルスタイル
└── providers.tsx                # グローバルプロバイダー
```

### 含めるべきもの

- Page-Components のコンテナコンポーネントの呼び出し（page.tsx）
- 共通レイアウト構造（layout.tsx）
- ルートグループによる論理的なルート分割
- 動的ルート（[id]）
- グローバルな Context プロバイダー
- 認証チェックミドルウェア
- グローバルスタイル

### 含めてはいけないもの

- ビジネスロジック → `features/` へ
- 複雑な UI 構成 → `page-components/` へ
- データ取得ロジック → `features/` や `page-components/` へ

### 設計ポイント

- **薄く保つ**: page.tsx は Page-Components の呼び出しのみ
- **ルーティングに専念**: URL とコンポーネントのマッピング
- **共通レイアウトの活用**: layout.tsx で階層ごとに定義

---

## 認証設計

### 認証方式

**Cookie-based JWT 認証**

- JWT を httpOnly Cookie に保存
- XSS 攻撃対策
- CSRF 対策（sameSite 設定）

### Cookie 設定

```typescript
{
  httpOnly: true,           // JavaScriptからアクセス不可
  secure: true,             // HTTPS通信時のみ（本番環境）
  sameSite: 'lax',          // CSRF対策
  path: '/',
  maxAge: 7 * 24 * 60 * 60  // 7日間
}
```

### バックエンド API

| エンドポイント     | メソッド | 説明                    |
| ------------------ | -------- | ----------------------- |
| `/api/auth/login`  | POST     | ログイン、Cookie 設定   |
| `/api/auth/logout` | POST     | ログアウト、Cookie 削除 |
| `/api/auth/me`     | GET      | 現在のユーザー情報取得  |

### 認証フロー

1. **ログイン**

   - ユーザーがログインフォームで認証情報を送信
   - バックエンドが検証し、JWT を Cookie に設定
   - フロントエンドが Redux にユーザー情報を保存
   - `/dashboard` にリダイレクト

2. **認証状態の確認**

   - Next.js Middleware で Cookie 有無をチェック
   - 各ページで `/api/auth/me` を呼んで本格検証
   - Redux store にユーザー情報を保存

3. **ログアウト**
   - `/api/auth/logout` を呼び出し
   - バックエンドが Cookie を削除
   - Redux store をクリア
   - `/login` にリダイレクト

### Next.js Middleware

**役割**: 保護されたルートへのアクセス制御

### React Query 統合

- ログイン/ログアウト API は React Query で管理
- キャッシュと refetch の恩恵
- Redux store は認証成功時に更新

---

## ディレクトリ構造

### 完全なディレクトリツリー

```
frontend/
├── src/
│   ├── app/                     # App層
│   │   ├── (authenticated)/     # 認証が必要なルート
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx
│   │   ├── (public)/            # 認証不要なルート
│   │   │   ├── layout.tsx
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── providers.tsx
│   │   └── middleware.ts
│   ├── page-components/         # Page-Components層
│   │   ├── login/
│   │   └── dashboard/
│   ├── widgets/                 # Widgets層
│   │   ├── common/
│   │   └── auth/
│   ├── features/                # Features層
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   └── get-current-user/
│   │   └── shared/
│   ├── entities/                # Entities層
│   │   ├── auth/
│   │   │   ├── model/
│   │   │   └── api/
│   │   └── shared/
│   ├── shared/                  # Shared層
│   │   ├── api/
│   │   │   ├── client/
│   │   │   └── types/
│   │   ├── lib/
│   │   │   └── react-query/
│   │   ├── types/
│   │   ├── ui/
│   │   │   └── shadcn/
│   │   └── utils/
│   │       ├── core/
│   │       └── storage/
│   └── store/                   # Redux store
│       └── slices/
│           └── authSlice.ts
├── public/
├── docs/                        # ドキュメント
├── .env.local.example
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── Dockerfile
└── .dockerignore
```

---

## 開発ガイドライン

### コーディング規約

1. **TypeScript strict mode 有効化**

   - `strict: true` を必ず使用
   - `any` の使用を最小限に

2. **命名規則**

   - コンポーネント: PascalCase (`LoginPage.tsx`)
   - Hooks: camelCase (`useLogin.ts`)
   - 定数: UPPER_SNAKE_CASE (`API_BASE_URL`)
   - ファイル名: kebab-case or PascalCase（統一）

3. **import 順序**

   ```typescript
   // 1. 外部ライブラリ
   import React from "react";
   import { useQuery } from "@tanstack/react-query";

   // 2. 内部モジュール（FSD順）
   import { LoginPage } from "@/page-components/login/ui/LoginPage";
   import { useLogin } from "@/features/auth/login/lib/use-login";
   import { authApi } from "@/entities/auth/api/auth-api";
   import { Button } from "@/shared/ui/shadcn/ui/button";

   // 3. 型定義
   import type { User } from "@/entities/auth/model/types";
   ```

4. **FSD 依存関係チェック**
   - 上位レイヤーから下位レイヤーへのみ import
   - 同レイヤー内での依存を避ける
   - ESLint ルールで自動チェック

### コードレビューポイント

- [ ] FSD アーキテクチャに準拠しているか
- [ ] 型定義が適切か
- [ ] エラーハンドリングが実装されているか
- [ ] テストが書かれているか
- [ ] 適切なレイヤーに配置されているか

---

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

**最終更新日**: 2025-11-11
**バージョン**: 1.0.0
