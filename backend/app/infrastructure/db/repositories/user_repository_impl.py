"""ユーザーリポジトリの実装"""

from uuid import UUID

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.domain.entities.user import User
from app.domain.repositories.user_repository import (
    IUserRepository,
    PaginatedUserList,
    UserListItem,
    UserProfileUpdateData,
    UserSearchFilter,
    UserWithDetails,
)
from app.infrastructure.db.models.user_model import (
    UserMetadataModel,
    UserModel,
    UserSocialLinkModel,
    UserVisionModel,
)
from app.infrastructure.db.models.attendance_model import AttendanceStatisticsModel
from app.infrastructure.db.models.title_model import TitleAchievementModel


class UserRepositoryImpl(IUserRepository):
    """ユーザーリポジトリの実装"""

    def __init__(self, session: Session):
        """
        コンストラクタ

        Args:
            session: SQLAlchemyのセッション
        """
        self.session = session

    def get_by_email(self, email: str) -> User | None:
        """メールアドレスでユーザーを取得"""
        user_model = (
            self.session.query(UserModel)
            .filter(UserModel.email == email)
            .filter(UserModel.is_active == True)
            .first()
        )
        if user_model is None:
            return None
        return self._to_entity(user_model)

    def get_by_id(self, user_id: UUID) -> User | None:
        """IDでユーザーを取得"""
        user_model = (
            self.session.query(UserModel)
            .filter(UserModel.id == user_id)
            .filter(UserModel.is_active == True)
            .first()
        )
        if user_model is None:
            return None
        return self._to_entity(user_model)

    def get_users_list(self, filter: UserSearchFilter) -> PaginatedUserList:
        """フィルター条件に基づいてユーザー一覧を取得（軽量版）"""
        # ベースクエリ: アクティブなユーザーのみ
        query = self.session.query(UserModel).filter(UserModel.is_active == True)

        # user_metadataとの結合（フィルタリング用）
        query = query.outerjoin(
            UserMetadataModel, UserModel.id == UserMetadataModel.user_id
        )

        # title_achievementsとの結合（フィルタリング + 表示用）
        query = query.outerjoin(
            TitleAchievementModel,
            (UserModel.id == TitleAchievementModel.user_id)
            & (TitleAchievementModel.is_current == True),
        )

        # search フィルター
        if filter.search:
            search_term = f'%{filter.search}%'
            query = query.filter(
                or_(
                    UserMetadataModel.display_name.ilike(search_term),
                    UserMetadataModel.tagline.ilike(search_term),
                )
            )

        # skills フィルター (OR検索)
        if filter.skills:
            query = query.filter(UserMetadataModel.skills.overlap(filter.skills))

        # interests フィルター (OR検索)
        if filter.interests:
            query = query.filter(UserMetadataModel.interests.overlap(filter.interests))

        # title_levels フィルター
        if filter.title_levels:
            query = query.filter(
                TitleAchievementModel.title_level.in_(filter.title_levels)
            )

        # フィルタリング条件に合うユーザーIDを取得（サブクエリ）
        user_ids_subquery = query.with_entities(UserModel.id).distinct().subquery()

        # 総件数を取得
        total = self.session.query(user_ids_subquery).count()

        # メインクエリ: 必要なカラムのみ取得（軽量版）
        results = (
            self.session.query(
                UserModel.id,
                UserModel.avatar_url,
                UserMetadataModel.display_name,
                UserMetadataModel.tagline,
                TitleAchievementModel.title_level,
            )
            .outerjoin(UserMetadataModel, UserModel.id == UserMetadataModel.user_id)
            .outerjoin(
                TitleAchievementModel,
                (UserModel.id == TitleAchievementModel.user_id)
                & (TitleAchievementModel.is_current == True),
            )
            .filter(UserModel.id.in_(self.session.query(user_ids_subquery)))
            .order_by(UserModel.created_at.desc())
            .offset(filter.offset)
            .limit(filter.limit)
            .all()
        )

        # UserListItemに変換
        users = [
            UserListItem(
                id=row.id,
                avatar_url=row.avatar_url,
                display_name=row.display_name,
                tagline=row.tagline,
                current_title_level=row.title_level if row.title_level else 1,
            )
            for row in results
        ]

        has_more = (filter.offset + filter.limit) < total

        return PaginatedUserList(
            users=users,
            total=total,
            limit=filter.limit,
            offset=filter.offset,
            has_more=has_more,
        )

    def get_user_detail_by_id(self, user_id: UUID) -> UserWithDetails | None:
        """IDでユーザー詳細情報を取得"""
        # ユーザーが存在してアクティブか確認
        user_model = (
            self.session.query(UserModel)
            .filter(UserModel.id == user_id)
            .filter(UserModel.is_active == True)
            .first()
        )
        if user_model is None:
            return None

        return self._get_user_detail(user_id)

    def _get_user_detail(self, user_id: UUID) -> UserWithDetails | None:
        """ユーザーの詳細情報を取得するヘルパーメソッド"""
        # ユーザー基本情報
        user_model = self.session.query(UserModel).filter(UserModel.id == user_id).first()
        if user_model is None:
            return None

        # メタデータ
        metadata = (
            self.session.query(UserMetadataModel)
            .filter(UserMetadataModel.user_id == user_id)
            .first()
        )

        # ビジョン
        vision_model = (
            self.session.query(UserVisionModel)
            .filter(UserVisionModel.user_id == user_id)
            .first()
        )

        # ソーシャルリンク（公開のみ）
        social_links_models = (
            self.session.query(UserSocialLinkModel)
            .filter(UserSocialLinkModel.user_id == user_id)
            .filter(UserSocialLinkModel.is_public == True)
            .all()
        )

        # 参加統計
        stats = (
            self.session.query(AttendanceStatisticsModel)
            .filter(AttendanceStatisticsModel.user_id == user_id)
            .first()
        )

        # 現在の称号
        current_title = (
            self.session.query(TitleAchievementModel)
            .filter(TitleAchievementModel.user_id == user_id)
            .filter(TitleAchievementModel.is_current == True)
            .first()
        )

        # ビジョンの公開設定に基づいて値を設定
        vision_text = None
        is_vision_public = False
        if vision_model:
            is_vision_public = vision_model.is_public
            if vision_model.is_public:
                vision_text = vision_model.vision

        # ソーシャルリンクをdict形式に変換
        social_links = [
            {
                'id': str(link.id),
                'platform': link.platform,
                'url': link.url,
                'title': link.title,
            }
            for link in social_links_models
        ]

        return UserWithDetails(
            id=user_model.id,
            username=user_model.username,
            avatar_url=user_model.avatar_url,
            display_name=metadata.display_name if metadata else None,
            tagline=metadata.tagline if metadata else None,
            bio=metadata.bio if metadata else None,
            skills=metadata.skills or [] if metadata else [],
            interests=metadata.interests or [] if metadata else [],
            vision=vision_text,
            is_vision_public=is_vision_public,
            social_links=social_links,
            total_attendance_days=stats.total_attendance_days if stats else 0,
            current_streak_days=stats.current_streak_days if stats else 0,
            max_streak_days=stats.max_streak_days if stats else 0,
            current_title_level=current_title.title_level if current_title else 1,
            joined_at=user_model.created_at.isoformat(),
        )

    def create(self, user: User) -> User:
        """ユーザーを作成"""
        user_model = UserModel(
            id=user.id,
            email=user.email,
            password_hash=user.password_hash,
            username=user.username,
            avatar_url=user.avatar_url,
            discord_id=user.discord_id,
            is_active=user.is_active,
        )
        self.session.add(user_model)
        self.session.flush()
        return self._to_entity(user_model)

    def update(self, user: User) -> User:
        """ユーザーを更新"""
        user_model = (
            self.session.query(UserModel).filter(UserModel.id == user.id).first()
        )
        if user_model is None:
            raise ValueError(f'User with id {user.id} not found')

        user_model.email = user.email
        user_model.password_hash = user.password_hash
        user_model.username = user.username
        user_model.avatar_url = user.avatar_url
        user_model.discord_id = user.discord_id
        user_model.is_active = user.is_active

        self.session.flush()
        return self._to_entity(user_model)

    def delete(self, user_id: UUID) -> bool:
        """ユーザーを削除（論理削除）"""
        user_model = (
            self.session.query(UserModel).filter(UserModel.id == user_id).first()
        )
        if user_model is None:
            return False

        user_model.is_active = False
        self.session.flush()
        return True

    def get_by_username(self, username: str) -> User | None:
        """ユーザー名でユーザーを取得"""
        user_model = (
            self.session.query(UserModel)
            .filter(UserModel.username == username)
            .filter(UserModel.is_active == True)
            .first()
        )
        if user_model is None:
            return None
        return self._to_entity(user_model)

    def update_user_profile(
        self, user_id: UUID, update_data: UserProfileUpdateData
    ) -> UserWithDetails | None:
        """ユーザープロフィールを更新（部分更新対応）"""
        # ユーザー存在確認
        user_model = (
            self.session.query(UserModel)
            .filter(UserModel.id == user_id)
            .filter(UserModel.is_active == True)
            .first()
        )
        if user_model is None:
            return None

        # usersテーブルの更新
        if update_data.username is not None:
            user_model.username = update_data.username
        if update_data.avatar_url is not None:
            user_model.avatar_url = update_data.avatar_url

        # user_metadataの更新（UPSERT）
        metadata = (
            self.session.query(UserMetadataModel)
            .filter(UserMetadataModel.user_id == user_id)
            .first()
        )
        if metadata is None:
            # 新規作成
            metadata = UserMetadataModel(user_id=user_id)
            self.session.add(metadata)

        if update_data.display_name is not None:
            metadata.display_name = update_data.display_name
        if update_data.tagline is not None:
            metadata.tagline = update_data.tagline
        if update_data.bio is not None:
            metadata.bio = update_data.bio
        if update_data.skills is not None:
            # 重複除去
            metadata.skills = list(dict.fromkeys(update_data.skills))
        if update_data.interests is not None:
            # 重複除去
            metadata.interests = list(dict.fromkeys(update_data.interests))

        # user_visionsの更新（UPSERT）
        if update_data.vision is not None or update_data.is_vision_public is not None:
            vision_model = (
                self.session.query(UserVisionModel)
                .filter(UserVisionModel.user_id == user_id)
                .first()
            )
            if vision_model is None:
                # 新規作成
                vision_model = UserVisionModel(user_id=user_id)
                self.session.add(vision_model)

            if update_data.vision is not None:
                vision_model.vision = update_data.vision
            if update_data.is_vision_public is not None:
                vision_model.is_public = update_data.is_vision_public

        # user_social_linksの更新（全置換）
        if update_data.social_links is not None:
            # 既存リンクを全削除
            self.session.query(UserSocialLinkModel).filter(
                UserSocialLinkModel.user_id == user_id
            ).delete()

            # 新しいリンクを挿入
            for link in update_data.social_links:
                social_link_model = UserSocialLinkModel(
                    user_id=user_id,
                    platform=link.platform,
                    url=link.url,
                    title=link.title,
                    is_public=True,
                )
                self.session.add(social_link_model)

        self.session.flush()

        # 更新後のユーザー詳細を取得して返す
        return self._get_user_detail(user_id)

    def _to_entity(self, user_model: UserModel) -> User:
        """DBモデルをエンティティに変換"""
        return User(
            id=user_model.id,
            email=user_model.email,
            password_hash=user_model.password_hash,
            username=user_model.username,
            avatar_url=user_model.avatar_url,
            discord_id=user_model.discord_id,
            is_active=user_model.is_active,
            created_at=user_model.created_at,
            updated_at=user_model.updated_at,
        )
