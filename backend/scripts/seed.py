"""シードデータ投入スクリプト

朝活コミュニティアプリ用のリアルなテストデータを投入します。
ランダム生成で多様なユーザーを作成します。

Usage:
    make db-seed
    または
    docker compose exec backend python scripts/seed.py
"""

import os
import random
import sys
from datetime import date, datetime, timedelta
from uuid import uuid4

from passlib.context import CryptContext

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


pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def hash_password(password: str) -> str:
    """パスワードをbcryptでハッシュ化"""
    return pwd_context.hash(password)


# ========================================
# データソース
# ========================================

LAST_NAMES = [
    '山田', '鈴木', '田中', '佐藤', '渡辺', '伊藤', '中村', '小林', '加藤', '吉田',
    '山本', '松本', '井上', '木村', '林', '清水', '山崎', '森', '池田', '橋本',
    '阿部', '石川', '前田', '藤田', '小川', '後藤', '岡田', '長谷川', '村上', '近藤',
    '石井', '斎藤', '坂本', '遠藤', '青木', '藤井', '西村', '福田', '太田', '三浦',
]

FIRST_NAMES_MALE = [
    '太郎', '健', '翔太', '大輝', '拓海', '蓮', '悠真', '陽太', '颯太', '大和',
    '亮', '健二', '浩', '誠', '隆', '修', '剛', '学', '豊', '勇',
    '翔', '樹', '海斗', '陸', '航', '優斗', '遼', '駿', '涼太', '健太',
]

FIRST_NAMES_FEMALE = [
    '花子', '美紀', '愛', '雪', 'さくら', '結衣', '葵', '陽菜', '凛', '紬',
    '美咲', '莉子', '心春', '芽依', '彩花', '杏', '楓', '琴音', '日葵', '柚希',
    '麻衣', '真由', '千尋', '沙織', '綾', '瞳', '舞', '香織', '恵', '裕子',
]

DISPLAY_NAME_SUFFIXES = [
    'さん', 'くん', 'ちゃん', '', 'っち', 'ぴー', 'てぃ', 'まる', 'りん', 'ん',
]

# 職業・属性
OCCUPATIONS = [
    {'type': 'engineer', 'title': 'エンジニア', 'company': ['Web系', 'SIer', 'スタートアップ', 'フリーランス', '大手IT', 'メガベンチャー']},
    {'type': 'designer', 'title': 'デザイナー', 'company': ['Web系', '制作会社', 'フリーランス', 'インハウス', 'スタートアップ']},
    {'type': 'pm', 'title': 'PM/ディレクター', 'company': ['IT企業', 'スタートアップ', 'コンサル', 'フリーランス']},
    {'type': 'sales', 'title': '営業', 'company': ['IT', 'メーカー', '商社', '不動産', '金融']},
    {'type': 'marketing', 'title': 'マーケター', 'company': ['Web系', '事業会社', 'エージェンシー', 'スタートアップ']},
    {'type': 'hr', 'title': '人事', 'company': ['IT企業', '大手企業', 'スタートアップ', 'コンサル']},
    {'type': 'finance', 'title': '経理・財務', 'company': ['大手企業', 'スタートアップ', 'コンサル', '金融']},
    {'type': 'consultant', 'title': 'コンサルタント', 'company': ['戦略系', 'IT系', '業務系', '独立系']},
    {'type': 'student', 'title': '学生', 'company': ['大学生', '大学院生', '専門学校生']},
    {'type': 'freelance', 'title': 'フリーランス', 'company': ['エンジニア', 'デザイナー', 'ライター', 'コンサル']},
    {'type': 'startup', 'title': '起業家/経営者', 'company': ['スタートアップ', '中小企業', '個人事業']},
    {'type': 'teacher', 'title': '教育関係', 'company': ['学校', '塾', 'オンライン講師', '研修講師']},
    {'type': 'medical', 'title': '医療従事者', 'company': ['病院', 'クリニック', '介護施設', '製薬']},
    {'type': 'creative', 'title': 'クリエイター', 'company': ['映像', '音楽', 'イラスト', 'ゲーム']},
    {'type': 'homemaker', 'title': '主婦/主夫', 'company': ['副業中', '復職準備中', '子育て中', '介護中']},
]

# スキルセット（職業タイプ別）
SKILLS_BY_TYPE = {
    'engineer': [
        ['Python', 'Django', 'FastAPI', 'PostgreSQL'],
        ['JavaScript', 'TypeScript', 'React', 'Next.js'],
        ['Go', 'Kubernetes', 'AWS', 'Docker'],
        ['Java', 'Spring Boot', 'MySQL', 'Redis'],
        ['Ruby', 'Rails', 'AWS', 'Terraform'],
        ['PHP', 'Laravel', 'Vue.js', 'MySQL'],
        ['Swift', 'iOS', 'Firebase', 'UI/UX'],
        ['Kotlin', 'Android', 'Flutter', 'Dart'],
        ['C#', '.NET', 'Azure', 'SQL Server'],
        ['Rust', 'WebAssembly', 'システムプログラミング'],
    ],
    'designer': [
        ['Figma', 'Photoshop', 'Illustrator', 'UI/UX'],
        ['Sketch', 'InVision', 'Principle', 'Motion'],
        ['XD', 'After Effects', 'Premiere', '映像編集'],
        ['Webデザイン', 'HTML/CSS', 'JavaScript', 'WordPress'],
        ['3DCG', 'Blender', 'Cinema4D', 'モーショングラフィックス'],
    ],
    'pm': [
        ['プロジェクト管理', 'Notion', 'Jira', 'アジャイル'],
        ['スクラム', 'カンバン', 'Slack', 'Confluence'],
        ['要件定義', '進行管理', 'ファシリテーション', 'ドキュメンテーション'],
        ['プロダクトマネジメント', 'ユーザーリサーチ', 'KPI設計', 'データ分析'],
    ],
    'sales': [
        ['法人営業', '提案力', 'プレゼン', 'Salesforce'],
        ['インサイドセールス', 'CRM', 'マーケティング連携', 'データ分析'],
        ['カスタマーサクセス', 'アカウントマネジメント', '顧客折衝', '契約交渉'],
    ],
    'marketing': [
        ['デジタルマーケティング', 'Google Analytics', '広告運用', 'SEO'],
        ['SNSマーケティング', 'コンテンツマーケティング', 'PR', 'ブランディング'],
        ['MA', 'CRM', 'データ分析', 'SQL'],
    ],
    'student': [
        ['Python', 'データ分析', '機械学習', '統計'],
        ['プログラミング学習', 'Web開発', 'アプリ開発', 'UI/UX'],
        ['英語', 'TOEIC', '留学準備', 'プレゼン'],
        ['就活', '自己分析', 'ES作成', '面接対策'],
    ],
    'default': [
        ['Excel', 'PowerPoint', 'Word', 'ビジネス文書'],
        ['コミュニケーション', 'プレゼン', '資料作成', '分析'],
        ['英語', 'ビジネス英語', 'TOEIC', '英会話'],
    ],
}

# 興味・関心
INTERESTS_POOL = [
    # テック系
    'プログラミング', 'AI/機械学習', 'Web開発', 'アプリ開発', 'データサイエンス',
    'ブロックチェーン', 'IoT', 'クラウド', 'セキュリティ', 'ノーコード',
    # ビジネス系
    '起業', 'スタートアップ', '投資', '副業', 'キャリアアップ',
    'マネジメント', 'リーダーシップ', 'MBA', 'ファイナンス', 'マーケティング',
    # 学習系
    '読書', '英語学習', '資格取得', '自己啓発', 'ライティング',
    # ライフスタイル系
    '筋トレ', 'ランニング', 'ヨガ', '瞑想', 'ダイエット',
    '料理', 'カフェ巡り', '旅行', 'キャンプ', 'サウナ',
    # クリエイティブ系
    'デザイン', '写真', '映像制作', '音楽', 'イラスト',
    'ブログ', 'YouTube', 'ポッドキャスト', 'SNS発信',
    # その他
    '子育て', '健康管理', 'メンタルヘルス', 'ミニマリズム', '時短術',
]

# タグラインテンプレート
TAGLINE_TEMPLATES = [
    '{occupation}×朝活 | {goal}',
    '毎朝{time}起き継続中！{activity}で人生変えます',
    '{occupation} | 朝の{minutes}分で{activity}',
    '{occupation}→{target}を目指して奮闘中',
    '朝活{days}日継続 | {activity}がライフワーク',
    '{company}{occupation} | {goal}',
    '{activity}と{activity2}を両立する{occupation}',
    '朝活で{goal} | {occupation}',
    '{occupation}×{interest} | 朝活コミュニティ大好き',
    '朝型生活{days}日目 | {activity}中心の毎日',
]

# ビジョンテンプレート
VISION_TEMPLATES = [
    '{years}年後に{goal}を達成する。朝活で培った習慣力を武器に、継続的な{activity}で成長し続ける。',
    '{occupation}として{goal}。将来は{future_goal}にも挑戦したい。',
    '{target}になり、{impact}。朝活仲間と一緒に成長していきたい。',
    '{goal}を実現して、{impact}。一歩一歩着実に進んでいく。',
    '{years}歳までに{goal}。そのために毎朝の{activity}を欠かさない。',
    '{occupation}の経験を活かして{future_goal}。{impact}ことが夢。',
    '自分の{strength}を活かして{goal}。{activity}を通じて{impact}。',
    '{goal}を達成し、{future_goal}。朝活で出会った仲間と切磋琢磨していく。',
]

# Bio テンプレート
BIO_TEMPLATES = [
    '{company}{occupation}です。朝活では{activity}に取り組んでいます。{hobby}が趣味で、休日は{weekend_activity}しています。{message}',
    '{occupation}{years}年目。{motivation}がきっかけで朝活を始めました。{activity}を{frequency}続けています。{message}',
    '{introduction}。朝活歴{months}ヶ月。主に{activity}をしています。{hobby}も好きです。{message}',
    '{occupation}をしながら{side_goal}を目指しています。朝活では{activity}が日課。{message}',
    '{company}で{occupation}をしています。{motivation}と思い朝活をスタート。{activity}で{effect}を実感中！{message}',
]

# 目標・ゴール
GOALS = [
    'テックリードになる', 'マネージャーに昇進する', '年収1000万円達成',
    '転職を成功させる', '独立・起業する', 'フリーランスになる',
    'TOEIC900点取得', '資格を取得する', 'スキルアップする',
    '副業で月10万円稼ぐ', '自分のサービスをリリースする', 'ブログを収益化する',
    '本を出版する', 'セミナー登壇する', 'コミュニティを作る',
    '健康的な体を手に入れる', 'ダイエットを成功させる', 'フルマラソン完走',
    '海外で働く', 'MBA取得', '博士号取得',
]

# 活動内容
ACTIVITIES = [
    '読書', 'プログラミング学習', '英語学習', '資格勉強',
    'ブログ執筆', 'ポートフォリオ制作', '個人開発',
    '瞑想', 'ヨガ', '筋トレ', 'ランニング',
    'ジャーナリング', '1日の計画立て', 'タスク整理',
    'オンライン講座受講', 'Udemy学習', '技術書を読む',
    'デザイン練習', 'イラスト制作', '動画編集',
    'アウトプット', 'SNS発信', 'ライティング',
]

# メッセージ
MESSAGES = [
    '一緒に頑張りましょう！',
    '仲間と切磋琢磨したいです！',
    '気軽に声かけてください！',
    'よろしくお願いします！',
    '朝活仲間募集中です！',
    '刺激をもらえる仲間を探しています！',
    'お互い高め合いましょう！',
    '継続は力なり！',
    '一緒に成長しましょう！',
    '朝活最高です！',
]

# SNSプラットフォーム
SOCIAL_PLATFORMS = [
    {'platform': 'twitter', 'title': 'X (Twitter)'},
    {'platform': 'github', 'title': 'GitHub'},
    {'platform': 'instagram', 'title': 'Instagram'},
    {'platform': 'note', 'title': 'note'},
    {'platform': 'zenn', 'title': 'Zenn'},
    {'platform': 'qiita', 'title': 'Qiita'},
    {'platform': 'linkedin', 'title': 'LinkedIn'},
    {'platform': 'youtube', 'title': 'YouTube'},
    {'platform': 'website', 'title': 'ポートフォリオ'},
    {'platform': 'blog', 'title': 'ブログ'},
]


# ========================================
# ユーザー生成関数
# ========================================

def generate_user(index: int) -> dict:
    """ランダムにユーザーデータを生成"""
    # 性別をランダムに決定
    is_male = random.random() < 0.55

    # 名前生成
    last_name = random.choice(LAST_NAMES)
    first_name = random.choice(FIRST_NAMES_MALE if is_male else FIRST_NAMES_FEMALE)
    username = f'{last_name}{first_name}'

    # 表示名生成
    display_base = first_name[:2] if len(first_name) >= 2 else first_name
    display_suffix = random.choice(DISPLAY_NAME_SUFFIXES)
    display_name = f'{display_base}{display_suffix}'

    # 職業選択
    occupation_data = random.choice(OCCUPATIONS)
    occupation_type = occupation_data['type']
    occupation_title = occupation_data['title']
    company_type = random.choice(occupation_data['company'])

    # スキル選択
    skill_options = SKILLS_BY_TYPE.get(occupation_type, SKILLS_BY_TYPE['default'])
    skills = random.choice(skill_options)

    # 興味選択（3-6個）
    interests = random.sample(INTERESTS_POOL, random.randint(3, 6))

    # 参加統計生成
    total_days = random.randint(5, 300)
    max_streak = min(total_days, random.randint(7, min(total_days + 20, 200)))
    current_streak = random.randint(0, min(max_streak, 100))

    # 称号レベル計算
    title_level = 1
    if total_days >= 365:
        title_level = 8
    elif total_days >= 250:
        title_level = 7
    elif total_days >= 150:
        title_level = 6
    elif total_days >= 100:
        title_level = 5
    elif total_days >= 60:
        title_level = 4
    elif total_days >= 30:
        title_level = 3
    elif total_days >= 7:
        title_level = 2

    # タグライン生成
    tagline_template = random.choice(TAGLINE_TEMPLATES)
    tagline = tagline_template.format(
        occupation=occupation_title,
        company=company_type,
        goal=random.choice(GOALS),
        target=random.choice(GOALS),
        activity=random.choice(ACTIVITIES),
        activity2=random.choice(ACTIVITIES),
        interest=random.choice(interests),
        time=random.choice(['5時', '5時半', '6時', '4時半']),
        minutes=random.choice(['30', '60', '90', '45']),
        days=total_days,
    )[:150]  # 150文字制限

    # Bio生成
    bio_template = random.choice(BIO_TEMPLATES)
    bio = bio_template.format(
        occupation=occupation_title,
        company=company_type,
        years=random.randint(1, 15),
        months=random.randint(1, 24),
        activity=random.choice(ACTIVITIES),
        hobby=random.choice(interests),
        weekend_activity=random.choice(['のんびり過ごして', 'アクティブに動いて', '家族と過ごして', '趣味に没頭して']),
        message=random.choice(MESSAGES),
        motivation=random.choice(['生活を変えたい', '成長したい', '仲間が欲しい', '習慣化したい', '時間を有効活用したい']),
        frequency=random.choice(['毎日', '週5で', 'コツコツと', '欠かさず']),
        introduction=f'{company_type}で{occupation_title}をしています',
        side_goal=random.choice(GOALS),
        effect=random.choice(['生産性アップ', '集中力向上', '生活リズム改善', '成長']),
    )

    # ビジョン生成
    vision_template = random.choice(VISION_TEMPLATES)
    vision = vision_template.format(
        years=random.choice(['3', '5', '10']),
        goal=random.choice(GOALS),
        occupation=occupation_title,
        target=random.choice(['第一人者', 'プロフェッショナル', 'スペシャリスト', 'リーダー']),
        future_goal=random.choice(GOALS),
        impact=random.choice([
            '社会に貢献したい',
            '次世代を育成したい',
            '多くの人を幸せにしたい',
            'チームを成功に導きたい',
            '業界を変えたい',
        ]),
        activity=random.choice(ACTIVITIES),
        strength=random.choice(['経験', 'スキル', '強み', '知識']),
    )

    # SNSリンク生成（0-3個）
    num_links = random.randint(0, 3)
    social_links = []
    if num_links > 0:
        selected_platforms = random.sample(SOCIAL_PLATFORMS, num_links)
        for platform in selected_platforms:
            handle = f'{first_name.lower()}_{random.randint(100, 999)}'
            if platform['platform'] in ['twitter', 'instagram']:
                url = f'https://{platform["platform"]}.com/{handle}'
            elif platform['platform'] == 'github':
                url = f'https://github.com/{handle}'
            elif platform['platform'] in ['note', 'zenn', 'qiita']:
                url = f'https://{platform["platform"]}.com/{handle}'
            else:
                url = f'https://{handle}.example.com'

            social_links.append({
                'platform': platform['platform'],
                'url': url,
                'title': platform['title'],
            })

    # メールアドレス生成
    email_base = f'{last_name.lower()}.{first_name.lower()}'.replace(' ', '')
    # ローマ字変換（簡易版）
    email = f'user{index:03d}@example.com'

    return {
        'email': email,
        'password': 'password123',
        'username': username,
        'avatar_url': f'https://api.dicebear.com/7.x/avataaars/svg?seed=user{index}',
        'metadata': {
            'display_name': display_name,
            'tagline': tagline,
            'bio': bio,
            'skills': skills,
            'interests': interests,
        },
        'vision': {
            'vision': vision,
            'is_public': random.random() < 0.7,  # 70%が公開
        },
        'social_links': social_links,
        'stats': {
            'total_attendance_days': total_days,
            'current_streak_days': current_streak,
            'max_streak_days': max_streak,
            'total_duration_minutes': total_days * random.randint(45, 75),
        },
        'title_level': title_level,
    }


# ========================================
# データベース操作
# ========================================

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


def seed_users(session, num_users: int):
    """ユーザーデータを投入"""
    print(f'{num_users}人のユーザーを生成中...')

    for i in range(1, num_users + 1):
        user_data = generate_user(i)
        user_id = uuid4()
        now = datetime.now()

        # 登録日をランダムに過去に設定
        days_ago = user_data['stats']['total_attendance_days'] + random.randint(5, 30)
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
            last_attendance_date=date.today() - timedelta(days=random.randint(0, 7)),
            first_attendance_date=created_at.date() + timedelta(days=random.randint(1, 5)),
            total_duration_minutes=user_data['stats']['total_duration_minutes'],
            created_at=created_at,
            updated_at=now,
        )
        session.add(stats)

        # 称号実績
        days_for_level = {1: 0, 2: 7, 3: 30, 4: 60, 5: 100, 6: 150, 7: 250, 8: 365}
        for level in range(1, user_data['title_level'] + 1):
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

        # 進捗表示
        if i % 10 == 0 or i == num_users:
            print(f'  [{i}/{num_users}] 完了')

    session.commit()
    print(f'\n✅ {num_users}人のユーザーを追加しました')


def print_stats(session):
    """統計情報を表示"""
    print('\n📊 データ統計:')
    print(f'  ユーザー数: {session.query(UserModel).count()}')
    print(f'  メタデータ: {session.query(UserMetadataModel).count()}')
    print(f'  ビジョン: {session.query(UserVisionModel).count()}')
    print(f'  SNSリンク: {session.query(UserSocialLinkModel).count()}')
    print(f'  参加統計: {session.query(AttendanceStatisticsModel).count()}')
    print(f'  称号実績: {session.query(TitleAchievementModel).count()}')


def main():
    """メイン処理"""
    print('=' * 50)
    print('Ghoona Camp シードデータ投入スクリプト')
    print('=' * 50)
    print()

    session = SessionLocal()

    try:
        clear_data(session)
        seed_users(session, NUM_USERS)
        print_stats(session)
        print()
        print('✅ シードデータの投入が完了しました！')
        print()
        print('テスト用アカウント:')
        print('  Email: user001@example.com')
        print('  Password: password123')
        print()
    except Exception as e:
        session.rollback()
        print(f'❌ エラーが発生しました: {e}')
        import traceback
        traceback.print_exc()
        raise
    finally:
        session.close()


if __name__ == '__main__':
    main()
