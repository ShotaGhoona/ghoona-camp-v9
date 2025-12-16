import type { Metadata } from 'next';

const APP_NAME = 'Ghoona Camp';
const APP_DESCRIPTION = '朝活の仲間と一緒に成長する、コミュニティ重視のオンライン朝活サービス';

/**
 * 環境に応じたメタデータを生成
 */
export function generateMetadata(): Metadata {
  const environment = process.env.NODE_ENV;

  if (environment === 'development') {
    return {
      title: `DEV - ${APP_NAME}`,
      description: 'Development mode',
      robots: 'noindex, nofollow',
    };
  }

  if (environment === 'test') {
    return {
      title: `TEST - ${APP_NAME}`,
      description: 'Test environment',
      robots: 'noindex',
    };
  }

  return {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    robots: 'index, follow',
  };
}

/**
 * 公開ページ用のメタデータを生成（アイコン付き）
 */
export function generatePublicMetadata(): Metadata {
  const baseMetadata = generateMetadata();

  return {
    ...baseMetadata,
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png',
    },
  };
}

/**
 * 認証済みユーザー用のメタデータを生成（アイコン付き）
 */
export function generateAuthenticatedMetadata(): Metadata {
  const baseMetadata = generateMetadata();

  return {
    ...baseMetadata,
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png',
    },
  };
}