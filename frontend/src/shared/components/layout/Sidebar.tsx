'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/shared/providers/AuthProvider';
import {
  Home,
  Compass,
  Bookmark,
  MessageCircle,
  BarChart3,
  ShieldCheck,
  User,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  onOpenCreatePost?: () => void;
}

export function Sidebar({ onOpenCreatePost }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { label: 'Feed', href: '/', icon: Home },
    { label: 'Explore & Search', href: '/explore', icon: Compass },
    { label: 'Saved Bookmarks', href: '/bookmarks', icon: Bookmark },
    { label: 'Messages', href: '/chat', icon: MessageCircle },
    { label: 'Creator Analytics', href: '/analytics', icon: BarChart3 },
    ...(user?.role === 'ADMIN'
      ? [{ label: 'Admin Panel', href: '/admin', icon: ShieldCheck }]
      : []),
    ...(user
      ? [{ label: 'Profile', href: `/profile/${user.username}`, icon: User }]
      : []),
  ];

  return (
    <aside className="sticky top-20 hidden lg:flex flex-col gap-6 w-64 shrink-0">
      <div className="glass-card p-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/30 shadow-md shadow-primary/10'
                  : 'text-gray-400 hover:bg-surface-hover hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {user && onOpenCreatePost && (
        <button
          onClick={onOpenCreatePost}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary py-3.5 text-sm font-semibold text-white shadow-xl shadow-primary/25 hover:opacity-95 transition active:scale-[0.99]"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Create Post</span>
        </button>
      )}

      {/* Educational Hub Card */}
      <div className="glass-card p-4 bg-gradient-to-br from-surface/90 to-primary/10 border-primary/20">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="h-4 w-4" />
          <span>Cognify Hub</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Share your knowledge, solve complex problems, and build your educational portfolio.
        </p>
      </div>
    </aside>
  );
}
