"""シードデータ共通設定

データベース接続、共通ユーティリティ、定数を定義します。
"""

import os
import sys

from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# プロジェクトルートをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# ========================================
# 設定
# ========================================

NUM_USERS = 50  # 生成するユーザー数

# データベース接続
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql+psycopg2://app_user:app_password@db:5432/ghoona_camp_db',
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# パスワードハッシュ
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def hash_password(password: str) -> str:
    """パスワードをbcryptでハッシュ化"""
    return pwd_context.hash(password)


def get_session() -> Session:
    """データベースセッションを取得"""
    return SessionLocal()


# ========================================
# テスト用アカウント情報
# ========================================

TEST_PASSWORD = 'password123'
TEST_EMAIL_TEMPLATE = 'user{:03d}@example.com'
