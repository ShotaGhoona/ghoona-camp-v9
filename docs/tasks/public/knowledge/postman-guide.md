# Postman 使い方ガイド

## Postmanとは？

**APIをテストするためのツール**です。

ブラウザではGETリクエストしか簡単に送れませんが、Postmanを使えばPOST、PUT、DELETEなど全てのHTTPメソッドを簡単にテストできます。

---

## インストール

公式サイトからダウンロード:
https://www.postman.com/downloads/

---

## 基本画面

```
┌─────────────────────────────────────────────────────────────┐
│  [GET ▼]  [http://localhost:8004/api/v1/users    ] [Send]  │
├─────────────────────────────────────────────────────────────┤
│  Params | Authorization | Headers | Body | ...              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Key          │  Value                                      │
│  search       │  山田                                        │
│  limit        │  10                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Response                                                   │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ {                                                     │ │
│  │   "data": { ... },                                    │ │
│  │   "message": "success"                                │ │
│  │ }                                                     │ │
│  └───────────────────────────────────────────────────────┘ │
│                                              200 OK  150ms  │
└─────────────────────────────────────────────────────────────┘
```

---

## 基本操作

### 1. 新しいリクエストを作成

1. 「+」タブをクリック（または `Cmd + T` / `Ctrl + T`）
2. HTTPメソッドを選択（GET, POST, PUT, DELETE等）
3. URLを入力
4. 「Send」ボタンをクリック

---

### 2. HTTPメソッド別の使い方

#### GET（データ取得）

```
メソッド: GET
URL: http://localhost:8004/api/v1/users
```

クエリパラメータは「Params」タブで追加:

| Key | Value |
|-----|-------|
| search | 山田 |
| limit | 10 |

または直接URLに記述:
```
http://localhost:8004/api/v1/users?search=山田&limit=10
```

---

#### POST（データ作成）

```
メソッド: POST
URL: http://localhost:8004/api/v1/users
```

1. 「Body」タブをクリック
2. 「raw」を選択
3. 右側のドロップダウンで「JSON」を選択
4. JSONを入力:

```json
{
  "email": "test@example.com",
  "password": "password123",
  "username": "テストユーザー"
}
```

---

#### PUT / PATCH（データ更新）

```
メソッド: PUT
URL: http://localhost:8004/api/v1/users/123e4567-e89b-12d3-a456-426614174000
```

Body（JSON）:
```json
{
  "username": "更新後の名前"
}
```

---

#### DELETE（データ削除）

```
メソッド: DELETE
URL: http://localhost:8004/api/v1/users/123e4567-e89b-12d3-a456-426614174000
```

通常Bodyは不要。

---

## 認証が必要なAPIをテストする

### 方法1: Cookieを使う場合

1. 「Headers」タブをクリック
2. 以下を追加:

| Key | Value |
|-----|-------|
| Cookie | access_token=eyJhbGciOiJS... |

---

### 方法2: Bearer Tokenを使う場合

1. 「Authorization」タブをクリック
2. Typeで「Bearer Token」を選択
3. Tokenにアクセストークンを入力

---

### 方法3: ログインAPIから自動取得

1. まずログインAPIを叩く:
```
POST http://localhost:8004/api/auth/login
Body:
{
  "email": "test@example.com",
  "password": "password123"
}
```

2. レスポンスのCookieが自動で保存される
3. 同じドメインへのリクエストには自動でCookieが付与される

---

## 便利な機能

### 環境変数（Environments）

開発・本番でURLを切り替えたい場合:

1. 右上の「Environments」→「+」
2. 変数を定義:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| base_url | http://localhost:8004 | http://localhost:8004 |

3. URLで使用:
```
{{base_url}}/api/v1/users
```

---

### コレクション（Collections）

関連するリクエストをグループ化:

1. 左サイドバーの「Collections」→「+」
2. コレクション名を入力（例: Ghoona Camp API）
3. リクエストを右クリック→「Save」→コレクションを選択

---

### レスポンスの確認

下部のレスポンスエリアで確認できる情報:

| タブ | 内容 |
|------|------|
| Body | レスポンスのJSON/HTML等 |
| Cookies | 受け取ったCookie |
| Headers | レスポンスヘッダー |
| Test Results | テスト結果 |

右側に表示される情報:
- **Status**: 200 OK, 404 Not Found 等
- **Time**: レスポンス時間
- **Size**: レスポンスサイズ

---

## Ghoona Camp APIテスト例

### ユーザー一覧取得

```
GET http://localhost:8004/api/v1/users

Params:
- search: (任意) キーワード検索
- skills: (任意) スキルフィルタ（カンマ区切り）
- interests: (任意) 興味フィルタ（カンマ区切り）
- title_levels: (任意) 称号レベル（1-8、カンマ区切り）
- limit: (任意) 取得件数（デフォルト20、最大100）
- offset: (任意) オフセット
```

### ユーザー詳細取得

```
GET http://localhost:8004/api/v1/users/{user_id}

例: http://localhost:8004/api/v1/users/123e4567-e89b-12d3-a456-426614174000
```

### ログイン

```
POST http://localhost:8004/api/auth/login

Body (JSON):
{
  "login_id": "admin",
  "password": "pass"
}
```

### ログアウト

```
POST http://localhost:8004/api/auth/logout
```

### 認証状態確認

```
GET http://localhost:8004/api/auth/status
```

---

## トラブルシューティング

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:8004
```

**原因**: サーバーが起動していない

**解決**:
```bash
docker compose up -d
```

---

### 401 Unauthorized

**原因**: 認証が必要なAPIに認証情報なしでアクセス

**解決**: 先にログインAPIを叩いてCookieを取得する

---

### 404 Not Found

**原因**: URLが間違っている、またはリソースが存在しない

**確認**:
- URLのスペルミス
- `/api/v1` プレフィックスが正しいか
- パスパラメータ（user_id等）が正しいか

---

### 422 Unprocessable Entity

**原因**: リクエストボディのバリデーションエラー

**確認**:
- JSONの形式が正しいか
- 必須フィールドが含まれているか
- データ型が正しいか（文字列、数値等）

---

## Swagger UIとの使い分け

| ツール | 特徴 | 向いている場面 |
|--------|------|----------------|
| Swagger UI | ブラウザで完結、ドキュメント付き | 簡単なテスト、API仕様確認 |
| Postman | 高機能、履歴保存、環境切替 | 本格的なテスト、チーム共有 |

**Swagger UI**: http://localhost:8004/docs
