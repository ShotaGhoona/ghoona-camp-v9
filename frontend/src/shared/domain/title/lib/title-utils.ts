import type { Title, TitleLevel } from '../model/types';
import { TITLE_MASTER } from '../data/title-master';

/** レベルから称号を取得 */
export function getTitleByLevel(level: TitleLevel): Title {
  return TITLE_MASTER[level - 1];
}
