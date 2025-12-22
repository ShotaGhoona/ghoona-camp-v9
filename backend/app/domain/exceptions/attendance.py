"""参加関連のドメイン例外"""


class InvalidMonthError(Exception):
    """月が1-12の範囲外"""

    def __init__(self, month: int):
        self.month = month
        super().__init__(f'月は1-12の範囲で指定してください: {month}')


class InvalidDateRangeError(Exception):
    """日付範囲が不正"""

    def __init__(self, date_from: str, date_to: str):
        self.date_from = date_from
        self.date_to = date_to
        super().__init__(f'日付範囲が不正です: {date_from} - {date_to}')


class NotOwnAttendanceError(Exception):
    """他人の参加データにアクセス"""

    def __init__(self):
        super().__init__('自分の参加データのみ閲覧できます')
