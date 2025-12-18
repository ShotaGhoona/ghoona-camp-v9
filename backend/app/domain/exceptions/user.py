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
