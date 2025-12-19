/** 称号レベル (1-8) */
export type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** 称号のテーマカラー */
export interface TitleColorTheme {
  primary: string;
  secondary: string;
  gradient: string;
  text: string;
  bg: string;
  glow: string;
}

/** 称号情報 (titles テーブル) */
export interface Title {
  level: TitleLevel;
  nameJp: string;
  nameEn: string;
  concept: string;
  story: string;
  requiredDays: number;
  imageUrl: string;
  colorTheme: TitleColorTheme;
}
