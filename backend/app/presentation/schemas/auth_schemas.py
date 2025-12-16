from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """ログインリクエスト"""

    email: str = Field(..., description='メールアドレス')
    password: str = Field(..., description='パスワード')


class LoginResponse(BaseModel):
    """ログインレスポンス"""

    message: str = Field(..., description='メッセージ')
    user_id: str = Field(..., description='ユーザーID (UUID)')


class LogoutResponse(BaseModel):
    """ログアウトレスポンス"""

    message: str = Field(..., description='メッセージ')


class MeResponse(BaseModel):
    """現在のユーザー情報レスポンス"""

    id: str = Field(..., description='ユーザーID (UUID)')
    email: str = Field(..., description='メールアドレス')
    username: str | None = Field(None, description='ユーザー名')
    avatar_url: str | None = Field(None, description='アバター画像URL')
    discord_id: str | None = Field(None, description='Discord User ID')
    is_active: bool = Field(..., description='アカウント有効状態')
