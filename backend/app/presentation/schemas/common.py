"""共通のPresentation層スキーマ"""

from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

# ジェネリック型変数
T = TypeVar('T')


class ErrorDetail(BaseModel):
    """エラー詳細"""

    code: str
    message: str
    details: dict[str, Any] | None = None


class ErrorResponse(BaseModel):
    """エラーレスポンス"""

    error: ErrorDetail
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class BaseAPIResponse(BaseModel, Generic[T]):
    """
    API成功レスポンスのベースクラス

    使用例:
        class MyDataResponse(BaseModel):
            items: list[str]

        class MyAPIResponse(BaseAPIResponse[MyDataResponse]):
            pass
    """

    data: T
    message: str = 'success'
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
