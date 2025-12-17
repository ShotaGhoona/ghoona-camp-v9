'use client';

import { useState, useCallback } from 'react';

export function useCompareMode(defaultMode = false) {
  const [isCompareMode, setIsCompareMode] = useState(defaultMode);

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode((prev) => !prev);
  }, []);

  return {
    isCompareMode,
    setIsCompareMode,
    toggleCompareMode,
  };
}
