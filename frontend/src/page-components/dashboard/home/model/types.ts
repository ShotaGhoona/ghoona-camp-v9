/** react-grid-layout用のレイアウトアイテム */
export type GridLayoutItem = {
  i: string; // react-grid-layout用のID（= DashboardBlock.id）
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
};

/** ブロックコンポーネントのProps */
export type DashboardBlockProps = {
  isEditMode: boolean;
};
