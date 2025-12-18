"""Domain Entitiesのエクスポート"""

# User Management
from app.domain.entities.user import User
from app.domain.entities.user_metadata import UserMetadata
from app.domain.entities.user_vision import UserVision
from app.domain.entities.user_social_link import UserSocialLink
from app.domain.entities.user_rival import UserRival

# Goal Management
from app.domain.entities.goal import Goal

# Event Management
from app.domain.entities.event import Event, EventParticipant

# Title Management
from app.domain.entities.title_achievement import TitleAchievement

# Attendance Management
from app.domain.entities.attendance_log import AttendanceLog
from app.domain.entities.attendance_summary import AttendanceSummary
from app.domain.entities.attendance_statistics import AttendanceStatistics

# Notification Management
from app.domain.entities.notification import Notification, NotificationSettings

__all__ = [
    # User Management
    'User',
    'UserMetadata',
    'UserVision',
    'UserSocialLink',
    'UserRival',
    # Goal Management
    'Goal',
    # Event Management
    'Event',
    'EventParticipant',
    # Title Management
    'TitleAchievement',
    # Attendance Management
    'AttendanceLog',
    'AttendanceSummary',
    'AttendanceStatistics',
    # Notification Management
    'Notification',
    'NotificationSettings',
]
