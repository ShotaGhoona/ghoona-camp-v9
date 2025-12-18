'use client';

import { RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/shared/ui/shadcn/lib/utils';
import { Button } from '@/shared/ui/shadcn/ui/button';
import { Badge } from '@/shared/ui/shadcn/ui/badge';
import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import { Card, CardContent } from '@/shared/ui/shadcn/ui/card';
import { TITLE_MASTER } from '@/shared/types/title/title';
import { useSkills } from '@/features/domain/user/get-skills/lib/use-skills';
import { useInterests } from '@/features/domain/user/get-interests/lib/use-interests';

import type { MembersFilterState } from '../model/types';
import { initialFilterState, isFilterActive } from '../model/types';
import { useTagSearch, useTitleSearch } from '../lib/use-tag-search';
import { useExpandableTags } from '../lib/use-expandable-tags';
import { TagSearchInput } from './components/TagSearchInput';

interface MembersFilterSidebarProps {
  isOpen: boolean;
  filter: MembersFilterState;
  onFilterChange: (filter: MembersFilterState) => void;
}

export function MembersFilterSidebar({
  isOpen,
  filter,
  onFilterChange,
}: MembersFilterSidebarProps) {
  // APIからスキル・興味一覧を取得
  const { data: skillsData } = useSkills();
  const { data: interestsData } = useInterests();

  const skills = skillsData?.data.skills ?? [];
  const interests = interestsData?.data.interests ?? [];

  // タグ検索フック
  const titleSearch = useTitleSearch(TITLE_MASTER);
  const skillSearch = useTagSearch(skills);
  const interestSearch = useTagSearch(interests);

  // 展開可能タグフック
  const skillsExpandable = useExpandableTags({
    tags: skillSearch.filteredTags,
    selectedTags: filter.selectedSkills,
  });
  const interestsExpandable = useExpandableTags({
    tags: interestSearch.filteredTags,
    selectedTags: filter.selectedInterests,
  });

  const handleSkillToggle = (skill: string) => {
    const newSkills = filter.selectedSkills.includes(skill)
      ? filter.selectedSkills.filter((s) => s !== skill)
      : [...filter.selectedSkills, skill];
    onFilterChange({ ...filter, selectedSkills: newSkills });
  };

  const handleInterestToggle = (interest: string) => {
    const newInterests = filter.selectedInterests.includes(interest)
      ? filter.selectedInterests.filter((i) => i !== interest)
      : [...filter.selectedInterests, interest];
    onFilterChange({ ...filter, selectedInterests: newInterests });
  };

  const handleTitleToggle = (level: number) => {
    const newLevels = filter.selectedTitleLevels.includes(level)
      ? filter.selectedTitleLevels.filter((l) => l !== level)
      : [...filter.selectedTitleLevels, level];
    onFilterChange({ ...filter, selectedTitleLevels: newLevels });
  };

  const handleReset = () => {
    onFilterChange(initialFilterState);
  };

  return (
    <div
      className={cn(
        'relative flex min-h-0 shrink-0 flex-col overflow-hidden bg-background py-2 shadow-raised',
        'transition-all duration-300 ease-out',
        isOpen ? 'w-96 opacity-100' : 'w-0 opacity-0'
      )}
    >
      {/* リセットボタン */}
      {isFilterActive(filter) && (
        <div className="absolute right-2 top-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleReset}
            title="リセット"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      )}

      {/* フィルター内容 */}
      <ScrollArea className="min-h-0 flex-1 pt-2">
        <div className="space-y-6 p-4">
          {/* 称号フィルター */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">称号</h3>
              <TagSearchInput
                value={titleSearch.query}
                onChange={titleSearch.setQuery}
                onClear={titleSearch.clearQuery}
                placeholder="称号を検索"
              />
            </div>
            <Card variant="inset" className="py-3">
              <CardContent className="flex flex-wrap gap-2 px-3">
                {titleSearch.filteredTitles.map((title) => (
                  <Badge
                    key={title.level}
                    variant={
                      filter.selectedTitleLevels.includes(title.level)
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer transition-colors"
                    onClick={() => handleTitleToggle(title.level)}
                  >
                    {title.nameJp}
                  </Badge>
                ))}
                {titleSearch.filteredTitles.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    該当する称号がありません
                  </span>
                )}
              </CardContent>
            </Card>
          </div>

          {/* スキルフィルター */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">
                スキル
                {filter.selectedSkills.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filter.selectedSkills.length}件選択)
                  </span>
                )}
              </h3>
              <TagSearchInput
                value={skillSearch.query}
                onChange={skillSearch.setQuery}
                onClear={skillSearch.clearQuery}
                placeholder="スキルを検索"
              />
            </div>
            <Card variant="inset" className="py-3">
              <CardContent className="flex flex-col gap-2 px-3">
                <div className="flex flex-wrap gap-2">
                  {skillsExpandable.displayTags.map((skill) => (
                    <Badge
                      key={skill}
                      variant={
                        filter.selectedSkills.includes(skill)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer transition-colors"
                      onClick={() => handleSkillToggle(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                  {skillsExpandable.shouldShowExpandButton && (
                    <button
                      type="button"
                      onClick={skillsExpandable.expand}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/50 px-3 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      他{skillsExpandable.hiddenCount}件
                      <ChevronDown className="size-3" />
                    </button>
                  )}
                </div>
                {skillsExpandable.shouldShowCollapseButton && (
                  <button
                    type="button"
                    onClick={skillsExpandable.collapse}
                    className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    閉じる
                    <ChevronUp className="size-3" />
                  </button>
                )}
                {skillSearch.filteredTags.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    該当するスキルがありません
                  </span>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 興味フィルター */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-foreground">
                興味・関心
                {filter.selectedInterests.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({filter.selectedInterests.length}件選択)
                  </span>
                )}
              </h3>
              <TagSearchInput
                value={interestSearch.query}
                onChange={interestSearch.setQuery}
                onClear={interestSearch.clearQuery}
                placeholder="興味を検索"
              />
            </div>
            <Card variant="inset" className="py-3">
              <CardContent className="flex flex-col gap-2 px-3">
                <div className="flex flex-wrap gap-2">
                  {interestsExpandable.displayTags.map((interest) => (
                    <Badge
                      key={interest}
                      variant={
                        filter.selectedInterests.includes(interest)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer transition-colors"
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                  {interestsExpandable.shouldShowExpandButton && (
                    <button
                      type="button"
                      onClick={interestsExpandable.expand}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/50 px-3 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      他{interestsExpandable.hiddenCount}件
                      <ChevronDown className="size-3" />
                    </button>
                  )}
                </div>
                {interestsExpandable.shouldShowCollapseButton && (
                  <button
                    type="button"
                    onClick={interestsExpandable.collapse}
                    className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    閉じる
                    <ChevronUp className="size-3" />
                  </button>
                )}
                {interestSearch.filteredTags.length === 0 && (
                  <span className="text-sm text-muted-foreground">
                    該当する興味がありません
                  </span>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
