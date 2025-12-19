"""称号関連のドメイン例外"""


class TitleLevelInvalidError(Exception):
    """称号レベルが不正（1-8の範囲外）"""

    pass
