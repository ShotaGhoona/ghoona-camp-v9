/**
 * SNSドメイン - ユーティリティ関数
 */

import { ExternalLink } from 'lucide-react';

import type { SnsPlatform } from '../model/types';
import { SNS_PLATFORM_CONFIG } from '../data/sns-master';

/** SNSプラットフォームのラベルを取得 */
export function getSnsLabel(platform: SnsPlatform): string {
  return SNS_PLATFORM_CONFIG[platform]?.label ?? platform;
}

/** SNSプラットフォームのアイコンコンポーネントを取得 */
export function getSnsIcon(platform: SnsPlatform) {
  return SNS_PLATFORM_CONFIG[platform]?.icon ?? ExternalLink;
}
