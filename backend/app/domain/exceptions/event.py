"""イベント関連のドメイン例外"""


class EventNotFoundError(Exception):
    """イベントが見つからない"""

    pass


class EventForbiddenError(Exception):
    """イベントへのアクセス権限がない（主催者ではない）"""

    pass


class EventFullError(Exception):
    """イベントの定員に達している"""

    def __init__(self, event_id: str, max_participants: int):
        self.event_id = event_id
        self.max_participants = max_participants
        super().__init__(f'イベントの定員({max_participants}人)に達しています')


class AlreadyParticipatingError(Exception):
    """既にイベントに参加済み"""

    pass


class NotParticipatingError(Exception):
    """イベントに参加していない"""

    pass


class InvalidEventTypeError(Exception):
    """イベントタイプが不正"""

    def __init__(self, event_type: str):
        self.event_type = event_type
        super().__init__(f'無効なイベントタイプです: {event_type}')


class InvalidMonthError(Exception):
    """月が1-12の範囲外"""

    def __init__(self, month: int):
        self.month = month
        super().__init__(f'月は1-12の範囲で指定してください: {month}')
