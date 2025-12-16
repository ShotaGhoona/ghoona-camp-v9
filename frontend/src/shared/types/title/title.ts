/** 称号レベル (1-8) */
export type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** 称号のテーマカラー */
export type TitleColorTheme =
  | 'slate'
  | 'zinc'
  | 'blue'
  | 'cyan'
  | 'violet'
  | 'amber'
  | 'orange'
  | 'rose';

/** 称号情報 (titles テーブル) */
export interface Title {
  level: TitleLevel;
  nameJp: string;
  nameEn: string;
  description: string;
  requiredDays: number;
  imageUrl: string | null;
  colorTheme: TitleColorTheme;
}

/** 称号マスターデータ */
export const TITLE_MASTER: Title[] = [
  {
    level: 1,
    nameJp: 'まどろみ見習い',
    nameEn: 'Sleeper',
    description: '朝活の世界に足を踏み入れたばかりの初心者。まだ眠りの誘惑と戦っている。',
    requiredDays: 0,
    imageUrl: null,
    colorTheme: 'slate',
  },
  {
    level: 2,
    nameJp: '目覚めの探求者',
    nameEn: 'Awakener',
    description: '朝の価値に気づき始めた探求者。少しずつ早起きの習慣が身についてきた。',
    requiredDays: 7,
    imageUrl: null,
    colorTheme: 'zinc',
  },
  {
    level: 3,
    nameJp: '朝霧の歩行者',
    nameEn: 'Dawn Walker',
    description: '朝霧の中を歩む者。朝活が日常の一部になりつつある。',
    requiredDays: 30,
    imageUrl: null,
    colorTheme: 'blue',
  },
  {
    level: 4,
    nameJp: '暁の先駆者',
    nameEn: 'Daybreak Pioneer',
    description: '暁を切り開く先駆者。朝活の習慣が確立され、周囲にも影響を与え始めている。',
    requiredDays: 60,
    imageUrl: null,
    colorTheme: 'cyan',
  },
  {
    level: 5,
    nameJp: '黎明の賢者',
    nameEn: 'Twilight Sage',
    description: '黎明の知恵を持つ賢者。朝活を通じて多くの学びと成長を得ている。',
    requiredDays: 100,
    imageUrl: null,
    colorTheme: 'violet',
  },
  {
    level: 6,
    nameJp: '曙光の守護者',
    nameEn: 'Aurora Guardian',
    description: '曙光を守る者。朝活コミュニティの柱として、新しい仲間を導いている。',
    requiredDays: 150,
    imageUrl: null,
    colorTheme: 'amber',
  },
  {
    level: 7,
    nameJp: '太陽の使者',
    nameEn: 'Solar Messenger',
    description: '太陽の恩恵を伝える使者。その存在がコミュニティに光をもたらしている。',
    requiredDays: 250,
    imageUrl: null,
    colorTheme: 'orange',
  },
  {
    level: 8,
    nameJp: '朝焼けの覇者',
    nameEn: 'Sunrise Sovereign',
    description: '朝焼けを制した覇者。朝活の極致に達し、伝説的な存在となっている。',
    requiredDays: 365,
    imageUrl: null,
    colorTheme: 'rose',
  },
];

/** レベルから称号を取得 */
export function getTitleByLevel(level: TitleLevel): Title {
  return TITLE_MASTER[level - 1];
}

/** 参加日数から称号を取得 */
export function getTitleByDays(days: number): Title {
  for (let i = TITLE_MASTER.length - 1; i >= 0; i--) {
    if (days >= TITLE_MASTER[i].requiredDays) {
      return TITLE_MASTER[i];
    }
  }
  return TITLE_MASTER[0];
}

/** 次の称号を取得（最高レベルの場合はnull） */
export function getNextTitle(currentLevel: TitleLevel): Title | null {
  if (currentLevel >= 8) return null;
  return TITLE_MASTER[currentLevel];
}

/** 次の称号までの残り日数を取得 */
export function getDaysToNextTitle(
  currentDays: number,
  currentLevel: TitleLevel
): number | null {
  const nextTitle = getNextTitle(currentLevel);
  if (!nextTitle) return null;
  return Math.max(0, nextTitle.requiredDays - currentDays);
}
