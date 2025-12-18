import { useState, useMemo } from 'react';

const DEFAULT_DISPLAY_COUNT = 20;

interface UseExpandableTagsOptions {
  tags: string[];
  selectedTags: string[];
  initialDisplayCount?: number;
}

interface UseExpandableTagsReturn {
  displayTags: string[];
  hiddenCount: number;
  isExpanded: boolean;
  expand: () => void;
  collapse: () => void;
  shouldShowExpandButton: boolean;
  shouldShowCollapseButton: boolean;
}

export function useExpandableTags({
  tags,
  selectedTags,
  initialDisplayCount = DEFAULT_DISPLAY_COUNT,
}: UseExpandableTagsOptions): UseExpandableTagsReturn {
  const [isExpanded, setIsExpanded] = useState(false);

  const { displayTags, hiddenCount } = useMemo(() => {
    const selected = tags.filter((tag) => selectedTags.includes(tag));
    const unselected = tags.filter((tag) => !selectedTags.includes(tag));

    if (isExpanded) {
      return {
        displayTags: tags,
        hiddenCount: 0,
      };
    }

    const remainingSlots = Math.max(0, initialDisplayCount - selected.length);
    const display = [...selected, ...unselected.slice(0, remainingSlots)];

    return {
      displayTags: display,
      hiddenCount: tags.length - display.length,
    };
  }, [tags, selectedTags, isExpanded, initialDisplayCount]);

  const expand = () => setIsExpanded(true);
  const collapse = () => setIsExpanded(false);

  return {
    displayTags,
    hiddenCount,
    isExpanded,
    expand,
    collapse,
    shouldShowExpandButton: hiddenCount > 0 && !isExpanded,
    shouldShowCollapseButton: isExpanded && tags.length > initialDisplayCount,
  };
}
