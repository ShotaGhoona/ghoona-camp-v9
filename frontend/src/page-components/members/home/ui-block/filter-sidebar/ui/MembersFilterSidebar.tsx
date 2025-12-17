'use client';

import { RotateCcw } from 'lucide-react';

import { cn } from '@/shared/ui/shadcn/lib/utils';
import { Button } from '@/shared/ui/shadcn/ui/button';
import { Badge } from '@/shared/ui/shadcn/ui/badge';
import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import { Card, CardContent } from '@/shared/ui/shadcn/ui/card';
import { ALL_SKILLS, ALL_INTERESTS } from '@/shared/dummy-data/members/members';
import { TITLE_MASTER } from '@/shared/types/title/title';

import type { MembersFilterState } from '../model/types';
import { initialFilterState, isFilterActive } from '../model/types';
import { useTagSearch, useTitleSearch } from '../lib/use-tag-search';
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
  // タグ検索フック
  const titleSearch = useTitleSearch(TITLE_MASTER);
  const skillSearch = useTagSearch(ALL_SKILLS);
  const interestSearch = useTagSearch(ALL_INTERESTS);

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
              <CardContent className="flex flex-wrap gap-2 px-3">
                {skillSearch.filteredTags.map((skill) => (
                  <Badge
                    key={skill}
                    variant={
                      filter.selectedSkills.includes(skill) ? 'default' : 'outline'
                    }
                    className="cursor-pointer transition-colors"
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
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
              <CardContent className="flex flex-wrap gap-2 px-3">
                {interestSearch.filteredTags.map((interest) => (
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
