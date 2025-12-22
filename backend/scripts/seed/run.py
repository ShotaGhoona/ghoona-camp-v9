"""シードデータ投入スクリプト

朝活コミュニティアプリ用のリアルなテストデータを投入します。
ドメインごとに分割されたシードデータを統合して実行します。

Usage:
    make db-seed
    または
    docker compose exec backend python -m scripts.seed.run
"""

from .config import NUM_USERS, TEST_EMAIL_TEMPLATE, TEST_PASSWORD, get_session
from .event import clear_event_data, print_event_stats, seed_events
from .goal import clear_goal_data, print_goal_stats, seed_goals
from .user import clear_user_data, print_user_stats, seed_users


def main():
    """メイン処理"""
    print('=' * 50)
    print('Ghoona Camp シードデータ投入スクリプト')
    print('=' * 50)
    print()

    session = get_session()

    try:
        # ========================================
        # データクリア（依存関係の順序で削除）
        # ========================================
        print('既存データを削除中...')
        clear_event_data(session)
        clear_goal_data(session)
        clear_user_data(session)
        print('既存データを削除しました')
        print()

        # ========================================
        # シードデータ投入
        # ========================================
        seed_users(session, NUM_USERS)
        seed_goals(session)
        seed_events(session)

        # ========================================
        # 統計情報表示
        # ========================================
        print_user_stats(session)
        print_goal_stats(session)
        print_event_stats(session)

        print()
        print('✅ シードデータの投入が完了しました！')
        print()
        print('テスト用アカウント:')
        print(f'  Email: {TEST_EMAIL_TEMPLATE.format(1)}')
        print(f'  Password: {TEST_PASSWORD}')
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
