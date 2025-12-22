import { useState, useCallback } from 'react';

export type ViewMode = 'modal' | 'sheet';

/**
 * モーダル/シートの表示モードを管理するhook
 */
export function useViewMode(defaultMode: ViewMode = 'modal') {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  // トグル
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
