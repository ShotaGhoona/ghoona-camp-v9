/** メンバーフィルター状態 */
export interface MembersFilterState {
  /** 検索キーワード（名前、tagline） */
  searchQuery: string;
  /** 選択されたスキル */
  selectedSkills: string[];
  /** 選択された興味 */
  selectedInterests: string[];
  /** 選択された称号レベル */
  selectedTitleLevels: number[];
}

/** フィルターの初期状態 */
export const initialFilterState: MembersFilterState = {
  searchQuery: '',
  selectedSkills: [],
  selectedInterests: [],
  selectedTitleLevels: [],
};

/** フィルターがアクティブかどうかを判定 */
export function isFilterActive(filter: MembersFilterState): boolean {
  return (
    filter.searchQuery !== '' ||
    filter.selectedSkills.length > 0 ||
    filter.selectedInterests.length > 0 ||
    filter.selectedTitleLevels.length > 0
  );
}

/** アクティブなフィルター数を取得 */
export function getActiveFilterCount(filter: MembersFilterState): number {
  let count = 0;
  if (filter.searchQuery !== '') count++;
  count += filter.selectedSkills.length;
  count += filter.selectedInterests.length;
  count += filter.selectedTitleLevels.length;
  return count;
}
