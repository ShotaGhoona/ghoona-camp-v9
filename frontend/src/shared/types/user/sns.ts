import {
  ExternalLink,
  Github,
  Instagram,
  Linkedin,
  Twitter,
} from 'lucide-react';

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
export interface SnsPlatformConfig {
  label: string;
  icon: typeof Twitter;
}

/** SNSプラットフォームごとの設定マップ */
export const SNS_PLATFORM_CONFIG: Record<SnsPlatform, SnsPlatformConfig> = {
  twitter: {
    label: 'Twitter',
    icon: Twitter,
  },
  instagram: {
    label: 'Instagram',
    icon: Instagram,
  },
  github: {
    label: 'GitHub',
    icon: Github,
  },
  linkedin: {
    label: 'LinkedIn',
    icon: Linkedin,
  },
  website: {
    label: 'Website',
    icon: ExternalLink,
  },
  blog: {
    label: 'Blog',
    icon: ExternalLink,
  },
  note: {
    label: 'note',
    icon: ExternalLink,
  },
};

/** SNSプラットフォームのラベルを取得 */
export function getSnsLabel(platform: SnsPlatform): string {
  return SNS_PLATFORM_CONFIG[platform]?.label ?? platform;
}

/** SNSプラットフォームのアイコンコンポーネントを取得 */
export function getSnsIcon(platform: SnsPlatform) {
  return SNS_PLATFORM_CONFIG[platform]?.icon ?? ExternalLink;
}
