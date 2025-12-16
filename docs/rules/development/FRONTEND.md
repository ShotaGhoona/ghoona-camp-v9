# フロントエンド 開発ガイド

## 目次

1. [はじめに](#はじめに)
2. [開発の流れ](#開発の流れ)
3. [FSD の使い分け](#fsdの使い分け)
4. [API 連携](#api連携)
5. [状態管理](#状態管理)
6. [フォーム実装](#フォーム実装)
7. [UI コンポーネント](#uiコンポーネント)
8. [コーディング規約](#コーディング規約)

---

## はじめに

このガイドでは、AI Solution Template を使った実践的な開発方法を説明します。

### 前提

- [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) で FSD アーキテクチャを理解済み
- [FRONTEND_SETUP.md](./FRONTEND_SETUP.md) で環境構築完了
- React、TypeScript、Next.js の基本知識

---

## 開発の流れ

新機能を追加する際の基本的な流れ:

### 1. 型定義と API クライアント（Entities 層）

```
entities/[domain]/
  ├── model/types.ts    # 型定義
  └── api/[domain]-api.ts  # API呼び出し
```

**やること:**

- ドメインモデルの型を定義
- HTTP クライアントを使って API 関数を実装

### 2. ビジネスロジック（Features 層）

```
features/[domain]/[use-case]/
  ├── model/types.ts    # フォームデータ等の型
  └── lib/use-[name].ts # カスタムHook
```

**やること:**

- React Query の useQuery または useMutation を使った Hook を作成
- Entities の API を呼び出す

### 3. UI コンポーネント（Widgets 層・オプション）

```
widgets/[domain]/[name]-widget/
  └── ui/[Name]Widget.tsx
```

**やること:**

- 複数の Features を組み合わせた再利用可能なコンポーネント
- 単純なページなら Widgets は不要

### 4. ページ構成（Page-Components 層）

```
page-components/[page-name]/
  └── ui/[PageName]Page.tsx
```

**やること:**

- Widgets を配置してページ全体を構成
- ページ固有のレイアウト

### 5. ルーティング（App 層）

```
app/(authenticated)/[page-name]/
  └── page.tsx
```

**やること:**

- Page-Component を import して表示するだけ

---

### 具体例

| やりたいこと               | 配置場所                                             |
| -------------------------- | ---------------------------------------------------- |
| ユーザー一覧を取得する API | `entities/user/api/user-api.ts`                      |
| ユーザーを検索する Hook    | `features/user/search-users/lib/use-search-users.ts` |
| ログインフォーム           | `widgets/auth/login-form/ui/LoginForm.tsx`           |
| ログインページ全体         | `page-components/login/ui/LoginPage.tsx`             |
| 日付フォーマット関数       | `shared/utils/format/date.ts`                        |
| Button コンポーネント      | `shared/ui/shadcn/button.tsx`                        |

---

## API 連携

### HTTP クライアントの基本

**場所:** `shared/api/client/http-client.ts`（設定済み）

```typescript
import httpClient from "@/shared/api/client/http-client";

// GET
const response = await httpClient.get<User>("/api/users/123");

// POST
const response = await httpClient.post<User>("/api/users", data);

// PUT
const response = await httpClient.put<User>("/api/users/123", data);

// DELETE
await httpClient.delete("/api/users/123");
```

### React Query との統合

#### データ取得（useQuery）

```typescript
// features/user/get-user/lib/use-user.ts
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/user-api";

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getById(userId),
    staleTime: 1000 * 60 * 5, // 5分キャッシュ
  });
}
```

#### データ更新（useMutation）

```typescript
// features/user/update-user/lib/use-update-user.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/entities/user/api/user-api";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userApi.update(data),
    onSuccess: () => {
      // キャッシュを無効化して再取得
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

---

## 状態管理

### 2 つの状態管理の使い分け

| 状態の種類                                 | 使うライブラリ | 例                                 |
| ------------------------------------------ | -------------- | ---------------------------------- |
| **グローバル状態**<br>（アプリ全体で共有） | Redux Toolkit  | 認証状態、ユーザー情報、テーマ設定 |
| **サーバー状態**<br>（API から取得）       | React Query    | ユーザー一覧、投稿データ、検索結果 |

## フォーム実装

### React Hook Form + Zod

### ポイント

- ✅ Zod でバリデーションを定義（型も自動生成）
- ✅ エラーメッセージは日本語で
- ✅ `isSubmitting`で二重送信を防止

---

## UI コンポーネント

### shadcn/ui の使用

**現在利用可能:**

- Button, Card, Input, Label

**新しいコンポーネントの追加:**

```bash
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add dropdown-menu
```

コンポーネントは `shared/ui/shadcn/` に自動で追加されます。

### カスタムコンポーネント

プロジェクト固有の UI コンポーネントは `shared/ui/components/` に配置。

---

## コーディング規約

### 命名規則

| 対象           | 規則                           | 例                      |
| -------------- | ------------------------------ | ----------------------- |
| コンポーネント | PascalCase                     | `LoginPage.tsx`         |
| Hooks          | camelCase + use プレフィックス | `useLogin.ts`           |
| 関数           | camelCase                      | `formatDate.ts`         |
| 定数           | UPPER_SNAKE_CASE               | `API_BASE_URL`          |
| 型             | PascalCase                     | `User`, `LoginFormData` |

### FSD 依存関係ルール

```typescript
// ❌ Bad: Shared層から上位層をimport
import { useLogin } from "@/features/auth/login/lib/use-login"; // NG

// ✅ Good: 下位層→上位層のみ
import httpClient from "@/shared/api/client/http-client"; // OK
```

> ※ バレルファイル（index.ts）は使用しない。コンパイル時間短縮のため、直接ファイルパスでインポートする。

**ESLint で自動チェックされます！**

### TypeScript スタイル

```typescript
// ✅ Good: typeを優先
export type User = { id: string; name: string };

// ✅ Good: 戻り値の型を明示
export function getUser(id: string): Promise<User> { ... }

// ❌ Bad: anyの使用
function process(data: any) { ... }

// ✅ Good: unknownを使用
function process(data: unknown) {
  if (typeof data === 'object') { ... }
}
```

---

## ベストプラクティス

### 1. 'use client'ディレクティブ

```typescript
// ✅ Hooksやイベントハンドラを使う場合のみ
"use client";
import { useState } from "react";

// ✅ 静的コンポーネントは不要（Server Component）
export function StaticHeader() {
  return <header>My App</header>;
}
```

### 2. React Query のキャッシュ戦略

```typescript
// ✅ queryKeyを階層的に定義
useQuery({ queryKey: ["user", userId] }); // ['user', '123']
useQuery({ queryKey: ["user", userId, "posts"] }); // ['user', '123', 'posts']

// キャッシュ無効化
queryClient.invalidateQueries({ queryKey: ["user", userId] });
// → ['user', '123'] と ['user', '123', 'posts'] の両方が無効化される
```

### 3. 環境変数

```typescript
// ✅ ブラウザで使う場合はNEXT_PUBLIC_プレフィックス
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ プレフィックスなしはサーバーサイドのみ
const secret = process.env.SECRET_KEY; // ブラウザでundefined
```

### 4. コンポーネントの責務を分離

```typescript
// ❌ Bad: ページにロジックを詰め込む
export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => { fetch(...) }, []);
  // 100行以上のロジック...
}

// ✅ Good: Features層でロジックを分離
export function TasksPage() {
  const { data: tasks, isLoading } = useTasks(); // Hook化
  return <TaskListWidget tasks={tasks} isLoading={isLoading} />;
}
```

### 5. パフォーマンス最適化

```typescript
// ✅ React.memoで不要な再レンダリングを防止
export const TaskCard = memo(function TaskCard({ task }) {
  return <div>{task.title}</div>;
});

// ✅ useMemoで重い計算をキャッシュ
const sortedTasks = useMemo(
  () => tasks.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  [tasks]
);
```

---

## エラーハンドリング

### API エラー

```typescript
export function useCreateTask() {
  return useMutation({
    mutationFn: taskApi.create,
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) {
          alert("認証エラー");
          window.location.href = "/login";
        } else if (status === 400) {
          alert("入力エラー");
        }
      }
    },
  });
}
```

### グローバルエラーハンドリング

`http-client.ts`のインターセプターで 401 エラーは自動でログインページにリダイレクト（実装済み）。

## 参考資料

- [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) - アーキテクチャ詳細
- [FRONTEND_TESTING_GUIDE.md](./FRONTEND_TESTING_GUIDE.md) - テスト
- [Feature-Sliced Design 公式](https://feature-sliced.design/)
- [React Query 公式](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)

---

**最終更新**: 2025-11-11
**バージョン**: 1.0.0
