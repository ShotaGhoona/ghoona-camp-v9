"""目標関連の例外"""


class GoalNotFoundError(Exception):
    """目標が見つからない"""

    pass


class GoalForbiddenError(Exception):
    """目標へのアクセス権限がない"""

    pass
