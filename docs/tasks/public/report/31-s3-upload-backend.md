# S3 画像アップロード バックエンド実装レポート

## 概要

プロフィール画像（avatarUrl）を S3 に保存するための署名付き URL 生成 API をオニオンアーキテクチャに従って実装。

Base64 方式（文字数制限エラー）から、S3 署名付き URL 方式に移行するための基盤。

## 背景・課題

```
現状: Base64エンコード → avatarUrl フィールドに保存
問題: Presentation層の max_length=2000 制限を超過（画像は数万文字）
解決: S3署名付きURL方式でブラウザから直接S3にアップロード
```

## 変更ファイル

```
backend/app/
├── application/
│   ├── interfaces/
│   │   └── storage_service.py        # NEW: ストレージI/F
│   ├── schemas/
│   │   └── upload_schemas.py         # NEW: UploadUrlDTO
│   └── use_cases/
│       └── upload_usecase.py         # NEW: ユースケース
├── infrastructure/
│   └── storage/
│       ├── __init__.py               # NEW
│       └── s3_service_impl.py        # NEW: S3実装（boto3）
├── presentation/
│   ├── api/
│   │   └── upload_api.py             # NEW: アップロードAPI
│   └── schemas/
│       └── upload_schemas.py         # NEW: リクエスト/レスポンス
├── di/
│   └── upload.py                     # NEW: 依存性注入
├── config.py                         # MOD: AWS設定追加
└── main.py                           # MOD: ルーター登録

backend/
├── requirements.txt                  # MOD: boto3追加
└── .env.example                      # MOD: AWS設定例追加
```

## APIエンドポイント

### POST /api/v1/upload/url

署名付きアップロード URL を取得（認証必須）

**リクエストボディ:**

| フィールド | 型 | 必須 | 制約 | 説明 |
|-----------|-----|------|------|------|
| `fileName` | string | ✅ | 最大255文字 | ファイル名 |
| `contentType` | string | ✅ | 最大50文字 | MIMEタイプ |
| `fileSize` | int | ✅ | > 0 | ファイルサイズ（バイト） |

**レスポンス（200 OK）:**

```json
{
  "uploadUrl": "https://bucket.s3.amazonaws.com/avatars/uuid.png?X-Amz-...",
  "publicUrl": "https://bucket.s3.ap-northeast-1.amazonaws.com/avatars/uuid.png"
}
```

| フィールド | 説明 |
|-----------|------|
| `uploadUrl` | 署名付きアップロードURL（5分間有効） |
| `publicUrl` | アップロード後の公開URL |

**エラーレスポンス:**

| コード | 条件 |
|-------|------|
| `400` | 許可されていないContent-Type、ファイルサイズ超過 |
| `401` | 未認証 |
| `500` | S3エラー |

**バリデーション:**

- 許可 Content-Type: `image/png`, `image/jpeg`, `image/gif`, `image/webp`
- 最大ファイルサイズ: 5MB

## 実装詳細

### Domain層

なし（ストレージは Domain の関心事ではない）

### Application層

**インターフェース（`IStorageService`）:**

```python
class IStorageService(ABC):
    @abstractmethod
    def generate_upload_url(
        self, file_name: str, content_type: str, folder: str
    ) -> tuple[str, str]: ...

    @abstractmethod
    def delete_file(self, file_url: str) -> bool: ...
```

**DTO:**

- `UploadUrlDTO` - アップロードURL情報

**Usecaseメソッド:**

- `generate_avatar_upload_url()` - バリデーション + URL生成

### Infrastructure層

**S3ServiceImpl:**

- boto3 クライアント初期化（IAMロールまたは環境変数から認証情報取得）
- `generate_presigned_url()` で署名付きURL生成（5分有効）
- ユニークキー生成: `{folder}/{uuid}.{ext}`

**環境変数:**

| 変数 | 説明 | デフォルト |
|-----|------|-----------|
| `AWS_REGION` | AWSリージョン | `ap-northeast-1` |
| `S3_BUCKET_NAME` | S3バケット名 | - |
| `AWS_ACCESS_KEY_ID` | アクセスキー（オプション） | - |
| `AWS_SECRET_ACCESS_KEY` | シークレットキー（オプション） | - |

※ ECS/Lambda等のIAMロールがあれば `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` は不要

### Presentation層

**スキーマ:**

- `GetUploadUrlRequest` - リクエスト（alias でキャメルケース対応）
- `GetUploadUrlResponse` - レスポンス
- `ErrorResponse` - エラー

**API:**

- 認証: `get_current_user_from_cookie` で JWT Cookie 検証
- エラーハンドリング: `ValueError` → 400、その他 → 500

### DI層

```python
def get_upload_usecase() -> UploadUsecase:
    storage_service = S3ServiceImpl()
    return UploadUsecase(storage_service=storage_service)
```

## アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  upload_api.py ─→ GetUploadUrlRequest/Response               │
└──────────────────────────┬──────────────────────────────────┘
                           │ Depends(get_upload_usecase)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  UploadUsecase ─→ IStorageService (interface)                │
│                    UploadUrlDTO                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ DI: S3ServiceImpl
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                       │
│  S3ServiceImpl (boto3) ─→ AWS S3                             │
└─────────────────────────────────────────────────────────────┘
```

## フロー図

```
Browser                    Backend                     S3
   │                          │                        │
   │ POST /upload/url         │                        │
   │ {fileName, contentType}  │                        │
   │─────────────────────────>│                        │
   │                          │                        │
   │                          │ generate_presigned_url │
   │                          │───────────────────────>│
   │                          │<───────────────────────│
   │                          │                        │
   │ {uploadUrl, publicUrl}   │                        │
   │<─────────────────────────│                        │
   │                          │                        │
   │ PUT {uploadUrl}          │                        │
   │ (image binary)           │                        │
   │──────────────────────────────────────────────────>│
   │                          │                        │
   │ 200 OK                   │                        │
   │<──────────────────────────────────────────────────│
   │                          │                        │
   │ PUT /users/{id}          │                        │
   │ {avatarUrl: publicUrl}   │                        │
   │─────────────────────────>│                        │
   │                          │ save URL to DB         │
   │ 200 OK                   │                        │
   │<─────────────────────────│                        │
```

## 依存関係

**追加パッケージ:**

```
boto3==1.35.0
```

## AWS設定（必要な作業）

### 1. S3バケット作成

```bash
aws s3 mb s3://ghoona-camp-avatars --region ap-northeast-1
```

### 2. バケットポリシー（公開読み取り）

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadAvatars",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::ghoona-camp-avatars/avatars/*"
  }]
}
```

### 3. CORS設定

```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["PUT", "GET"],
  "AllowedOrigins": ["http://localhost:3004", "https://your-domain.com"],
  "ExposeHeaders": []
}]
```

### 4. IAMポリシー（バックエンド用）

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
    "Resource": "arn:aws:s3:::ghoona-camp-avatars/*"
  }]
}
```

## セキュリティ考慮

| 項目 | 対策 |
|-----|------|
| 認証 | JWT Cookie 必須 |
| ファイル検証 | Content-Type, サイズをサーバー側でバリデーション |
| URL有効期限 | 署名付きURLは5分間のみ有効 |
| 最小権限 | IAMポリシーで必要最小限の権限のみ付与 |
| パブリックアクセス | avatarsフォルダのみ公開読み取り可能 |

## 関連ドキュメント

- `docs/tasks/public/plan/002-s3/README.md` - 実装プラン
- `docs/tasks/public/knowledge/image-storage.md` - 画像保存方式ナレッジ

## 次のステップ

1. **AWS S3 設定** - バケット作成、CORS、IAM
2. **環境変数設定** - `.env` に `S3_BUCKET_NAME` を設定
3. **フロントエンド実装** - `AvatarField` の修正、`uploadApi` 追加
