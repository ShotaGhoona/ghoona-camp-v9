"""DBモデルのエクスポート"""

from app.infrastructure.db.models.base import Base

# User Management
from app.infrastructure.db.models.user_model import (
    UserMetadataModel,
    UserModel,
    UserRivalModel,
    UserSocialLinkModel,
    UserVisionModel,
)

# Goal Management
from app.infrastructure.db.models.goal_model import GoalModel

# Event Management
from app.infrastructure.db.models.event_model import EventModel, EventParticipantModel

# Title Management
from app.infrastructure.db.models.title_model import TitleAchievementModel

# Attendance Management
from app.infrastructure.db.models.attendance_model import (
    AttendanceLogModel,
    AttendanceStatisticsModel,
    AttendanceSummaryModel,
)

# Notification Management
from app.infrastructure.db.models.notification_model import (
    NotificationModel,
    NotificationSettingsModel,
)

# Dashboard Management
from app.infrastructure.db.models.dashboard_model import DashboardLayoutModel

__all__ = [
    'Base',
    # User Management
    'UserModel',
    'UserMetadataModel',
    'UserVisionModel',
    'UserSocialLinkModel',
    'UserRivalModel',
    # Goal Management
    'GoalModel',
    # Event Management
    'EventModel',
    'EventParticipantModel',
    # Title Management
    'TitleAchievementModel',
    # Attendance Management
    'AttendanceLogModel',
    'AttendanceSummaryModel',
    'AttendanceStatisticsModel',
    # Notification Management
    'NotificationModel',
    'NotificationSettingsModel',
    # Dashboard Management
    'DashboardLayoutModel',
]
