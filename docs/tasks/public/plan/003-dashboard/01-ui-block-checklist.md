# ダッシュボード ui-block 導入チェックリスト

## 概要

各ページで実装済みのui-blockをダッシュボードに導入する際のチェックリスト。
ダッシュボードではデータフェッチを行うラッパーコンポーネントを作成し、プレゼンテーションコンポーネントをラップする形式で導入する。

## 導入済み

| ブロック名 | 元ページ | ラッパー | 状態 |
|-----------|---------|---------|------|
| CurrentTitleCard | タイトル | CurrentTitleBlock | ✅ 完了 |
| TitleJourneyProgress | タイトル | TitleJourneyBlock | ✅ 完了 |
| UserStatsCard | タイトル | UserStatsBlock | ✅ 完了 |

---

## 導入候補

### 高優先度（ダッシュボード向き）

#### 1. StatsCardsSection（参加統計カード群）
- **元ページ**: 参加履歴ページ（Activity）
- **コンポーネント**: `page-components/activity/home/ui-block/stats-cards/ui/StatsCardsSection.tsx`
- **必要なデータ**: `useAttendanceStatistics(userId)`
- **表示内容**: 総参加日数、連続参加、最大連続、今月の参加
- **推奨サイズ**: W: 4-6, H: 3-4
- [ ] ラッパー作成
- [ ] block-config追加
- [ ] types追加
- [ ] BlockRenderContent追加

#### 2. RankingColumn（ランキング列）
- **元ページ**: ランキングページ
- **コンポーネント**: `page-components/ranking/home/ui-block/ranking-list/ui/RankingColumn.tsx`
- **必要なデータ**: `useRankings()`
- **表示内容**: 月間/総合/連続ランキング（各列個別に配置可能）
- **推奨サイズ**: W: 3-4, H: 4-6
- [ ] ラッパー作成（monthly/total/streakそれぞれ）
- [ ] block-config追加
- [ ] types追加
- [ ] BlockRenderContent追加

#### 3. TitleGallery（称号ギャラリー）
- **元ページ**: タイトルページ
- **コンポーネント**: `page-components/titles/home/ui-block/title-gallery/ui/TitleGallery.tsx`
- **必要なデータ**: `useUserTitleAchievements(userId)` + `TITLE_MASTER`
- **表示内容**: 全称号のギャラリー（横スクロール）
- **推奨サイズ**: W: 8-12, H: 3-4
- [ ] ラッパー作成
- [ ] block-config追加
- [ ] types追加
- [ ] BlockRenderContent追加

---

### 中優先度（ウィジェット向き）

#### 4. GoalsSidebar / SidebarGoalCard（みんなの目標）
- **元ページ**: ゴールページ
- **コンポーネント**: `page-components/goals/home/ui-block/goals-sidebar/ui/GoalsSidebar.tsx`
- **必要なデータ**: `usePublicGoals()`
- **表示内容**: 他メンバーの公開目標リスト
- **推奨サイズ**: W: 3-4, H: 3-5
- [ ] ラッパー作成
- [ ] block-config追加
- [ ] types追加
- [ ] BlockRenderContent追加

#### 5. GoalsTimelineView（自分の目標タイムライン）
- **元ページ**: ゴールページ
- **コンポーネント**: `page-components/goals/home/ui-block/timeline-view/ui/GoalsTimelineView.tsx`
- **必要なデータ**: `useMyGoals()`
- **表示内容**: 自分の目標をタイムライン形式で表示
- **推奨サイズ**: W: 6-12, H: 3-5
- **注意**: 月ナビゲーション含む場合はラッパーで状態管理必要
- [ ] ラッパー作成
- [ ] block-config追加
- [ ] types追加
- [ ] BlockRenderContent追加

#### 6. EventsGalleryView / EventCard（イベント一覧）
- **元ページ**: イベントページ
- **コンポーネント**: `page-components/events/home/ui-block/gallery-view/ui/EventsGalleryView.tsx`
- **必要なデータ**: `useEvents({ year, month })`
- **表示内容**: イベントカードのグリッド表示
- **推奨サイズ**: W: 6-12, H: 3-5
- **注意**: 月フィルターはラッパーで管理
- [ ] ラッパー作成
- [ ] block-config追加
- [ ] types追加
- [ ] BlockRenderContent追加

#### 7. ActivityCalendarView（参加カレンダー）
- **元ページ**: 参加履歴ページ
- **コンポーネント**: `page-components/activity/home/ui-block/calendar-view/ui/ActivityCalendarView.tsx`
- **必要なデータ**: `useMyEvents({ year, month })`
- **表示内容**: 自分が参加したイベントをカレンダー表示
- **推奨サイズ**: W: 6-12, H: 4-6
- **注意**: CalendarViewWidget使用、月ナビゲーション必要
- [ ] ラッパー作成
- [ ] block-config追加
- [ ] types追加
- [ ] BlockRenderContent追加

---

### 低優先度（複雑 or 大きすぎる）

#### 8. MembersGalleryView（メンバーギャラリー）
- **元ページ**: メンバーページ
- **理由**: フィルター機能含むと複雑、サイズが大きい
- **検討**: 簡易版（トップ6メンバー表示など）なら可能

#### 9. EventsCalendarView（イベントカレンダー）
- **元ページ**: イベントページ
- **理由**: CalendarViewWidget使用、月ナビゲーション必要
- **検討**: ActivityCalendarViewと機能重複

---

## 導入優先順位（推奨）

1. **StatsCardsSection** - ダッシュボードに最適、統計情報のサマリー
2. **RankingColumn (monthly)** - 今月のランキングは関心が高い
3. **TitleGallery** - 称号進捗の可視化
4. **GoalsSidebar** - モチベーション向上
5. **EventsGalleryView** - 直近のイベント確認

---

## ファイル構成（1ブロックあたり）

```
dashboard/home/ui-block/
└── {block-name}-block/
    └── ui/
        └── {BlockName}Block.tsx  # ラッパー（データフェッチ）
```

**更新が必要なファイル:**
- `model/types.ts` - DashboardBlockType追加
- `config/block-config.ts` - BLOCK_CONFIGS追加
- `ui/components/BlockRenderContent.tsx` - import + case追加
