'use client';

import { Calendar, Menu, TentTree, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

const navLinks = [
  { name: 'ホーム', href: '/' },
  { name: 'ホストになる', href: '/host/dashboard' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className='bg-white border-b border-gray-100 sticky top-0 z-40'>
      <div className='container mx-auto px-4 md:px-6'>
        <div className='flex h-16 items-center justify-between'>
          {/* ロゴ部分 */}
          <Link href='/' className='flex items-center'>
            <TentTree className='mr-2 h-6 w-6' />
            <div className='text-2xl font-bold'>民泊アプリ</div>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className='hidden md:flex items-center space-x-8'>
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className='text-slate-600 font-semibold hover:text-emerald-500 transition-colors'
              >
                {link.name}
              </Link>
            ))}

            {/* 認証ボタン - デスクトップ */}
            <Show when='signed-out'>
              <SignInButton>
                <Button
                  variant='link'
                  className='text-slate-600 font-semibold text-base p-0 hover:text-emerald-500'
                >
                  ログイン
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className='rounded-full text-base bg-emerald-500 text-white hover:bg-emerald-600'>
                  無料で始める
                </Button>
              </SignUpButton>
            </Show>
            <Show when='signed-in'>
              <UserButton>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label='ダッシュボード'
                    labelIcon={<Calendar className='h-4 w-4' />}
                    href='/dashboard'
                  />
                </UserButton.MenuItems>
              </UserButton>
            </Show>
          </nav>

          {/* モバイルメニューボタン */}
          <div className='flex items-center space-x-4 md:hidden'>
            <Show when='signed-in'>
              <UserButton />
            </Show>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='text-slate-600 hover:text-emerald-500 p-1'
            >
              {mobileMenuOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {mobileMenuOpen && (
        <div className='md:hidden bg-white border-b border-gray-100'>
          <div className='space-y-1 px-4 py-3'>
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className='block py-2 text-slate-600 hover:text-emerald-500 font-medium transition-colors'
              >
                {link.name}
              </Link>
            ))}

            {/* 認証ボタン - モバイル */}
            <Show when='signed-out'>
              <div className='py-2'>
                <SignInButton>
                  <Button
                    variant='link'
                    className='w-full justify-start p-0 text-base text-slate-600 hover:text-emerald-500 font-medium'
                  >
                    ログイン
                  </Button>
                </SignInButton>
              </div>
              <div className='py-2'>
                <SignUpButton>
                  <Button className='w-full bg-emerald-500 text-white hover:bg-emerald-600'>
                    無料で始める
                  </Button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </div>
      )}
    </header>
  );
}
