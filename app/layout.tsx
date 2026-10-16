import { type Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CurrentYear } from '@/components/current-year';
import Header from '@/components/header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '民泊アプリ',
  description: 'フルスタックNext.js開発入門',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='ja'>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header />
          {children}
          <footer className='bg-gray-900 px-4 md:px-6 py-8'>
            <p className='text-sm text-slate-300 text-center'>
              created by @handle <CurrentYear />
            </p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
