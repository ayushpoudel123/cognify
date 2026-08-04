'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/providers/AuthProvider';
import { apiClient } from '@/shared/lib/axios';
import { getSocket } from '@/shared/lib/socket';
import { getMediaUrl } from '@/shared/lib/utils';
import { Search, Bell, MessageSquare, BookOpen, LogOut } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-primary hidden sm:inline">Cognify</span>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="relative hidden md:flex flex-1 max-w-md items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search educational topics, users, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-gray-100 pl-10 pr-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
          />
        </form>

        {/* User Right Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <Link
                href="/chat"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifPopover(!showNotifPopover)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifPopover && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200 shadow-float z-50 animate-in">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        Notifications
                      </span>
                      <span className="text-xs text-gray-400">{unreadCount} unread</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto flex flex-col divide-y divide-gray-100">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`p-3.5 flex items-start gap-3 text-xs transition cursor-pointer rounded-xl ${
                              !n.isRead ? 'bg-primary/5' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                              {n.actor?.profile?.avatar ? (
                                <img src={getMediaUrl(n.actor.profile.avatar)} alt={n.actor.username} className="h-full w-full object-cover" />
                              ) : (
                                n.actor?.username?.[0]?.toUpperCase() || 'U'
                              )}
                            </div>

                            <div className="flex flex-col flex-1 min-w-0">
                              <p className="text-gray-700 leading-snug">
                                <span className="font-semibold text-gray-900">@{n.actor?.username}</span>{' '}
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
                        <div className="p-8 text-center text-xs text-gray-400">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-gray-200" />

              <Link
                href={`/profile/${user.username}`}
                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 transition"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden border border-primary/20">
                  {user.profile?.avatar ? (
                    <img src={getMediaUrl(user.profile.avatar)} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    user.username?.[0]?.toUpperCase()
                  )}
                </div>
                <span className="hidden lg:inline text-sm font-medium text-gray-700 pr-1">
                  {user.profile?.fullName || `@${user.username}`}
                </span>
              </Link>

              <button
                onClick={logout}
                title="Logout"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 hover:text-primary transition px-3 py-2 rounded-xl hover:bg-gray-100"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
