"""シードデータ投入スクリプト

朝活コミュニティアプリ用のリアルなテストデータを投入します。

Usage:
    make db-seed
    または
    docker compose exec backend python scripts/seed.py
"""

import os
import sys
from datetime import date, datetime, time, timedelta
from uuid import uuid4

import bcrypt

# プロジェクトルートをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.infrastructure.db.models import (
    AttendanceStatisticsModel,
    TitleAchievementModel,
    UserMetadataModel,
    UserModel,
    UserSocialLinkModel,
    UserVisionModel,
)

# データベース接続
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql+psycopg2://app_user:app_password@db:5432/ghoona_camp_db',
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def hash_password(password: str) -> str:
    """パスワードをbcryptでハッシュ化"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


# ========================================
# シードデータ定義
# ========================================

USERS_DATA = [
    {
        'email': 'yamada.taro@example.com',
        'password': 'password123',
        'username': '山田太郎',
        'avatar_url': 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamada',
        'metadata': {
            'display_name': 'やまたろ',
            'tagline': '毎朝5時起き継続中！エンジニア×朝活で人生変えます',
            'bio': 'Web系エンジニア5年目。朝活を始めて3ヶ月で生活が激変しました。毎朝の読書とコーディングが日課です。同じ志を持つ仲間と一緒に成長したいです！',
            'skills': ['Python', 'React', 'AWS', 'Docker'],
            'interests': ['プログラミング', '読書', '筋トレ', '投資'],
        },
        'vision': {
            'vision': '35歳までにテックリードになり、チームを率いてプロダクトを成功に導く。朝活で培った習慣力を武器に、継続的な学習で市場価値を高め続ける。',
            'is_public': True,
        },
        'social_links': [
            {'platform': 'twitter', 'url': 'https://twitter.com/yamada_taro', 'title': 'X (Twitter)'},
            {'platform': 'github', 'url': 'https://github.com/yamada-taro', 'title': 'GitHub'},
        ],
        'stats': {
            'total_attendance_days': 87,
            'current_streak_days': 23,
            'max_streak_days': 45,
            'total_duration_minutes': 5220,
        },
        'title_level': 4,  # サンライズ職人
    },
    {
        'email': 'suzuki.hanako@example.com',
        'password': 'password123',
        'username': '鈴木花子',
        'avatar_url': 'https://api.dicebear.com/7.x/avataaars/svg?seed=suzuki',
        'metadata': {
            'display_name': 'はなちゃん',
            'tagline': 'デザイナー×朝活 | 朝の静かな時間でクリエイティブに',
            'bio': 'UI/UXデザイナーです。朝活では主にデザインの勉強や個人プロジェクトに取り組んでいます。朝の澄んだ空気の中で作業すると、いいアイデアが浮かびます✨',
            'skills': ['Figma', 'Photoshop', 'Illustrator', 'UI/UX'],
            'interests': ['デザイン', 'アート', 'カフェ巡り', 'ヨガ'],
        },
        'vision': {
            'vision': 'デザインの力で人々の生活をより豊かにする。自分のデザインスタジオを立ち上げ、社会課題を解決するプロダクトを生み出したい。',
            'is_public': True,
        },
        'social_links': [
            {'platform': 'twitter', 'url': 'https://twitter.com/hanako_design', 'title': 'X (Twitter)'},
            {'platform': 'instagram', 'url': 'https://instagram.com/hanako_design', 'title': 'Instagram'},
            {'platform': 'website', 'url': 'https://hanako-design.com', 'title': 'ポートフォリオ'},
        ],
        'stats': {
            'total_attendance_days': 156,
            'current_streak_days': 67,
            'max_streak_days': 67,
            'total_duration_minutes': 9360,
        },
        'title_level': 6,  # 暁の達人
    },
    {
        'email': 'tanaka.ken@example.com',
        'password': 'password123',
        'username': '田中健',
        'avatar_url': 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka',
        'metadata': {
            'display_name': 'けんけん',
            'tagline': '営業マン→エンジニア転職を目指して毎朝コード書いてます',
            'bio': '営業職5年目ですが、プログラミングに目覚めてエンジニア転職を目指しています。朝活でProgateやUdemyで勉強中。2024年中に転職成功させます！',
            'skills': ['HTML', 'CSS', 'JavaScript', '営業'],
            'interests': ['プログラミング学習', 'キャリアチェンジ', 'ランニング', '料理'],
        },
        'vision': {
            'vision': 'エンジニアとして自分でプロダクトを作れるようになる。将来的には営業経験を活かしてプロダクトマネージャーを目指したい。',
            'is_public': True,
        },
        'social_links': [
            {'platform': 'twitter', 'url': 'https://twitter.com/ken_learning', 'title': 'X (Twitter)'},
        ],
        'stats': {
            'total_attendance_days': 34,
            'current_streak_days': 12,
            'max_streak_days': 21,
            'total_duration_minutes': 2040,
        },
        'title_level': 3,  # 朝焼け探検家
    },
    {
        'email': 'sato.yuki@example.com',
        'password': 'password123',
        'username': '佐藤雪',
        'avatar_url': 'https://api.dicebear.com/7.x/avataaars/svg?seed=sato',
        'metadata': {
            'display_name': 'ゆきんこ',
            'tagline': '朝活×英語学習 | TOEIC900点目指してます',
            'bio': '外資系企業への転職を目指して英語学習中です。朝活では主にシャドーイングとリーディングに取り組んでいます。一緒に頑張れる仲間募集中！',
            'skills': ['英語', 'TOEIC', '翻訳', 'Excel'],
            'interests': ['英語学習', '海外ドラマ', '旅行', '読書'],
        },
        'vision': {
            'vision': '英語を武器に外資系企業でグローバルに活躍する。将来は海外駐在も経験して、国際的なビジネスパーソンになりたい。',
            'is_public': False,
        },
        'social_links': [
            {'platform': 'twitter', 'url': 'https://twitter.com/yuki_english', 'title': 'X (Twitter)'},
        ],
        'stats': {
            'total_attendance_days': 62,
            'current_streak_days': 8,
            'max_streak_days': 31,
            'total_duration_minutes': 3720,
        },
        'title_level': 4,  # サンライズ職人
    },
    {
        'email': 'watanabe.ryo@example.com',
        'password': 'password123',
        'username': '渡辺亮',
        'avatar_url': 'https://api.dicebear.com/7.x/avataaars/svg?seed=watanabe',
        'metadata': {
            'display_name': 'りょうさん',
            'tagline': 'スタートアップCTO | 朝活でインプット、日中はアウトプット',
            'bio': 'スタートアップでCTOをしています。朝活では技術書を読んだり、新しい技術のキャッチアップをしています。チームメンバーにも朝活を勧めています！',
            'skills': ['Go', 'Kubernetes', 'GCP', 'マネジメント'],
            'interests': ['技術トレンド', 'スタートアップ', 'サウナ', 'ゴルフ'],
        },
        'vision': {
            'vision': '自分の会社を上場させる。テクノロジーの力で社会にインパクトを与えるプロダクトを作り、次世代のエンジニアを育成したい。',
            'is_public': True,
        },
        'social_links': [
            {'platform': 'twitter', 'url': 'https://twitter.com/ryo_cto', 'title': 'X (Twitter)'},
            {'platform': 'github', 'url': 'https://github.com/ryo-watanabe', 'title': 'GitHub'},
            {'platform': 'website', 'url': 'https://ryo-tech.dev', 'title': 'Tech Blog'},
        ],
        'stats': {
            'total_attendance_days': 267,
            'current_streak_days': 134,
            'max_streak_days': 180,
            'total_duration_minutes': 16020,
        },
        'title_level': 8,  # 太陽賢者
    },
    {
        'email': 'ito.miki@example.com',
        'password': 'password123',
        'username': '伊藤美紀',
        'avatar_url': 'https://api.dicebear.com/7.x/avataaars/svg?seed=ito',
        'metadata': {
            'display_name': 'みきてぃ',
            'tagline': '主婦×副業ライター | 朝活で自分の時間を確保',
            'bio': '2児の母です。子どもが起きる前の朝活タイムが唯一の自分時間。Webライターとして副業を始めました。同じ境遇のママさんと繋がりたいです！',
            'skills': ['ライティング', 'WordPress', 'SEO', '家事効率化'],
            'interests': ['副業', '子育て', '時短術', 'お金の勉強'],
        },
        'vision': {
            'vision': 'ライターとして独立して、場所や時間に縛られない働き方を実現する。子育てしながらでも自己実現できることを証明したい。',
            'is_public': True,
        },
        'social_links': [
            {'platform': 'twitter', 'url': 'https://twitter.com/miki_writer', 'title': 'X (Twitter)'},
            {'platform': 'blog', 'url': 'https://miki-mama-blog.com', 'title': 'ブログ'},
        ],
        'stats': {
            'total_attendance_days': 98,
            'current_streak_days': 42,
            'max_streak_days': 56,
            'total_duration_minutes': 5880,
        },
        'title_level': 5,  # 太陽追い
    },
    {
        'email': 'nakamura.shota@example.com',
        'password': 'password123',
        'username': '中村翔太',
        'avatar_url': 'https://api.dicebear.com/7.x/avataaars/svg?seed=nakamura',
        'metadata': {
            'display_name': 'しょーた',
            'tagline': '大学生 | 就活×自己成長のために朝活始めました',
            'bio': '大学3年生です。就活に向けて自己分析やES対策を朝活で進めています。社会人の先輩方から刺激をもらってます！',
            'skills': ['Python', 'データ分析', 'プレゼン', '英語'],
            'interests': ['就活', 'データサイエンス', 'サッカー', '映画'],
        },
        'vision': {
            'vision': 'データサイエンティストとして大手IT企業に就職する。将来は海外でも通用するスキルを身につけて、グローバルに活躍したい。',
            'is_public': True,
        },
        'social_links': [
            {'platform': 'twitter', 'url': 'https://twitter.com/shota_student', 'title': 'X (Twitter)'},
        ],
        'stats': {
            'total_attendance_days': 21,
            'current_streak_days': 7,
            'max_streak_days': 14,
            'total_duration_minutes': 1260,
        },
        'title_level': 2,  # 夜明けの旅人
    },
    {
        'email': 'kobayashi.ai@example.com',
        'password': 'password123',
        'username': '小林愛',
        'avatar_url': 'https://api.dicebear.com/7.x/avataaars/svg?seed=kobayashi',
        'metadata': {
            'display_name': 'あいちゃん',
            'tagline': 'フリーランスPM | 朝活で1日の計画を立てる習慣',
            'bio': 'フリーランスでプロジェクトマネージャーをしています。朝活では1日の計画を立てたり、タスク管理の見直しをしています。仕事の効率が格段に上がりました！',
            'skills': ['プロジェクト管理', 'Notion', 'Slack', 'ファシリテーション'],
            'interests': ['生産性向上', 'ツール活用', 'コーチング', 'ワイン'],
        },
        'vision': {
            'vision': 'PMとしてのスキルを極め、複数のプロジェクトを同時に成功に導ける人材になる。将来はPMの育成にも携わりたい。',
            'is_public': True,
        },
        'social_links': [
            {'platform': 'twitter', 'url': 'https://twitter.com/ai_pm', 'title': 'X (Twitter)'},
            {'platform': 'note', 'url': 'https://note.com/ai_pm', 'title': 'note'},
        ],
        'stats': {
            'total_attendance_days': 134,
            'current_streak_days': 28,
            'max_streak_days': 62,
            'total_duration_minutes': 8040,
        },
        'title_level': 5,  # 太陽追い
    },
    {
        'email': 'yamamoto.kenji@example.com',
        'password': 'password123',
        'username': '山本健二',
        'avatar_url': 'https://api.dicebear.com/7.x/avataaars/svg?seed=yamamoto',
        'metadata': {
            'display_name': 'けんじー',
            'tagline': '50代会社員 | 定年後を見据えて新しいことにチャレンジ',
            'bio': '大手メーカー勤務の50代です。定年後のセカンドキャリアを見据えて、プログラミングとWebマーケティングを学んでいます。年齢関係なく成長できると証明したい！',
            'skills': ['Excel', 'PowerPoint', 'マーケティング', 'マネジメント'],
            'interests': ['セカンドキャリア', 'Web学習', '健康管理', '釣り'],
        },
        'vision': {
            'vision': '60歳を過ぎても現役で活躍し続ける。培った経験とデジタルスキルを組み合わせて、中小企業のDX支援ができるコンサルタントになりたい。',
            'is_public': True,
        },
        'social_links': [
            {'platform': 'twitter', 'url': 'https://twitter.com/kenji_50s', 'title': 'X (Twitter)'},
        ],
        'stats': {
            'total_attendance_days': 45,
            'current_streak_days': 15,
            'max_streak_days': 30,
            'total_duration_minutes': 2700,
        },
        'title_level': 3,  # 朝焼け探検家
    },
    {
        'email': 'honda.sakura@example.com',
        'password': 'password123',
        'username': '本田さくら',
        'avatar_url': 'https://api.dicebear.com/7.x/avataaars/svg?seed=honda',
        'metadata': {
            'display_name': 'さくら',
            'tagline': '看護師×朝活 | 夜勤明けでも朝活で生活リズムをキープ',
            'bio': '病院勤務の看護師です。不規則な勤務でも朝活を続けることで生活リズムを整えています。医療×ITに興味があり、ヘルステックについて勉強中です。',
            'skills': ['看護', '医療知識', 'コミュニケーション', 'ストレス管理'],
            'interests': ['ヘルステック', '健康管理', 'メンタルヘルス', 'カメラ'],
        },
        'vision': {
            'vision': '看護師としての経験を活かして、医療とテクノロジーを繋ぐ仕事に携わりたい。患者さんがより良い医療を受けられる仕組みづくりに貢献したい。',
            'is_public': False,
        },
        'social_links': [
            {'platform': 'instagram', 'url': 'https://instagram.com/sakura_nurse', 'title': 'Instagram'},
        ],
        'stats': {
            'total_attendance_days': 78,
            'current_streak_days': 5,
            'max_streak_days': 21,
            'total_duration_minutes': 4680,
        },
        'title_level': 4,  # サンライズ職人
    },
]


def clear_data(session):
    """既存データをクリア"""
    print('既存データを削除中...')
    session.query(UserSocialLinkModel).delete()
    session.query(UserVisionModel).delete()
    session.query(UserMetadataModel).delete()
    session.query(TitleAchievementModel).delete()
    session.query(AttendanceStatisticsModel).delete()
    session.query(UserModel).delete()
    session.commit()
    print('既存データを削除しました')


def seed_users(session):
    """ユーザーデータを投入"""
    print('シードデータを投入中...')

    for i, user_data in enumerate(USERS_DATA, 1):
        user_id = uuid4()
        now = datetime.now()
        # 登録日をランダムに過去に設定（参加日数に基づく）
        days_ago = user_data['stats']['total_attendance_days'] + 10
        created_at = now - timedelta(days=days_ago)

        # ユーザー基本情報
        user = UserModel(
            id=user_id,
            email=user_data['email'],
            password_hash=hash_password(user_data['password']),
            username=user_data['username'],
            avatar_url=user_data['avatar_url'],
            is_active=True,
            created_at=created_at,
            updated_at=now,
        )
        session.add(user)

        # メタデータ
        metadata = UserMetadataModel(
            id=uuid4(),
            user_id=user_id,
            display_name=user_data['metadata']['display_name'],
            tagline=user_data['metadata']['tagline'],
            bio=user_data['metadata']['bio'],
            skills=user_data['metadata']['skills'],
            interests=user_data['metadata']['interests'],
            created_at=created_at,
            updated_at=now,
        )
        session.add(metadata)

        # ビジョン
        vision = UserVisionModel(
            id=uuid4(),
            user_id=user_id,
            vision=user_data['vision']['vision'],
            is_public=user_data['vision']['is_public'],
            created_at=created_at,
            updated_at=now,
        )
        session.add(vision)

        # ソーシャルリンク
        for link_data in user_data['social_links']:
            link = UserSocialLinkModel(
                id=uuid4(),
                user_id=user_id,
                platform=link_data['platform'],
                url=link_data['url'],
                title=link_data['title'],
                is_public=True,
                created_at=created_at,
                updated_at=now,
            )
            session.add(link)

        # 参加統計
        stats = AttendanceStatisticsModel(
            id=uuid4(),
            user_id=user_id,
            total_attendance_days=user_data['stats']['total_attendance_days'],
            current_streak_days=user_data['stats']['current_streak_days'],
            max_streak_days=user_data['stats']['max_streak_days'],
            last_attendance_date=date.today() - timedelta(days=1),
            first_attendance_date=created_at.date() + timedelta(days=3),
            total_duration_minutes=user_data['stats']['total_duration_minutes'],
            created_at=created_at,
            updated_at=now,
        )
        session.add(stats)

        # 称号実績（現在の称号とそれまでの称号を全て付与）
        for level in range(1, user_data['title_level'] + 1):
            # 各レベルの獲得日を計算（シミュレーション）
            days_for_level = {1: 0, 2: 7, 3: 30, 4: 60, 5: 100, 6: 150, 7: 250, 8: 365}
            achieved_date = created_at + timedelta(days=days_for_level.get(level, 0))

            title = TitleAchievementModel(
                id=uuid4(),
                user_id=user_id,
                title_level=level,
                achieved_at=achieved_date,
                is_current=(level == user_data['title_level']),
                created_at=achieved_date,
                updated_at=now,
            )
            session.add(title)

        print(f'  [{i}/{len(USERS_DATA)}] {user_data["username"]} を追加しました')

    session.commit()
    print(f'\n✅ {len(USERS_DATA)}人のユーザーを追加しました')


def main():
    """メイン処理"""
    print('=' * 50)
    print('Ghoona Camp シードデータ投入スクリプト')
    print('=' * 50)
    print()

    session = SessionLocal()

    try:
        clear_data(session)
        seed_users(session)
        print()
        print('✅ シードデータの投入が完了しました！')
        print()
        print('テスト用アカウント:')
        print('  Email: yamada.taro@example.com')
        print('  Password: password123')
        print()
    except Exception as e:
        session.rollback()
        print(f'❌ エラーが発生しました: {e}')
        raise
    finally:
        session.close()


if __name__ == '__main__':
    main()
