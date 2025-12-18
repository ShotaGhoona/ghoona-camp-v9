"""認証関連のドメイン例外"""


class AuthError(Exception):
    """認証エラーの基底クラス"""

    pass


class InvalidCredentialsError(AuthError):
    """認証情報が無効（メールアドレスまたはパスワードが不正）"""

    pass


class UserNotFoundError(AuthError):
    """ユーザーが見つからない"""

    pass


class UserInactiveError(AuthError):
    """ユーザーが無効化されている"""

    pass
