import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { notoSansJP } from '@/shared/lib/global-fonts';
import { generateMetadata } from '@/shared/lib/global-metadata';
import { themeInitScript } from '@/features/core/theme/lib/theme-init-script';

export const metadata: Metadata = generateMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ja' suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={notoSansJP.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
