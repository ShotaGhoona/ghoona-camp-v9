"""ユーザー関連のドメイン例外"""


class UserError(Exception):
    """ユーザーエラーの基底クラス"""

    pass


class UserNotFoundError(UserError):
    """ユーザーが見つからない"""

    pass


class UsernameAlreadyExistsError(UserError):
    """ユーザー名が既に使用されている"""

    pass


class ForbiddenError(UserError):
    """権限がない"""

    pass


# ========================================
# ライバル関連
# ========================================


class RivalNotFoundError(UserError):
    """ライバル関係が見つからない"""

    pass


class RivalAlreadyExistsError(UserError):
    """既にライバルとして登録済み"""

    pass


class RivalLimitExceededError(UserError):
    """ライバル登録上限（3人）を超過"""

    pass


class SelfRivalError(UserError):
    """自分自身をライバルに設定しようとした"""

    pass
