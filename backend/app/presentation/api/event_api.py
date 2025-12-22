"""イベント関連のAPIエンドポイント"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.schemas.event_schemas import CreateEventInputDTO, UpdateEventInputDTO
from app.application.use_cases.event_usecase import EventUsecase
from app.di.event import get_event_usecase
from app.domain.exceptions.event import (
    AlreadyParticipatingError,
    EventForbiddenError,
    EventFullError,
    EventNotFoundError,
    InvalidEventTypeError,
    InvalidMonthError,
    NotParticipatingError,
)
from app.infrastructure.security.security_service_impl import (
    User,
    get_current_user_from_cookie,
)
from app.presentation.schemas.event_schemas import (
    CreateEventAPIResponse,
    CreateEventDataResponse,
    CreateEventRequest,
    DeleteEventAPIResponse,
    DeleteEventDataResponse,
    ErrorResponse,
    EventCreatorResponse,
    EventDetailAPIResponse,
    EventDetailDataResponse,
    EventDetailResponse,
    EventListAPIResponse,
    EventListDataResponse,
    EventListItemResponse,
    EventParticipantResponse,
    JoinEventAPIResponse,
    LeaveEventAPIResponse,
    LeaveEventDataResponse,
    MyEventItemResponse,
    MyEventsAPIResponse,
    MyEventsDataResponse,
    ParticipantResultResponse,
    UpdateEventAPIResponse,
    UpdateEventDataResponse,
    UpdateEventRequest,
)

router = APIRouter(prefix='/events', tags=['events'])


# ========================================
# イベント一覧
# ========================================


@router.get(
    '',
    response_model=EventListAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def get_events(
    year: int = Query(..., ge=2000, le=2100, description='対象年（例: 2025）'),
    month: int = Query(..., ge=1, le=12, description='対象月（1-12）'),
    event_type: str | None = Query(
        None,
        description='イベントタイプでフィルタリング（カンマ区切り、例: study,exercise）',
    ),
    participated: bool | None = Query(
        None,
        description='参加状態でフィルタリング（true=参加済みのみ, false=未参加のみ）',
    ),
    current_user: User = Depends(get_current_user_from_cookie),
    event_usecase: EventUsecase = Depends(get_event_usecase),
) -> EventListAPIResponse:
    """
    イベント一覧を取得

    月ベースでイベント一覧を返す。カレンダー/ギャラリービューで使用。
    """
    # event_typeをリストに変換
    event_types = None
    if event_type:
        event_types = [et.strip() for et in event_type.split(',')]

    try:
        result = event_usecase.get_events_by_month(
            current_user_id=current_user.id,
            year=year,
            month=month,
            event_types=event_types,
            participated=participated,
        )
    except InvalidMonthError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'INVALID_MONTH',
                'message': str(e),
            },
        ) from e
    except InvalidEventTypeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'INVALID_EVENT_TYPE',
                'message': str(e),
            },
        ) from e

    # レスポンス変換
    events_response = [
        EventListItemResponse(
            id=event.id,
            title=event.title,
            eventType=event.event_type,
            scheduledDate=event.scheduled_date,
            startTime=event.start_time,
            endTime=event.end_time,
            maxParticipants=event.max_participants,
            participantCount=event.participant_count,
            isParticipating=event.is_participating,
            isRecurring=event.is_recurring,
            creator=EventCreatorResponse(
                id=event.creator.id,
                displayName=event.creator.display_name,
                avatarUrl=event.creator.avatar_url,
            ),
        )
        for event in result.events
    ]

    return EventListAPIResponse(
        data=EventListDataResponse(events=events_response)
    )


# ========================================
# 自分のイベント取得
# ========================================


@router.get(
    '/me',
    response_model=MyEventsAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def get_my_events(
    year: int = Query(..., ge=2000, le=2100, description='対象年'),
    month: int = Query(..., ge=1, le=12, description='対象月'),
    current_user: User = Depends(get_current_user_from_cookie),
    event_usecase: EventUsecase = Depends(get_event_usecase),
) -> MyEventsAPIResponse:
    """
    自分が参加登録または主催しているイベント一覧を取得

    カレンダーのイベントカード表示に使用。
    """
    try:
        result = event_usecase.get_my_events(
            current_user_id=current_user.id,
            year=year,
            month=month,
        )
    except InvalidMonthError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'INVALID_MONTH',
                'message': str(e),
            },
        ) from e

    # レスポンス変換
    events_response = [
        MyEventItemResponse(
            id=event.id,
            title=event.title,
            eventType=event.event_type,
            scheduledDate=event.scheduled_date,
            startTime=event.start_time,
            endTime=event.end_time,
            role=event.role,
            maxParticipants=event.max_participants,
            participantCount=event.participant_count,
        )
        for event in result.events
    ]

    return MyEventsAPIResponse(
        data=MyEventsDataResponse(events=events_response)
    )


# ========================================
# イベント詳細
# ========================================


@router.get(
    '/{event_id}',
    response_model=EventDetailAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        404: {'model': ErrorResponse, 'description': 'イベントが見つからない'},
    },
)
def get_event_detail(
    event_id: UUID,
    current_user: User = Depends(get_current_user_from_cookie),
    event_usecase: EventUsecase = Depends(get_event_usecase),
) -> EventDetailAPIResponse:
    """
    イベント詳細を取得

    参加者一覧、主催者情報を含む詳細情報を返す。
    """
    try:
        result = event_usecase.get_event_detail(
            event_id=str(event_id),
            current_user_id=current_user.id,
        )
    except EventNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定されたイベントが見つかりません',
            },
        ) from e

    # レスポンス変換
    event_response = EventDetailResponse(
        id=result.id,
        title=result.title,
        description=result.description,
        eventType=result.event_type,
        scheduledDate=result.scheduled_date,
        startTime=result.start_time,
        endTime=result.end_time,
        maxParticipants=result.max_participants,
        participantCount=result.participant_count,
        isRecurring=result.is_recurring,
        recurrencePattern=result.recurrence_pattern,
        creator=EventCreatorResponse(
            id=result.creator.id,
            displayName=result.creator.display_name,
            avatarUrl=result.creator.avatar_url,
        ),
        participants=[
            EventParticipantResponse(
                id=p.id,
                userId=p.user_id,
                userName=p.user_name,
                avatarUrl=p.avatar_url,
                status=p.status,
            )
            for p in result.participants
        ],
        isOwner=result.is_owner,
        isParticipating=result.is_participating,
        createdAt=result.created_at,
    )

    return EventDetailAPIResponse(
        data=EventDetailDataResponse(event=event_response)
    )


# ========================================
# イベント作成
# ========================================


@router.post(
    '',
    response_model=CreateEventAPIResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def create_event(
    request: CreateEventRequest,
    current_user: User = Depends(get_current_user_from_cookie),
    event_usecase: EventUsecase = Depends(get_event_usecase),
) -> CreateEventAPIResponse:
    """
    新しいイベントを作成

    タイトル、日時、イベントタイプ等を指定してイベントを作成。
    """
    # リクエストをDTOに変換
    input_dto = CreateEventInputDTO(
        title=request.title,
        description=request.description,
        eventType=request.eventType,
        scheduledDate=request.scheduledDate,
        startTime=request.startTime,
        endTime=request.endTime,
        maxParticipants=request.maxParticipants if request.maxParticipants else None,
        isRecurring=request.isRecurring,
        recurrencePattern=request.recurrencePattern,
    )

    try:
        result = event_usecase.create_event(
            current_user_id=current_user.id,
            input_dto=input_dto,
        )
    except InvalidEventTypeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'INVALID_EVENT_TYPE',
                'message': str(e),
            },
        ) from e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'VALIDATION_ERROR',
                'message': str(e),
            },
        ) from e

    # レスポンス変換
    event_response = EventDetailResponse(
        id=result.id,
        title=result.title,
        description=result.description,
        eventType=result.event_type,
        scheduledDate=result.scheduled_date,
        startTime=result.start_time,
        endTime=result.end_time,
        maxParticipants=result.max_participants,
        participantCount=result.participant_count,
        isRecurring=result.is_recurring,
        recurrencePattern=result.recurrence_pattern,
        creator=EventCreatorResponse(
            id=result.creator.id,
            displayName=result.creator.display_name,
            avatarUrl=result.creator.avatar_url,
        ),
        participants=[
            EventParticipantResponse(
                id=p.id,
                userId=p.user_id,
                userName=p.user_name,
                avatarUrl=p.avatar_url,
                status=p.status,
            )
            for p in result.participants
        ],
        isOwner=result.is_owner,
        isParticipating=result.is_participating,
        createdAt=result.created_at,
    )

    return CreateEventAPIResponse(
        data=CreateEventDataResponse(event=event_response)
    )


# ========================================
# イベント更新
# ========================================


@router.put(
    '/{event_id}',
    response_model=UpdateEventAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        403: {'model': ErrorResponse, 'description': '権限エラー'},
        404: {'model': ErrorResponse, 'description': 'イベントが見つからない'},
        400: {'model': ErrorResponse, 'description': 'バリデーションエラー'},
    },
)
def update_event(
    event_id: UUID,
    request: UpdateEventRequest,
    current_user: User = Depends(get_current_user_from_cookie),
    event_usecase: EventUsecase = Depends(get_event_usecase),
) -> UpdateEventAPIResponse:
    """
    イベントを更新

    主催者のみ更新可能。部分更新に対応。
    """
    # リクエストをDTOに変換
    input_dto = UpdateEventInputDTO(
        title=request.title,
        description=request.description,
        eventType=request.eventType,
        scheduledDate=request.scheduledDate,
        startTime=request.startTime,
        endTime=request.endTime,
        maxParticipants=request.maxParticipants,
        isRecurring=request.isRecurring,
        recurrencePattern=request.recurrencePattern,
    )

    try:
        result = event_usecase.update_event(
            event_id=str(event_id),
            current_user_id=current_user.id,
            input_dto=input_dto,
        )
    except EventNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定されたイベントが見つかりません',
            },
        ) from e
    except EventForbiddenError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'code': 'FORBIDDEN',
                'message': 'このイベントを更新する権限がありません',
            },
        ) from e
    except InvalidEventTypeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'INVALID_EVENT_TYPE',
                'message': str(e),
            },
        ) from e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'VALIDATION_ERROR',
                'message': str(e),
            },
        ) from e

    # レスポンス変換
    event_response = EventDetailResponse(
        id=result.id,
        title=result.title,
        description=result.description,
        eventType=result.event_type,
        scheduledDate=result.scheduled_date,
        startTime=result.start_time,
        endTime=result.end_time,
        maxParticipants=result.max_participants,
        participantCount=result.participant_count,
        isRecurring=result.is_recurring,
        recurrencePattern=result.recurrence_pattern,
        creator=EventCreatorResponse(
            id=result.creator.id,
            displayName=result.creator.display_name,
            avatarUrl=result.creator.avatar_url,
        ),
        participants=[
            EventParticipantResponse(
                id=p.id,
                userId=p.user_id,
                userName=p.user_name,
                avatarUrl=p.avatar_url,
                status=p.status,
            )
            for p in result.participants
        ],
        isOwner=result.is_owner,
        isParticipating=result.is_participating,
        createdAt=result.created_at,
    )

    return UpdateEventAPIResponse(
        data=UpdateEventDataResponse(event=event_response)
    )


# ========================================
# イベント削除
# ========================================


@router.delete(
    '/{event_id}',
    response_model=DeleteEventAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        403: {'model': ErrorResponse, 'description': '権限エラー'},
        404: {'model': ErrorResponse, 'description': 'イベントが見つからない'},
    },
)
def delete_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user_from_cookie),
    event_usecase: EventUsecase = Depends(get_event_usecase),
) -> DeleteEventAPIResponse:
    """
    イベントを削除

    主催者のみ削除可能。
    """
    try:
        event_usecase.delete_event(
            event_id=str(event_id),
            current_user_id=current_user.id,
        )
    except EventNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定されたイベントが見つかりません',
            },
        ) from e
    except EventForbiddenError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'code': 'FORBIDDEN',
                'message': 'このイベントを削除する権限がありません',
            },
        ) from e

    return DeleteEventAPIResponse(data=DeleteEventDataResponse())


# ========================================
# イベント参加
# ========================================


@router.post(
    '/{event_id}/participants',
    response_model=JoinEventAPIResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': '既に参加済み'},
        404: {'model': ErrorResponse, 'description': 'イベントが見つからない'},
        409: {'model': ErrorResponse, 'description': '定員に達している'},
    },
)
def join_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user_from_cookie),
    event_usecase: EventUsecase = Depends(get_event_usecase),
) -> JoinEventAPIResponse:
    """
    イベントに参加申込

    定員チェックを行い、空きがあれば参加登録。
    """
    try:
        result = event_usecase.join_event(
            event_id=str(event_id),
            current_user_id=current_user.id,
        )
    except EventNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定されたイベントが見つかりません',
            },
        ) from e
    except AlreadyParticipatingError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'ALREADY_PARTICIPATING',
                'message': '既にこのイベントに参加しています',
            },
        ) from e
    except EventFullError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                'code': 'EVENT_FULL',
                'message': str(e),
            },
        ) from e

    return JoinEventAPIResponse(
        data=ParticipantResultResponse(
            eventId=result.event_id,
            userId=result.user_id,
            status=result.status,
            createdAt=result.created_at,
        )
    )


# ========================================
# イベント参加キャンセル
# ========================================


@router.delete(
    '/{event_id}/participants',
    response_model=LeaveEventAPIResponse,
    responses={
        401: {'model': ErrorResponse, 'description': '認証エラー'},
        400: {'model': ErrorResponse, 'description': '参加していない'},
        404: {'model': ErrorResponse, 'description': 'イベントが見つからない'},
    },
)
def leave_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user_from_cookie),
    event_usecase: EventUsecase = Depends(get_event_usecase),
) -> LeaveEventAPIResponse:
    """
    イベント参加をキャンセル

    自分の参加をキャンセル。
    """
    try:
        event_usecase.leave_event(
            event_id=str(event_id),
            current_user_id=current_user.id,
        )
    except EventNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                'code': 'NOT_FOUND',
                'message': '指定されたイベントが見つかりません',
            },
        ) from e
    except NotParticipatingError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                'code': 'NOT_PARTICIPATING',
                'message': 'このイベントに参加していません',
            },
        ) from e

    return LeaveEventAPIResponse(data=LeaveEventDataResponse())
