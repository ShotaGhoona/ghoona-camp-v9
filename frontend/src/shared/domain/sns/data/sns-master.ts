/**
 * SNSドメイン - マスターデータ
 */

import {
  ExternalLink,
  Github,
  Instagram,
  Linkedin,
  Twitter,
} from 'lucide-react';

import type { SnsPlatform, SnsPlatformConfig } from '../model/types';

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
