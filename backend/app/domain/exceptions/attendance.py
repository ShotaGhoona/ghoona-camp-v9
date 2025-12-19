"""ランキング関連のドメイン例外"""


class InvalidMonthError(Exception):
    """月が1-12の範囲外"""

    def __init__(self, month: int):
        self.month = month
        super().__init__(f'月は1-12の範囲で指定してください: {month}')
