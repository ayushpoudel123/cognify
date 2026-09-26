'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Auth routes that should have an isolated layout without the navigation bar
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/login/admin' ||
    pathname === '/admin/login' ||
    pathname.startsWith('/login?') ||
    pathname.startsWith('/register?');

  if (isAuthRoute) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-4 py-8 text-text-primary">
        <div className="w-full flex justify-center">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
