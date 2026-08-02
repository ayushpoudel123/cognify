'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/providers/AuthProvider';
import { apiClient } from '@/shared/lib/axios';
import { getSocket } from '@/shared/lib/socket';
import { getMediaUrl } from '@/shared/lib/utils';
import { Search, Bell, MessageSquare, BookOpen, LogOut, Heart, UserPlus, CheckCircle2, MessageCircle } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res: any = await apiClient.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const socket = getSocket(user.id);
      socket.on('notification', (newNotif: any) => {
        setNotifications((prev) => [newNotif, ...prev]);
      });
      return () => {
        socket.off('notification');
      };
    }
  }, [user]);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await apiClient.patch(`/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white shadow-lg shadow-primary/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Cognify
          </span>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="relative hidden md:flex w-full max-w-md items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search educational topics, users, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-surface-border bg-surface/60 pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
          />
        </form>

        {/* User Right Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/chat"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-surface/40 text-gray-300 hover:bg-surface hover:text-white transition"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>

              {/* Notifications Bell Trigger & Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifPopover(!showNotifPopover)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-surface/40 text-gray-300 hover:bg-surface hover:text-white transition"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifPopover && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card p-0 shadow-2xl border-primary/30 z-50 animate-in fade-in zoom-in duration-150">
                    <div className="p-4 border-b border-surface-border flex items-center justify-between">
                      <span className="font-bold text-sm text-white flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        <span>Notifications</span>
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {unreadCount} unread
                      </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto flex flex-col divide-y divide-surface-border">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`p-3.5 flex items-start gap-3 text-xs transition cursor-pointer ${
                              !n.isRead ? 'bg-primary/10' : 'hover:bg-surface/50'
                            }`}
                          >
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0 mt-0.5">
                              {n.actor?.profile?.avatar ? (
                                <img src={getMediaUrl(n.actor.profile.avatar)} alt={n.actor.username} className="h-full w-full object-cover" />
                              ) : (
                                n.actor?.username?.[0]?.toUpperCase() || 'U'
                              )}
                            </div>

                            <div className="flex flex-col flex-1 min-w-0">
                              <p className="text-gray-200 leading-snug">
                                <span className="font-semibold text-white">@{n.actor?.username}</span>{' '}
                                {n.message || 'interacted with your profile'}
                              </p>
                              <span className="text-[10px] text-gray-400 mt-1">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {!n.isRead && (
                              <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-gray-400">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-surface-border" />

              <Link
                href={`/profile/${user.username}`}
                className="flex items-center gap-2.5 rounded-full p-1 border border-surface-border hover:border-primary/50 transition"
              >
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold overflow-hidden border border-primary/30">
                  {user.profile?.avatar ? (
                    <img src={getMediaUrl(user.profile.avatar)} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    user.username?.[0]?.toUpperCase()
                  )}
                </div>
                <span className="hidden lg:inline text-sm font-medium text-gray-200 pr-2">
                  @{user.username}
                </span>
              </Link>

              <button
                onClick={logout}
                title="Logout"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-300 hover:text-white transition px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:opacity-90 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
