# フロントエンド テストガイド

## 目次

1. [はじめに](#はじめに)
2. [テストの実行](#テストの実行)
3. [ユニットテスト](#ユニットテスト)
4. [API 結合テスト](#api結合テスト)
5. [テストのポイント](#テストのポイント)

---

## はじめに

このプロジェクトでは以下の 2 種類のテストを書きます:

1. **ユニットテスト** - ユーティリティ関数のテスト
2. **API 結合テスト** - 実際のバックエンド API との結合テスト

### テスト環境

| ツール             | バージョン | 用途                 |
| ------------------ | ---------- | -------------------- |
| **Jest**           | 29.7.0     | テストフレームワーク |
| **Docker Compose** | -          | バックエンド起動     |

---

## テストの実行

### 1. バックエンドを起動

API 結合テストを実行する前に、必ずバックエンドを起動してください。

**確認:**

- バックエンド API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### 2. テスト実行

```bash
# フロントエンドディレクトリで実行
cd frontend

# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ付き実行
npm test -- --coverage

# 特定のファイルのみ実行
npm test -- auth-api.test.ts
```

---

## ユニットテスト

### 対象

- **Shared 層のユーティリティ関数など**（`shared/utils/`）
- データ変換、フォーマット、バリデーション関数など

### 基本パターン

```typescript
// shared/utils/format/__test__/date.test.ts
import { formatDate } from "../date";

describe("formatDate", () => {
  it("日付文字列を yy/MM/dd にフォーマット", () => {
    expect(formatDate("2024-03-15")).toBe("24/03/15");
  });

  it('nullの場合は"-"を返す', () => {
    expect(formatDate(null)).toBe("-");
  });

  it('不正な日付の場合は"-"を返す', () => {
    expect(formatDate("invalid-date")).toBe("-");
  });
});
```

### テストの構造（AAA パターン）

```typescript
describe("機能グループ名", () => {
  it("期待される動作を説明", () => {
    // Arrange（準備）
    const input = "2024-03-15";

    // Act（実行）
    const result = formatDate(input);

    // Assert（検証）
    expect(result).toBe("24/03/15");
  });
});
```

### テストすべきケース

- ✅ 正常系（期待される入力）
- ✅ 異常系（null, undefined, 空文字列）
- ✅ エッジケース（境界値）

### 目標カバレッジ

**Shared 層のユーティリティ: 80%以上**

---

## API 結合テスト

### 概要

**重要:** API 結合テストは実際のバックエンド API に接続して行います。モックは使用しません。

- **対象:** Entities 層の API クライアント（`entities/[domain]/api/`）
- **環境:** Docker Compose で起動したバックエンド
- **目的:** フロントエンドとバックエンドの結合を確認

### 前提条件

```bash
# バックエンドが起動していること
docker compose ps

# backend コンテナが running であること
```

### テストの配置

```
entities/[domain]/api/__tests__/
  └── [domain]-api.test.ts
```

### 基本パターン

#### 認証 API（ログイン・ログアウト）のテスト

```typescript
// entities/auth/api/__tests__/auth-api.test.ts
import { authApi } from "../auth-api";

describe("authApi", () => {
  describe("login", () => {
    it("正しい認証情報でログインできる", async () => {
      const credentials = {
        login_id: "test_user",
        password: "test_password",
      };

      const response = await authApi.login(credentials);

      expect(response).toHaveProperty("access_token");
      expect(response).toHaveProperty("user_id");
      expect(typeof response.access_token).toBe("string");
      expect(typeof response.user_id).toBe("string");
    });

    it("間違った認証情報でエラーになる", async () => {
      const credentials = {
        login_id: "wrong_user",
        password: "wrong_password",
      };

      await expect(authApi.login(credentials)).rejects.toThrow();
    });

    it("空のログインIDでエラーになる", async () => {
      const credentials = {
        login_id: "",
        password: "test_password",
      };

      await expect(authApi.login(credentials)).rejects.toThrow();
    });
  });

  describe("logout", () => {
    it("ログアウトできる", async () => {
      // まずログイン
      await authApi.login({
        login_id: "test_user",
        password: "test_password",
      });

      // ログアウト実行
      await expect(authApi.logout()).resolves.not.toThrow();
    });
  });

  describe("getCurrentUser", () => {
    it("ログイン後に現在のユーザー情報を取得できる", async () => {
      // まずログイン
      const loginResponse = await authApi.login({
        login_id: "test_user",
        password: "test_password",
      });

      // ユーザー情報取得
      const user = await authApi.getCurrentUser();

      expect(user).toHaveProperty("id");
      expect(user.id).toBe(loginResponse.user_id);
    });

    it("ログインしていない状態でエラーになる", async () => {
      // ログアウトしておく
      await authApi.logout().catch(() => {});

      // ユーザー情報取得
      await expect(authApi.getCurrentUser()).rejects.toThrow();
    });
  });
});
```

#### CRUD API のテスト

```typescript
// entities/task/api/__tests__/task-api.test.ts
import { taskApi } from "../task-api";
import { authApi } from "@/entities/auth/api/auth-api";

describe("taskApi", () => {
  let authToken: string;

  // テスト前に認証
  beforeAll(async () => {
    const response = await authApi.login({
      login_id: "test_user",
      password: "test_password",
    });
    authToken = response.access_token;
  });

  // テスト後にクリーンアップ
  afterAll(async () => {
    await authApi.logout();
  });

  describe("getAll", () => {
    it("タスク一覧を取得できる", async () => {
      const tasks = await taskApi.getAll();

      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe("create", () => {
    it("タスクを作成できる", async () => {
      const newTask = {
        title: "Test Task",
        description: "Test Description",
      };

      const createdTask = await taskApi.create(newTask);

      expect(createdTask).toHaveProperty("id");
      expect(createdTask.title).toBe(newTask.title);
      expect(createdTask.description).toBe(newTask.description);
    });

    it("タイトルが空の場合はエラーになる", async () => {
      const invalidTask = {
        title: "",
        description: "Description",
      };

      await expect(taskApi.create(invalidTask)).rejects.toThrow();
    });
  });

  describe("getById", () => {
    it("タスク詳細を取得できる", async () => {
      // まずタスクを作成
      const createdTask = await taskApi.create({
        title: "Test Task",
        description: "Test Description",
      });

      // タスク詳細取得
      const task = await taskApi.getById(createdTask.id);

      expect(task.id).toBe(createdTask.id);
      expect(task.title).toBe(createdTask.title);
    });

    it("存在しないIDでエラーになる", async () => {
      await expect(taskApi.getById("non-existent-id")).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("タスクを更新できる", async () => {
      // まずタスクを作成
      const createdTask = await taskApi.create({
        title: "Original Title",
        description: "Original Description",
      });

      // タスク更新
      const updatedTask = await taskApi.update({
        id: createdTask.id,
        title: "Updated Title",
      });

      expect(updatedTask.id).toBe(createdTask.id);
      expect(updatedTask.title).toBe("Updated Title");
    });
  });

  describe("delete", () => {
    it("タスクを削除できる", async () => {
      // まずタスクを作成
      const createdTask = await taskApi.create({
        title: "Task to Delete",
        description: "This will be deleted",
      });

      // タスク削除
      await expect(taskApi.delete(createdTask.id)).resolves.not.toThrow();

      // 削除されたことを確認
      await expect(taskApi.getById(createdTask.id)).rejects.toThrow();
    });
  });
});
```

### 環境変数

API 結合テストでは実際のバックエンド URL を使用します:

```bash
# .env.test または .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 目標カバレッジ

**Entities 層の API: 80%以上**

---

## テストのポイント

### 1. バックエンドが起動していることを確認

### 2. テストの順序に依存しない

各テストは独立して実行できるようにする。

### 3. テスト後のクリーンアップ

作成したテストデータは削除する（オプション）。

### 4. 認証が必要な API のテスト

### 5. エラーケースもテスト

---

## カバレッジの確認

```bash
# HTMLレポート生成
npm test -- --coverage --coverageReporters=html

# ブラウザで開く
open coverage/index.html
```

### カバレッジ目標

| レイヤー           | 目標カバレッジ |
| ------------------ | -------------- |
| **Shared** (utils) | 90%以上        |
| **Entities** (API) | 80%以上        |

---

## CI/CD でのテスト

GitHub Actions で自動実行する場合、バックエンドも起動する必要があります:

```yaml
# .github/workflows/frontend-ci.yml
- name: Start backend
  run: docker compose up -d backend db

- name: Wait for backend
  run: |
    timeout 60 bash -c 'until curl -f http://localhost:8000/docs; do sleep 2; done'

- name: Run tests
  run: npm test -- --coverage
```

## 参考資料

- [Jest 公式](https://jestjs.io/)
- [Axios Testing](https://axios-http.com/docs/intro)

---

**最終更新**: 2025-11-11
**バージョン**: 1.0.0
