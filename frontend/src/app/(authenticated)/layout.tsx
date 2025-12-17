/**
 * 認証済みユーザー用レイアウト
 * 認証チェックはMiddlewareで実施済みのため、ここではレイアウトのみを提供
 */
import { generateAuthenticatedMetadata } from '@/shared/lib/global-metadata';
import { AppHeader } from '@/widgets/common/layout/header/ui/AppHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = generateAuthenticatedMetadata();

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <main className="flex min-h-0 flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
