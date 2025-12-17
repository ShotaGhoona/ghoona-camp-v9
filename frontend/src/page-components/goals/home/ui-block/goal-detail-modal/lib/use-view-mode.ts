'use client';

import { useState, useCallback } from 'react';

export type ViewMode = 'modal' | 'sheet';

export function useViewMode(defaultMode: ViewMode = 'modal') {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'modal' ? 'sheet' : 'modal'));
  }, []);

  return {
    viewMode,
    setViewMode,
    toggleViewMode,
    isModal: viewMode === 'modal',
    isSheet: viewMode === 'sheet',
  };
}
