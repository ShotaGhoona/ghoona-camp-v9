from pydantic import BaseModel


class UploadUrlDTO(BaseModel):
    """アップロードURL DTO"""

    upload_url: str
    public_url: str
