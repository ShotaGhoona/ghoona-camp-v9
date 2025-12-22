"""イベント関連のPresentation層スキーマ（リクエスト/レスポンス）"""

from pydantic import BaseModel, Field

from app.presentation.schemas.common import BaseAPIResponse, ErrorResponse

# ErrorResponseを再エクスポート（後方互換性のため）
__all__ = ['ErrorResponse']


# ========================================
# 共通レスポンスモデル
# ========================================


class EventCreatorResponse(BaseModel):
    """イベント主催者レスポンス"""

    id: str
    displayName: str | None
    avatarUrl: str | None


class EventParticipantResponse(BaseModel):
    """イベント参加者レスポンス"""

    id: str
    userId: str
    userName: str | None
    avatarUrl: str | None
    status: str


class EventListItemResponse(BaseModel):
    """イベント一覧アイテムレスポンス"""

    id: str
    title: str
    eventType: str
    scheduledDate: str
    startTime: str
    endTime: str
    maxParticipants: int | None
    participantCount: int
    isParticipating: bool
    isRecurring: bool
    creator: EventCreatorResponse


class EventDetailResponse(BaseModel):
    """イベント詳細レスポンス"""

    id: str
    title: str
    description: str | None
    eventType: str
    scheduledDate: str
    startTime: str
    endTime: str
    maxParticipants: int | None
    participantCount: int
    isRecurring: bool
    recurrencePattern: str | None
    creator: EventCreatorResponse
    participants: list[EventParticipantResponse]
    isOwner: bool
    isParticipating: bool
    createdAt: str


# ========================================
# イベント一覧
# ========================================


class EventListDataResponse(BaseModel):
    """イベント一覧データレスポンス"""

    events: list[EventListItemResponse]


class EventListAPIResponse(BaseAPIResponse[EventListDataResponse]):
    """イベント一覧APIレスポンス"""

    pass


# ========================================
# イベント詳細
# ========================================


class EventDetailDataResponse(BaseModel):
    """イベント詳細データレスポンス"""

    event: EventDetailResponse


class EventDetailAPIResponse(BaseAPIResponse[EventDetailDataResponse]):
    """イベント詳細APIレスポンス"""

    pass


# ========================================
# イベント作成
# ========================================


class CreateEventRequest(BaseModel):
    """イベント作成リクエスト"""

    title: str = Field(..., description='イベント名', max_length=200)
    description: str | None = Field(None, description='説明文')
    eventType: str = Field(..., description='イベントタイプ')
    scheduledDate: str = Field(..., description='開催日 (YYYY-MM-DD)')
    startTime: str = Field(..., description='開始時間 (HH:MM)')
    endTime: str = Field(..., description='終了時間 (HH:MM)')
    maxParticipants: int | None = Field(None, description='定員（0またはnullで無制限）')
    isRecurring: bool = Field(False, description='定期開催フラグ')
    recurrencePattern: str | None = Field(None, description='繰り返しパターン')


class CreateEventDataResponse(BaseModel):
    """イベント作成データレスポンス"""

    event: EventDetailResponse


class CreateEventAPIResponse(BaseAPIResponse[CreateEventDataResponse]):
    """イベント作成APIレスポンス"""

    message: str = 'イベントを作成しました'


# ========================================
# イベント更新
# ========================================


class UpdateEventRequest(BaseModel):
    """イベント更新リクエスト（部分更新）"""

    title: str | None = Field(None, description='イベント名', max_length=200)
    description: str | None = Field(None, description='説明文')
    eventType: str | None = Field(None, description='イベントタイプ')
    scheduledDate: str | None = Field(None, description='開催日 (YYYY-MM-DD)')
    startTime: str | None = Field(None, description='開始時間 (HH:MM)')
    endTime: str | None = Field(None, description='終了時間 (HH:MM)')
    maxParticipants: int | None = Field(None, description='定員')
    isRecurring: bool | None = Field(None, description='定期開催フラグ')
    recurrencePattern: str | None = Field(None, description='繰り返しパターン')


class UpdateEventDataResponse(BaseModel):
    """イベント更新データレスポンス"""

    event: EventDetailResponse


class UpdateEventAPIResponse(BaseAPIResponse[UpdateEventDataResponse]):
    """イベント更新APIレスポンス"""

    message: str = 'イベントを更新しました'


# ========================================
# イベント削除
# ========================================


class DeleteEventDataResponse(BaseModel):
    """イベント削除データレスポンス"""

    pass


class DeleteEventAPIResponse(BaseAPIResponse[DeleteEventDataResponse]):
    """イベント削除APIレスポンス"""

    message: str = 'イベントを削除しました'


# ========================================
# イベント参加
# ========================================


class ParticipantResultResponse(BaseModel):
    """参加結果レスポンス"""

    eventId: str
    userId: str
    status: str
    createdAt: str


class JoinEventAPIResponse(BaseAPIResponse[ParticipantResultResponse]):
    """イベント参加APIレスポンス"""

    message: str = 'イベントに参加しました'


# ========================================
# イベント参加キャンセル
# ========================================


class LeaveEventDataResponse(BaseModel):
    """参加キャンセルデータレスポンス"""

    pass


class LeaveEventAPIResponse(BaseAPIResponse[LeaveEventDataResponse]):
    """参加キャンセルAPIレスポンス"""

    message: str = '参加をキャンセルしました'


# ========================================
# 自分のイベント取得
# ========================================


class MyEventItemResponse(BaseModel):
    """自分のイベントアイテムレスポンス"""

    id: str
    title: str
    eventType: str
    scheduledDate: str
    startTime: str
    endTime: str
    role: str  # 'participant' or 'organizer'
    maxParticipants: int | None
    participantCount: int


class MyEventsDataResponse(BaseModel):
    """自分のイベントデータレスポンス"""

    events: list[MyEventItemResponse]


class MyEventsAPIResponse(BaseAPIResponse[MyEventsDataResponse]):
    """自分のイベントAPIレスポンス"""

    pass
