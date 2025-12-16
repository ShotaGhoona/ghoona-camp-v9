# Ghoona Camp - Domain Services

## Overview
複数のエンティティにまたがるビジネスルールや、データベースアクセスが必要な制約をDomain Serviceで実装します。

## User Domain

### RivalService
**責務**: ライバル関係のビジネスルール管理
- ✅ライバル登録の3人制限チェック
- ✅自分自身をライバルに設定することの禁止
- ✅ユーザーの重複ライバル登録防止

## Title Domain

### TitleService
**責務**: 称号システムのビジネスロジック
- ✅称号獲得条件の判定（参加日数による称号レベル決定）
- ✅現在設定中の称号の一意性制御（他の称号をcurrentから外す）
- ✅称号進捗の計算（現在の参加日数と次の称号までの進捗）

## Event Domain

### EventService
**責務**: イベント管理のビジネスルール
- ✅イベント参加者数の上限チェック（max_participantsに対して）
- ✅同一ユーザーの重複参加防止
- ✅イベント開催時間の重複チェック（必要に応じて）
- ✅イベント作成者の自動参加登録
- ✅イベント作成者の参加キャンセル禁止

## Goal Domain

### GoalService
**責務**: 目標管理のビジネスルール
- ✅同一期間での目標の重複防止
- ✅目標の有効期間チェック（ended_at > started_at）

## Implementation Notes

### 原則
- Domain Serviceは状態を持たない（ステートレス）
- 複雑なビジネスルールのみをDomain Serviceに配置
- 単純なバリデーションはValue Objectで実装
- Domain Serviceは他のDomain Serviceに依存可能だが、循環依存は避ける

### 今後の拡張予定
- Discord連携時のAttendanceService強化
- リアルタイム機能実装時のイベント通知機能
- 統計データ計算の最適化