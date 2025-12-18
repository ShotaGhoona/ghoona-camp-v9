# User API フロントエンド接続レポート

## 概要

メンバーページのダミーデータを実際のバックエンドAPIに接続。FSD構成に`domain`サブディレクトリを導入。

## 変更ファイル

```
frontend/src/
├── shared/types/api/
│   └── pagination.ts                 # Pagination型（共通）
├── entities/domain/user/
│   ├── model/types.ts                # 型定義
│   └── api/user-api.ts               # APIクライアント
├── features/domain/user/
│   ├── get-users/lib/use-users.ts    # 一覧取得hook
│   └── get-user-detail/lib/use-user-detail.ts  # 詳細取得hook
├── page-components/members/home/
│   ├── ui/MembersHomeContainer.tsx   # isLoading伝播
│   └── ui-block/gallery-view/ui/
│       ├── MembersGalleryView.tsx    # isLoading受け取り
│       ├── components/MemberCard.tsx # UserListItem型に変更
│       └── skeleton/
│           ├── MemberCardSkeleton.tsx
│           └── MembersGallerySkeleton.tsx
└── widgets/member/member-detail-modal/ui/
    ├── MemberDetailModalSheet.tsx    # useUserDetail使用
    ├── MemberDetailContent.tsx       # UserDetail型に変更
    └── skeleton/
        └── MemberDetailSkeleton.tsx
```

## 型定義

### 一覧用（UserListItem）
```typescript
{
  id: string;
  avatarUrl: string | null;
  displayName: string | null;
  tagline: string | null;
  currentTitleLevel: number;
}
```

### 詳細用（UserDetail）
```typescript
{
  id, username, avatarUrl, displayName, tagline, bio,
  skills[], interests[], vision, isVisionPublic,
  socialLinks[], totalAttendanceDays, currentStreakDays,
  maxStreakDays, currentTitleLevel, joinedAt
}
```

## 実装パターン

### FSD構成
- `entities/domain/` - ドメインエンティティ・API
- `features/domain/` - ドメイン機能（React Query hooks）
- `shared/types/api/` - 共通API型（Pagination等）

### ローディング
- `isLoading`を子コンポーネントに伝播
- 各コンポーネント内で`skeleton/`配下のスケルトンを表示

### 型変換
- `currentTitleLevel`（number）→ `getTitleByLevel()`で称号名取得
