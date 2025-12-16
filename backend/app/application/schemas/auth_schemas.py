from pydantic import BaseModel, Field


class LoginInputDTO(BaseModel):
    """ログイン入力DTO"""

    email: str = Field(..., description='メールアドレス')
    password: str = Field(..., description='パスワード')


class LoginOutputDTO(BaseModel):
    """ログイン出力DTO"""

    access_token: str = Field(..., description='アクセストークン')
    user_id: str = Field(..., description='ユーザーID (UUID)')


class LogoutOutputDTO(BaseModel):
    """ログアウト出力DTO"""

    message: str = Field(..., description='メッセージ')


class MeOutputDTO(BaseModel):
    """現在のユーザー情報出力DTO"""

    id: str = Field(..., description='ユーザーID (UUID)')
    email: str = Field(..., description='メールアドレス')
    username: str | None = Field(None, description='ユーザー名')
    avatar_url: str | None = Field(None, description='アバター画像URL')
    discord_id: str | None = Field(None, description='Discord User ID')
    is_active: bool = Field(..., description='アカウント有効状態')
