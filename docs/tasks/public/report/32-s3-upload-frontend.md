# S3 画像アップロード フロントエンド実装レポート

## 概要

プロフィール画像を S3 に直接アップロードする機能をフロントエンドに実装。
Base64 方式から署名付き URL 方式に移行。

## 背景

```
Before: ファイル選択 → Base64変換 → avatarUrl フィールドに保存 → 422エラー
After:  ファイル選択 → S3直接アップロード → 公開URLを avatarUrl に保存
```

## 変更ファイル

```
frontend/src/
├── shared/
│   ├── api/
│   │   └── upload/
│   │       └── upload-api.ts           # NEW: アップロードAPIクライアント
│   ├── lib/
│   │   └── upload/
│   │       └── upload-to-s3.ts         # NEW: S3アップロードユーティリティ
│   └── ui/
│       └── form-fields/
│           └── ui/
│               └── AvatarField.tsx     # MOD: S3アップロード対応
```

## 実装詳細

### 1. upload-api.ts

バックエンド `/api/v1/upload/url` を呼び出すAPIクライアント。

```typescript
export interface GetUploadUrlRequest {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface GetUploadUrlResponse {
  uploadUrl: string;   // 署名付きアップロードURL
  publicUrl: string;   // 公開URL
}

export const uploadApi = {
  getUploadUrl: async (request: GetUploadUrlRequest): Promise<GetUploadUrlResponse>
};
```

### 2. upload-to-s3.ts

ファイルを S3 にアップロードするユーティリティ関数。

```typescript
export async function uploadImageToS3(file: File): Promise<string> {
  // 1. 署名付きURLを取得
  const { uploadUrl, publicUrl } = await uploadApi.getUploadUrl({
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
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

### 3. AvatarField.tsx 修正

**変更点:**

| 項目 | Before | After |
|-----|--------|-------|
| エンコード方式 | Base64 (FileReader) | S3直接アップロード |
| ローディング | なし | Loader2 スピナー |
| accept属性 | `image/*` | 具体的なMIMEタイプ |
| 非同期処理 | 同期的 | async/await |

**主な変更:**

```diff
- import { useRef } from 'react';
- import { Camera, User } from 'lucide-react';
+ import { useRef, useState } from 'react';
+ import { Camera, User, Loader2 } from 'lucide-react';
+ import { uploadImageToS3 } from '@/shared/lib/upload/upload-to-s3';

  export function AvatarField({ ... }) {
    const inputRef = useRef<HTMLInputElement>(null);
+   const [isUploading, setIsUploading] = useState(false);

-   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
-     const file = e.target.files?.[0];
-     if (file) {
-       const reader = new FileReader();
-       reader.onload = (event) => {
-         onChange(event.target?.result as string);
-       };
-       reader.readAsDataURL(file);
-     }
-   };
+   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
+     const file = e.target.files?.[0];
+     if (!file) return;
+
+     try {
+       setIsUploading(true);
+       const publicUrl = await uploadImageToS3(file);
+       onChange(publicUrl);
+     } catch (error) {
+       console.error('Upload failed:', error);
+     } finally {
+       setIsUploading(false);
+     }
+   };
```

**UI変更:**

- アップロード中は Loader2 スピナーを表示
- disabled 状態にアップロード中を追加
- accept 属性を `image/png,image/jpeg,image/gif,image/webp` に限定

## フロー図

```
AvatarField                uploadApi              Backend              S3
    │                          │                     │                  │
    │ handleFileChange()       │                     │                  │
    │ setIsUploading(true)     │                     │                  │
    │                          │                     │                  │
    │ uploadImageToS3(file)    │                     │                  │
    │─────────────────────────>│                     │                  │
    │                          │                     │                  │
    │                          │ POST /upload/url    │                  │
    │                          │────────────────────>│                  │
    │                          │                     │                  │
    │                          │ {uploadUrl,         │                  │
    │                          │  publicUrl}         │                  │
    │                          │<────────────────────│                  │
    │                          │                     │                  │
    │                          │ fetch(uploadUrl)    │                  │
    │                          │─────────────────────────────────────────>│
    │                          │                     │                  │
    │                          │ 200 OK              │                  │
    │                          │<─────────────────────────────────────────│
    │                          │                     │                  │
    │ publicUrl                │                     │                  │
    │<─────────────────────────│                     │                  │
    │                          │                     │                  │
    │ onChange(publicUrl)      │                     │                  │
    │ setIsUploading(false)    │                     │                  │
    │                          │                     │                  │
```

## コンポーネント階層

```
ProfileSheet
  └── AvatarField
        ├── uploadImageToS3()  ←── S3アップロード
        │     └── uploadApi.getUploadUrl()
        │           └── httpClient.post('/api/v1/upload/url')
        └── onChange(publicUrl)  ←── 親に通知

ProfileSheet
  └── handleSubmit()
        └── userApi.updateUser({ avatarUrl: publicUrl })
              └── httpClient.put('/api/v1/users/{id}')
```

## 状態管理

| 状態 | 型 | 用途 |
|-----|-----|------|
| `value` | `string \| null` | 現在のアバターURL（props） |
| `isUploading` | `boolean` | アップロード中フラグ |

## エラーハンドリング

| エラー | 対応 |
|-------|------|
| ファイル未選択 | 早期リターン |
| アップロード失敗 | console.error + finally でローディング解除 |
| 認証エラー (401) | httpClient インターセプターでログインページへリダイレクト |

**TODO:**
- Toast 通知でユーザーにエラーを表示

## ファイル制限

バックエンドでバリデーション済み、フロントエンドでも accept 属性で制限。

| 項目 | 制限 |
|-----|------|
| Content-Type | `image/png`, `image/jpeg`, `image/gif`, `image/webp` |
| ファイルサイズ | 5MB（バックエンドで検証） |

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `shared/api/client/http-client.ts` | Axiosインスタンス（Cookie認証） |
| `features/domain/user/update-profile/ui/ProfileSheet.tsx` | プロフィール編集シート |
| `features/domain/user/update-profile/lib/use-update-profile.ts` | プロフィール更新Hook |

## 関連ドキュメント

- `docs/tasks/public/report/31-s3-upload-backend.md` - バックエンド実装レポート
- `docs/tasks/public/plan/002-s3/README.md` - 実装プラン
- `docs/tasks/public/knowledge/image-storage.md` - 画像保存方式ナレッジ

## 動作確認手順

1. AWS S3 バケット作成・CORS設定
2. バックエンド `.env` に `S3_BUCKET_NAME` 設定
3. Docker コンテナ再起動（`docker compose up -d --build`）
4. プロフィール設定シートを開く
5. アバター画像をクリックして画像を選択
6. スピナー表示 → アップロード完了 → 画像表示確認
7. 保存ボタンで DB に URL が保存されることを確認
