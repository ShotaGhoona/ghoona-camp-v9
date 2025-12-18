import { useState, useMemo } from 'react';

/**
 * タグ検索用のカスタムフック
 * @param tags - 検索対象のタグ一覧
 * @returns 検索クエリ、セッター、フィルター済みタグ
 */
export function useTagSearch<T extends string | { name: string }>(tags: T[]) {
  const [query, setQuery] = useState('');

  const filteredTags = useMemo(() => {
    if (!query.trim()) return tags;

    const lowerQuery = query.toLowerCase();
    return tags.filter((tag) => {
      const tagName = typeof tag === 'string' ? tag : tag.name;
      return tagName.toLowerCase().includes(lowerQuery);
    });
  }, [tags, query]);

  const clearQuery = () => setQuery('');

  return {
    query,
    setQuery,
    clearQuery,
    filteredTags,
    hasQuery: query.trim().length > 0,
  };
}

/**
 * 称号検索用のカスタムフック
 * @param titles - 検索対象の称号一覧
 * @returns 検索クエリ、セッター、フィルター済み称号
 */
export function useTitleSearch<T extends { nameJp: string; nameEn: string }>(
  titles: T[],
) {
  const [query, setQuery] = useState('');

  const filteredTitles = useMemo(() => {
    if (!query.trim()) return titles;

    const lowerQuery = query.toLowerCase();
    return titles.filter(
      (title) =>
        title.nameJp.toLowerCase().includes(lowerQuery) ||
        title.nameEn.toLowerCase().includes(lowerQuery),
    );
  }, [titles, query]);

  const clearQuery = () => setQuery('');

  return {
    query,
    setQuery,
    clearQuery,
    filteredTitles,
    hasQuery: query.trim().length > 0,
  };
}
