"""参加関連のDBモデル"""

from datetime import date, datetime, time
from uuid import uuid4

from sqlalchemy import Boolean, Date, DateTime, Integer, String, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.db.models.base import Base


class AttendanceLogModel(Base):
    """参加ログテーブル"""

    __tablename__ = 'attendance_logs'

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    event_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True, index=True
    )
    discord_channel_id: Mapped[str] = mapped_column(String(255), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    left_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now, onupdate=datetime.now, nullable=False
    )


class AttendanceSummaryModel(Base):
    """参加サマリーテーブル（日単位）"""

    __tablename__ = 'attendance_summaries'

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    total_duration_minutes: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    session_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    first_join_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    last_leave_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    is_morning_active: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now, onupdate=datetime.now, nullable=False
    )


class AttendanceStatisticsModel(Base):
    """参加統計テーブル"""

    __tablename__ = 'attendance_statistics'

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), unique=True, nullable=False, index=True
    )
    total_attendance_days: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    current_streak_days: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    max_streak_days: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    last_attendance_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    first_attendance_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    total_duration_minutes: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now, onupdate=datetime.now, nullable=False
    )
