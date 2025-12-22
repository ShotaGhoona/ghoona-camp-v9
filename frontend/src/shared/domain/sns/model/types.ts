/**
 * SNSドメイン - 型定義
 */

import type { Twitter } from 'lucide-react';

/** SNSプラットフォームの種類 */
export type SnsPlatform =
  | 'twitter'
  | 'instagram'
  | 'github'
  | 'linkedin'
  | 'website'
  | 'blog'
  | 'note';

/** SNSプラットフォームの設定 */
export type SnsPlatformConfig = {
  label: string;
  icon: typeof Twitter;
};
