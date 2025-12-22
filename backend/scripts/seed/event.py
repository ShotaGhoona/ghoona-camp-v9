"""イベントドメインのシードデータ

イベント（Event）と参加者（EventParticipant）データを生成します。
"""

import random  # noqa: S311
from datetime import date, datetime, time, timedelta
from uuid import uuid4

from sqlalchemy.orm import Session

from app.infrastructure.db.models.event_model import EventModel, EventParticipantModel
from app.infrastructure.db.models.user_model import UserModel

# ruff: noqa: S311  # randomはシードデータ生成用なので問題なし


# ========================================
# イベントテンプレート
# ========================================

EVENT_TEMPLATES = {
    'study': [
        {
            'title': 'もくもく会',
            'description': '各自で好きな勉強・開発をする自習タイム。質問も気軽にどうぞ！',
            'start_time': time(6, 0),
            'end_time': time(7, 0),
        },
        {
            'title': 'プログラミング学習会',
            'description': 'プログラミングを一緒に学びましょう。初心者歓迎です。',
            'start_time': time(6, 30),
            'end_time': time(7, 30),
        },
        {
            'title': '英語学習タイム',
            'description': '英語のリーディング・リスニングを一緒に頑張る会です。',
            'start_time': time(6, 0),
            'end_time': time(6, 45),
        },
        {
            'title': '資格試験対策会',
            'description': '各自の資格試験に向けて勉強する時間。情報交換も歓迎！',
            'start_time': time(5, 30),
            'end_time': time(6, 30),
        },
        {
            'title': 'LT練習会',
            'description': '5分のLTを練習する会。フィードバックし合いましょう。',
            'start_time': time(7, 0),
            'end_time': time(8, 0),
        },
    ],
    'exercise': [
        {
            'title': '朝ランニング',
            'description': 'オンラインで繋がりながら各自走ります。走り終わったら報告！',
            'start_time': time(5, 30),
            'end_time': time(6, 15),
        },
        {
            'title': '筋トレ会',
            'description': '一緒に筋トレしましょう！YouTube動画を一緒に見ながらやります。',
            'start_time': time(6, 0),
            'end_time': time(6, 30),
        },
        {
            'title': 'ストレッチタイム',
            'description': '朝のストレッチで体をほぐしましょう。初心者も参加しやすいメニューです。',
            'start_time': time(6, 15),
            'end_time': time(6, 45),
        },
        {
            'title': 'HIIT朝活',
            'description': '高強度インターバルトレーニングで朝から代謝アップ！',
            'start_time': time(5, 45),
            'end_time': time(6, 15),
        },
    ],
    'meditation': [
        {
            'title': '朝の瞑想会',
            'description': '静かに瞑想する時間。ガイド付きで初心者も安心です。',
            'start_time': time(6, 0),
            'end_time': time(6, 30),
        },
        {
            'title': 'マインドフルネス実践',
            'description': '呼吸法とマインドフルネス瞑想を実践します。',
            'start_time': time(5, 30),
            'end_time': time(6, 0),
        },
        {
            'title': 'ジャーナリング会',
            'description': '瞑想後にジャーナリングで思考を整理します。',
            'start_time': time(6, 0),
            'end_time': time(6, 45),
        },
    ],
    'reading': [
        {
            'title': '読書タイム',
            'description': '各自好きな本を読む時間。読了後に感想シェアもあり。',
            'start_time': time(6, 0),
            'end_time': time(7, 0),
        },
        {
            'title': '技術書を読む会',
            'description': '技術書を一緒に読み進めます。疑問点は共有して解決！',
            'start_time': time(6, 30),
            'end_time': time(7, 30),
        },
        {
            'title': 'ビジネス書輪読会',
            'description': '同じ本を読んでディスカッションします。今月のテーマ本あり。',
            'start_time': time(6, 0),
            'end_time': time(7, 0),
        },
    ],
    'general': [
        {
            'title': '雑談モーニング',
            'description': '朝から気軽に雑談する会。コーヒー片手にどうぞ。',
            'start_time': time(7, 0),
            'end_time': time(7, 30),
        },
        {
            'title': '週次振り返り会',
            'description': '1週間の振り返りと来週の目標を共有する会です。',
            'start_time': time(6, 30),
            'end_time': time(7, 15),
        },
        {
            'title': '朝活スタンドアップ',
            'description': '今日やることを宣言してスタートする会。3分スピーチ。',
            'start_time': time(6, 0),
            'end_time': time(6, 15),
        },
        {
            'title': '作業報告会',
            'description': '前日の成果と今日の予定を報告し合う会です。',
            'start_time': time(6, 0),
            'end_time': time(6, 30),
        },
    ],
}

# 繰り返しパターン
RECURRENCE_PATTERNS = ['daily', 'weekly', 'monthly']


# ========================================
# データベース操作
# ========================================


def clear_event_data(session: Session) -> None:
    """イベント関連データをクリア"""
    print('イベント関連データを削除中...')
    session.query(EventParticipantModel).delete()
    session.query(EventModel).delete()
    session.commit()
    print('イベント関連データを削除しました')


def seed_events(session: Session) -> None:
    """イベントデータを投入（user001を主催者として、2025年12月〜1月を中心に）"""
    print('\nイベントデータを生成中...')

    # user001を取得（主催者として使用）
    user001 = (
        session.query(UserModel).filter(UserModel.email == 'user001@example.com').first()
    )
    if not user001:
        print('  user001@example.comが見つかりません')
        return

    # 他のユーザーを取得（参加者用、主催者用）
    other_users = (
        session.query(UserModel)
        .filter(UserModel.email != 'user001@example.com')
        .limit(30)
        .all()
    )

    now = datetime.now()
    events_created = []

    # ========================================
    # user001が主催するイベント（定期開催含む）
    # ========================================

    user001_events = [
        # 12月の定期開催イベント
        {
            'template': EVENT_TEMPLATES['study'][0],  # もくもく会
            'event_type': 'study',
            'dates': [date(2025, 12, d) for d in [2, 9, 16, 23, 30] if d <= 31],
            'is_recurring': True,
            'recurrence_pattern': 'weekly',
            'max_participants': 20,
        },
        {
            'template': EVENT_TEMPLATES['meditation'][0],  # 朝の瞑想会
            'event_type': 'meditation',
            'dates': [date(2025, 12, d) for d in range(1, 32) if d <= 31],
            'is_recurring': True,
            'recurrence_pattern': 'daily',
            'max_participants': 10,
        },
        {
            'template': EVENT_TEMPLATES['exercise'][1],  # 筋トレ会
            'event_type': 'exercise',
            'dates': [date(2025, 12, d) for d in [3, 10, 17, 24, 31] if d <= 31],
            'is_recurring': True,
            'recurrence_pattern': 'weekly',
            'max_participants': 15,
        },
        # 1月のイベント
        {
            'template': EVENT_TEMPLATES['general'][1],  # 週次振り返り会
            'event_type': 'general',
            'dates': [date(2026, 1, d) for d in [5, 12, 19, 26]],
            'is_recurring': True,
            'recurrence_pattern': 'weekly',
            'max_participants': 30,
        },
        {
            'template': EVENT_TEMPLATES['reading'][0],  # 読書タイム
            'event_type': 'reading',
            'dates': [date(2026, 1, d) for d in [4, 11, 18, 25]],
            'is_recurring': True,
            'recurrence_pattern': 'weekly',
            'max_participants': None,
        },
    ]

    for event_data in user001_events:
        template = event_data['template']
        for scheduled_date in event_data['dates']:
            event = EventModel(
                id=uuid4(),
                creator_id=user001.id,
                title=template['title'],
                description=template['description'],
                event_type=event_data['event_type'],
                scheduled_date=scheduled_date,
                start_time=template['start_time'],
                end_time=template['end_time'],
                max_participants=event_data['max_participants'],
                is_recurring=event_data['is_recurring'],
                recurrence_pattern=event_data['recurrence_pattern'],
                is_active=True,
                created_at=now - timedelta(days=random.randint(10, 30)),
                updated_at=now,
            )
            session.add(event)
            events_created.append(event)

    print(f'  user001主催: {len(events_created)}件のイベントを追加')

    # ========================================
    # 他ユーザーが主催するイベント
    # ========================================

    other_events_count = 0
    for _i, user in enumerate(other_users[:15]):  # 最大15人が主催
        # 各ユーザーが1-3個のイベントを主催
        num_events = random.randint(1, 3)
        event_type = random.choice(list(EVENT_TEMPLATES.keys()))
        templates = EVENT_TEMPLATES[event_type]

        for _ in range(num_events):
            template = random.choice(templates)

            # 12月〜1月のランダムな日付
            base_date = date(2025, 12, 1)
            days_offset = random.randint(0, 60)
            scheduled_date = base_date + timedelta(days=days_offset)

            is_recurring = random.random() < 0.3  # 30%が定期開催

            event = EventModel(
                id=uuid4(),
                creator_id=user.id,
                title=template['title'],
                description=template['description'],
                event_type=event_type,
                scheduled_date=scheduled_date,
                start_time=template['start_time'],
                end_time=template['end_time'],
                max_participants=random.choice([None, 5, 10, 15, 20, 30]),
                is_recurring=is_recurring,
                recurrence_pattern=random.choice(RECURRENCE_PATTERNS) if is_recurring else None,
                is_active=True,
                created_at=now - timedelta(days=random.randint(5, 20)),
                updated_at=now,
            )
            session.add(event)
            events_created.append(event)
            other_events_count += 1

    print(f'  他ユーザー主催: {other_events_count}件のイベントを追加')

    session.commit()

    # 参加者データの追加
    _seed_participants(session, events_created, user001, other_users)

    print(f'\n合計 {len(events_created)}件のイベントを追加しました')


def _seed_participants(
    session: Session,
    events: list[EventModel],
    user001: UserModel,
    other_users: list[UserModel],
) -> None:
    """参加者データを投入"""
    print('\n参加者データを生成中...')
    now = datetime.now()
    participants_count = 0

    for event in events:
        # 各イベントに0-10人の参加者を追加
        num_participants = random.randint(0, min(10, len(other_users)))

        # 主催者以外からランダムに選択
        available_users = [u for u in other_users if u.id != event.creator_id]
        if user001.id != event.creator_id:
            available_users.append(user001)

        participants = random.sample(available_users, min(num_participants, len(available_users)))

        for user in participants:
            # 定員チェック
            if event.max_participants:
                current_count = (
                    session.query(EventParticipantModel)
                    .filter(
                        EventParticipantModel.event_id == event.id,
                        EventParticipantModel.status == 'registered',
                    )
                    .count()
                )
                if current_count >= event.max_participants:
                    break

            participant = EventParticipantModel(
                id=uuid4(),
                event_id=event.id,
                user_id=user.id,
                status='registered',
                created_at=now - timedelta(days=random.randint(1, 10)),
                updated_at=now,
            )
            session.add(participant)
            participants_count += 1

    session.commit()
    print(f'  {participants_count}件の参加者データを追加')


def print_event_stats(session: Session) -> None:
    """イベント関連の統計情報を表示"""
    print('\n📊 イベントデータ統計:')
    print(f'  イベント: {session.query(EventModel).count()}')
    print(f'  参加者: {session.query(EventParticipantModel).count()}')

    # イベントタイプ別統計
    event_types = ['study', 'exercise', 'meditation', 'reading', 'general']
    for event_type in event_types:
        count = (
            session.query(EventModel).filter(EventModel.event_type == event_type).count()
        )
        print(f'    - {event_type}: {count}件')
