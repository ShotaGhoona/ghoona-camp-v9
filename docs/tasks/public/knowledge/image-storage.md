# 画像の保存方式について

## 概要

Webアプリケーションで画像（プロフィール画像など）を扱う場合、いくつかの保存方式があります。それぞれにメリット・デメリットがあり、用途に応じて選択します。

---

## 1. 現在の実装（Base64方式）

### 仕組み

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant API as バックエンドAPI
    participant DB as データベース

    User->>Browser: 画像ファイル選択
    Browser->>Browser: Base64エンコード
    Note right of Browser: data:image/png;base64,iVBORw0K...
    Browser->>API: PUT /users/{id}<br/>{ avatarUrl: "data:image/png;base64,..." }
    API->>DB: avatarUrlカラムに保存
    DB-->>API: 保存完了
    API-->>Browser: 200 OK
```

**Base64とは？**
- バイナリデータ（画像など）を文字列に変換する方式
- 例: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...`

### メリット・デメリット

```mermaid
graph LR
    subgraph メリット
        A[実装がシンプル]
        B[外部サービス不要]
        C[1つのAPIで完結]
    end

    subgraph デメリット
        D[データサイズ+33%]
        E[DB負荷が高い]
        F[文字数制限に引っかかる]
        G[パフォーマンス低下]
    end
```

### 今回のエラー

```json
{
  "type": "string_too_long",
  "loc": ["body", "avatarUrl"],
  "msg": "String should have at most 2000 characters",
  "input": "data:image/png;base64,iVBORw0KGgo..." // 実際は数十万文字
}
```

小さな画像でも数万文字になるため、2000文字制限では足りない。

---

## 2. ファイルサーバー方式

### 仕組み

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant API as バックエンドAPI
    participant Disk as サーバーディスク
    participant DB as データベース

    User->>Browser: 画像ファイル選択
    Browser->>API: POST /upload<br/>multipart/form-data
    API->>Disk: ファイル保存<br/>/uploads/avatars/user123.png
    Disk-->>API: 保存完了
    API->>DB: URLを保存<br/>"/uploads/avatars/user123.png"
    API-->>Browser: { url: "/uploads/avatars/user123.png" }
```

### メリット・デメリット

| メリット | デメリット |
|---------|-----------|
| DBには短いURLだけ保存 | サーバーのディスク容量に依存 |
| 実装が比較的簡単 | スケールしにくい（サーバー増やすと画像が分散） |
| | サーバー障害で画像が消える可能性 |

---

## 3. S3方式（推奨）

### S3とは？

```mermaid
graph TB
    subgraph "Amazon S3"
        Bucket[バケット<br/>ghoona-camp-avatars]
        Bucket --> Folder1[avatars/]
        Bucket --> Folder2[thumbnails/]
        Folder1 --> File1[user123.png]
        Folder1 --> File2[user456.jpg]
    end

    subgraph "特徴"
        A[容量無制限]
        B[耐久性 99.999999999%]
        C[従量課金]
        D[CDN連携可能]
    end
```

**Amazon S3 (Simple Storage Service)**
- AWSが提供するオブジェクトストレージサービス
- ファイルを「バケット」という単位で管理

### 仕組み（署名付きURL方式）

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant API as バックエンドAPI
    participant S3 as Amazon S3
    participant DB as データベース

    User->>Browser: 1. 画像ファイル選択

    Browser->>API: 2. POST /upload-url<br/>{ fileName, contentType }
    Note over API: 署名付きURLを生成<br/>（5分間有効）
    API-->>Browser: 3. { uploadUrl, publicUrl }

    Browser->>S3: 4. PUT {uploadUrl}<br/>画像データを直接送信
    Note over S3: 画像を保存
    S3-->>Browser: 5. 200 OK

    Browser->>API: 6. PUT /users/{id}<br/>{ avatarUrl: publicUrl }
    API->>DB: 7. URLを保存
    DB-->>API: 保存完了
    API-->>Browser: 8. 200 OK
```

### なぜ「署名付きURL」を使うのか？

```mermaid
graph TB
    subgraph "❌ 直接アップロードの問題"
        A[ブラウザ] -->|AWSの認証情報が必要| B[S3]
        C[認証情報がブラウザに露出<br/>= セキュリティリスク]
    end

    subgraph "✅ 署名付きURLの解決策"
        D[ブラウザ] -->|1. URL要求| E[バックエンド]
        E -->|2. 署名付きURL生成<br/>有効期限: 5分| E
        E -->|3. 署名付きURLを返す| D
        D -->|4. 署名付きURLでアップロード<br/>認証情報不要！| F[S3]
    end
```

### コード例

**バックエンド（Python/FastAPI）**
```python
import boto3
from uuid import uuid4

s3_client = boto3.client('s3', region_name='ap-northeast-1')

@router.post("/upload-url")
async def get_upload_url(file_name: str, content_type: str):
    """署名付きアップロードURLを生成"""
    key = f"avatars/{uuid4()}-{file_name}"

    presigned_url = s3_client.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': 'ghoona-camp-avatars',
            'Key': key,
            'ContentType': content_type,
        },
        ExpiresIn=300  # 5分間有効
    )

    public_url = f"https://ghoona-camp-avatars.s3.ap-northeast-1.amazonaws.com/{key}"

    return {"uploadUrl": presigned_url, "publicUrl": public_url}
```

**フロントエンド（TypeScript）**
```typescript
async function uploadAvatar(file: File): Promise<string> {
  // 1. 署名付きURLを取得
  const { uploadUrl, publicUrl } = await api.post('/upload-url', {
    fileName: file.name,
    contentType: file.type,
  });

  // 2. S3に直接アップロード
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  // 3. 公開URLを返す
  return publicUrl;
}
```

### S3の料金目安（東京リージョン）

```mermaid
pie title 1000ユーザー × 1MB画像の月額コスト
    "ストレージ (約4円)" : 4
    "アップロード (約0.7円)" : 0.7
    "ダウンロード (約0.4円)" : 0.4
```

| 項目 | 料金 |
|------|------|
| ストレージ | $0.025/GB/月（約4円） |
| PUT（アップロード） | $0.0047/1000リクエスト |
| GET（ダウンロード） | $0.00037/1000リクエスト |

---

## 4. 方式比較表

```mermaid
graph LR
    subgraph "Base64"
        A1[実装: ★☆☆ 簡単]
        A2[スケール: ★☆☆ 低]
        A3[用途: プロトタイプ]
    end

    subgraph "ファイルサーバー"
        B1[実装: ★★☆ 普通]
        B2[スケール: ★★☆ 中]
        B3[用途: 中規模]
    end

    subgraph "S3"
        C1[実装: ★★★ やや複雑]
        C2[スケール: ★★★ 高]
        C3[用途: 本番環境]
    end
```

| 方式 | 実装難易度 | スケーラビリティ | コスト | 推奨用途 |
|------|-----------|----------------|--------|---------|
| Base64 | ★☆☆ | ★☆☆ | 無料 | プロトタイプ、小規模 |
| ファイルサーバー | ★★☆ | ★★☆ | サーバー費用 | 中規模、単一サーバー |
| S3 | ★★★ | ★★★ | 従量課金 | 本番環境、大規模 |

---

## 5. S3実装ステップ

### 全体の流れ

```mermaid
flowchart TD
    A[1. AWSアカウント作成] --> B[2. S3バケット作成]
    B --> C[3. バケットポリシー設定]
    C --> D[4. CORS設定]
    D --> E[5. IAMユーザー作成]
    E --> F[6. 環境変数設定]
    F --> G[7. バックエンドAPI実装]
    G --> H[8. フロントエンド実装]
```

### ステップ2: S3バケット作成

```bash
# AWS CLIで作成
aws s3 mb s3://ghoona-camp-avatars --region ap-northeast-1
```

### ステップ3: バケットポリシー設定

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ghoona-camp-avatars/avatars/*"
    }
  ]
}
```

### ステップ4: CORS設定

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "ExposeHeaders": []
  }
]
```

### ステップ5: IAMポリシー

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::ghoona-camp-avatars/*"
    }
  ]
}
```

---

## 6. セキュリティ考慮事項

```mermaid
flowchart TD
    subgraph "アップロード時の検証"
        A[ファイル受信] --> B{拡張子チェック}
        B -->|png,jpg,gif,webp| C{サイズチェック}
        B -->|その他| X[拒否]
        C -->|5MB以下| D{Content-Typeチェック}
        C -->|5MB超| X
        D -->|image/*| E[署名付きURL発行]
        D -->|その他| X
    end
```

### 検証コード例

```python
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image(file_name: str, file_size: int, content_type: str):
    ext = file_name.rsplit('.', 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("許可されていないファイル形式です")
    if file_size > MAX_FILE_SIZE:
        raise ValueError("ファイルサイズが大きすぎます")
    if not content_type.startswith('image/'):
        raise ValueError("画像ファイルではありません")
```

---

## 7. 今後の実装方針

```mermaid
timeline
    title 実装ロードマップ
    section 短期（暫定）
        avatarUrl文字数制限緩和 : DBカラム型をTEXTに変更
        Base64方式で動作確認
    section 中期（本番）
        S3バケット作成
        署名付きURLエンドポイント実装
        フロントエンドアップロード処理
    section 長期（最適化）
        CloudFront（CDN）連携
        Lambda + S3トリガーで画像リサイズ
        WebP変換で軽量化
```

---

## 参考リンク

- [Amazon S3 公式ドキュメント](https://docs.aws.amazon.com/s3/)
- [Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [boto3 (Python AWS SDK)](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
