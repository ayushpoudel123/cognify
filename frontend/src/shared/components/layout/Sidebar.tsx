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
} from 'lucide-react';

interface SidebarProps {
  onOpenCreatePost?: () => void;
}

export function Sidebar({ onOpenCreatePost }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { label: 'Feed', href: '/', icon: Home },
    { label: 'Explore & Search', href: '/explore', icon: Compass },
    ...(!isAdmin ? [{ label: 'Saved Bookmarks', href: '/bookmarks', icon: Bookmark }] : []),
    ...(!isAdmin ? [{ label: 'Messages', href: '/chat', icon: MessageCircle }] : []),
    ...(!isAdmin ? [{ label: 'Analytics', href: '/analytics', icon: BarChart3 }] : []),
    ...(isAdmin ? [{ label: 'Admin Panel', href: '/admin', icon: ShieldCheck }] : []),
    ...(user ? [{ label: 'My Profile', href: `/profile/${user.username}`, icon: User }] : []),
  ];

  return (
    <aside className="sticky top-16 hidden lg:flex flex-col gap-3 w-60 shrink-0">
      <nav className="bg-white rounded-2xl border border-gray-200 p-2 flex flex-col gap-0.5 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {user && !isAdmin && onOpenCreatePost && (
        <button
          onClick={onOpenCreatePost}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-hover transition shadow-sm"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Create Post</span>
        </button>
      )}

      {isAdmin && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Admin Mode</span>
          </div>
          <p className="text-xs text-amber-600 leading-relaxed">
            You are logged in as a System Administrator. Post creation is disabled for admin accounts.
          </p>
        </div>
      )}
    </aside>
  );
}
