"""目標ドメインのシードデータ

目標（Goal）データを生成します。
"""

import random
from datetime import date, datetime, timedelta
from uuid import uuid4

from sqlalchemy.orm import Session

from app.infrastructure.db.models.goal_model import GoalModel
from app.infrastructure.db.models.user_model import UserModel


# ========================================
# データベース操作
# ========================================

def clear_goal_data(session: Session) -> None:
    """目標関連データをクリア"""
    print('目標関連データを削除中...')
    session.query(GoalModel).delete()
    session.commit()
    print('目標関連データを削除しました')


def seed_goals(session: Session) -> None:
    """目標データを投入（user001を重点的に、2025年12月を中心に）"""
    print('\n目標データを生成中...')

    # user001を取得
    user001 = session.query(UserModel).filter(UserModel.email == 'user001@example.com').first()
    if not user001:
        print('  ⚠️ user001@example.comが見つかりません')
        return

    # 他のユーザーも取得（公開目標用）
    other_users = session.query(UserModel).filter(UserModel.email != 'user001@example.com').limit(10).all()

    now = datetime.now()

    # ========================================
    # user001の目標（重点的に作成）
    # ========================================
    user001_goals = [
        # 12月内で完結する目標
        {
            'title': 'TypeScript完全マスター',
            'description': '型システムを深く理解し、実務で自信を持って使えるようになる。genericsやconditional typesも含めて学習する。',
            'started_at': date(2025, 12, 1),
            'ended_at': date(2025, 12, 31),
            'is_public': True,
        },
        {
            'title': '毎朝6時起きを習慣化',
            'description': '朝活を継続するために、6時起床を12月中に完全に習慣化する。',
            'started_at': date(2025, 12, 1),
            'ended_at': date(2025, 12, 31),
            'is_public': True,
        },
        {
            'title': '技術ブログ5記事執筆',
            'description': '学んだことをアウトプットして定着させる。週1ペースで記事を書く。',
            'started_at': date(2025, 12, 5),
            'ended_at': date(2025, 12, 28),
            'is_public': True,
        },
        # 11月から12月にかかる目標
        {
            'title': 'Next.js App Router習得',
            'description': '新しいApp Routerのパターンを理解し、実際のプロジェクトで使えるようになる。',
            'started_at': date(2025, 11, 15),
            'ended_at': date(2025, 12, 20),
            'is_public': True,
        },
        {
            'title': 'TOEIC 800点突破',
            'description': '毎朝30分の英語学習を継続。11月から模試を解き始め、12月中旬の試験で目標達成。',
            'started_at': date(2025, 11, 1),
            'ended_at': date(2025, 12, 15),
            'is_public': False,
        },
        # 12月から1月にかかる目標
        {
            'title': '個人開発アプリのリリース',
            'description': 'ずっと温めていたアイデアを形にする。12月にMVP開発、1月にリリース。',
            'started_at': date(2025, 12, 10),
            'ended_at': date(2026, 1, 31),
            'is_public': True,
        },
        {
            'title': '読書50冊チャレンジ（残り10冊）',
            'description': '年間50冊の読書目標。残り10冊を年末年始で達成する。',
            'started_at': date(2025, 12, 1),
            'ended_at': date(2026, 1, 10),
            'is_public': True,
        },
        # 長期目標
        {
            'title': 'フルスタックエンジニアへの転身',
            'description': 'フロントエンドだけでなくバックエンドも自信を持って書けるようになる。FastAPI、Go、インフラも学ぶ。',
            'started_at': date(2025, 10, 1),
            'ended_at': date(2026, 3, 31),
            'is_public': True,
        },
        {
            'title': 'OSS コントリビューション',
            'description': '興味のあるOSSプロジェクトにコントリビュートする。まずはドキュメント修正から始める。',
            'started_at': date(2025, 11, 1),
            'ended_at': date(2026, 2, 28),
            'is_public': True,
        },
        # 無期限目標
        {
            'title': '毎日のコーディング継続',
            'description': '毎日最低30分はコードを書く。GitHubの草を絶やさない。',
            'started_at': date(2025, 9, 1),
            'ended_at': None,
            'is_public': True,
        },
        {
            'title': '健康的な生活習慣の維持',
            'description': '週3回の運動、バランスの取れた食事、7時間睡眠を継続する。',
            'started_at': date(2025, 10, 15),
            'ended_at': None,
            'is_public': False,
        },
        # 過去に終了した目標（10月、11月）
        {
            'title': 'React Hooks完全理解',
            'description': 'useStateからuseReducer、カスタムフックまで完全に理解する。',
            'started_at': date(2025, 10, 1),
            'ended_at': date(2025, 10, 31),
            'is_public': True,
        },
        {
            'title': 'Docker入門',
            'description': 'Dockerの基本を理解し、開発環境をコンテナ化できるようになる。',
            'started_at': date(2025, 11, 1),
            'ended_at': date(2025, 11, 20),
            'is_public': True,
        },
    ]

    for goal_data in user001_goals:
        goal = GoalModel(
            id=uuid4(),
            user_id=user001.id,
            title=goal_data['title'],
            description=goal_data['description'],
            started_at=goal_data['started_at'],
            ended_at=goal_data['ended_at'],
            is_active=True,
            is_public=goal_data['is_public'],
            created_at=now - timedelta(days=random.randint(1, 30)),
            updated_at=now,
        )
        session.add(goal)

    print(f'  user001: {len(user001_goals)}件の目標を追加')

    # ========================================
    # 他ユーザーの公開目標
    # ========================================
    other_goals_templates = [
        {'title': 'プログラミング学習を継続する', 'description': '毎日少しずつでもコードを書く習慣をつける。'},
        {'title': '朝活を1ヶ月継続', 'description': '12月は毎日朝活に参加することを目標にする。'},
        {'title': '資格取得に向けて勉強', 'description': '業務に役立つ資格を取得するため、計画的に学習を進める。'},
        {'title': '副業プロジェクト開始', 'description': '自分のスキルを活かした副業を始める。まずは小さく始める。'},
        {'title': '英語力向上', 'description': '毎日英語に触れる時間を作り、リーディング・リスニング力を上げる。'},
        {'title': 'ポートフォリオサイト作成', 'description': '自分の実績をまとめたポートフォリオサイトを作成する。'},
        {'title': '運動習慣の確立', 'description': '週3回の運動を習慣化し、健康的な体を維持する。'},
        {'title': 'アウトプット強化', 'description': 'インプットだけでなく、ブログやSNSでアウトプットする習慣をつける。'},
        {'title': '新しい技術のキャッチアップ', 'description': '最新の技術トレンドを追い、実際に手を動かして学ぶ。'},
        {'title': 'チーム開発スキル向上', 'description': 'Git、コードレビュー、ドキュメンテーションなどチーム開発に必要なスキルを磨く。'},
    ]

    other_goal_count = 0
    for i, user in enumerate(other_users):
        # 各ユーザーに1-3個の公開目標を作成
        num_goals = random.randint(1, 3)
        selected_templates = random.sample(other_goals_templates, min(num_goals, len(other_goals_templates)))

        for template in selected_templates:
            # 12月にかかる目標を中心に
            start_offset = random.randint(-30, 15)  # 11月中旬〜12月中旬開始
            duration = random.randint(14, 60)  # 2週間〜2ヶ月
            started_at = date(2025, 12, 15) + timedelta(days=start_offset)
            ended_at = started_at + timedelta(days=duration) if random.random() < 0.8 else None

            goal = GoalModel(
                id=uuid4(),
                user_id=user.id,
                title=template['title'],
                description=template['description'],
                started_at=started_at,
                ended_at=ended_at,
                is_active=True,
                is_public=True,  # 他ユーザーは公開目標のみ
                created_at=now - timedelta(days=random.randint(1, 20)),
                updated_at=now,
            )
            session.add(goal)
            other_goal_count += 1

    session.commit()
    print(f'  他ユーザー: {other_goal_count}件の公開目標を追加')
    print(f'\n✅ 合計 {len(user001_goals) + other_goal_count}件の目標を追加しました')


def print_goal_stats(session: Session) -> None:
    """目標関連の統計情報を表示"""
    print('\n📊 目標データ統計:')
    print(f'  目標: {session.query(GoalModel).count()}')
