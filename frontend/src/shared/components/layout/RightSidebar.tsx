'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Users, Hash } from 'lucide-react';
import { apiClient } from '@/shared/lib/axios';
import { getMediaUrl } from '@/shared/lib/utils';
import { useAuth } from '@/shared/providers/AuthProvider';

interface RightSidebarProps {
  onRequireAuth?: () => void;
}

export function RightSidebar({ onRequireAuth }: RightSidebarProps) {
  const { user: currentUser } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    apiClient
      .get('/posts/trending-topics')
      .then((res: any) => setTrendingTopics(res.data || []))
      .catch(console.error);

    apiClient
      .get('/users/suggested')
      .then((res: any) => setSuggestedUsers(res.data || []))
      .catch(console.error);
  }, []);

  const handleFollowToggle = async (userId: string) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    try {
      const res: any = await apiClient.post(`/social/follow/${userId}`);
      setFollowingMap((prev) => ({
        ...prev,
        [userId]: res.data.following,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="sticky top-20 hidden xl:flex flex-col gap-4 w-72 shrink-0">
      {/* Trending Topics */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 pb-2 border-b border-gray-100">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Trending Topics</span>
        </div>
        <div className="flex flex-col gap-2">
          {trendingTopics.length > 0 ? (
            trendingTopics.map((topic: any) => (
              <Link
                key={topic.tag}
                href={`/explore?q=${encodeURIComponent(topic.tag)}`}
                className="flex items-center justify-between group py-1 px-1 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition">
                    {topic.tag.replace('#', '')}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{topic.postsFormatted}</span>
              </Link>
            ))
          ) : (
            <span className="text-xs text-gray-400 py-1">No trending topics yet.</span>
          )}
        </div>
      </div>

      {/* Suggested Users */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 pb-2 border-b border-gray-100">
          <Users className="h-4 w-4 text-primary" />
          <span>People You May Know</span>
        </div>
        <div className="flex flex-col gap-2">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map((u) => {
              const isFollowing = followingMap[u.id];
              return (
                <div key={u.id} className="flex items-center justify-between py-1">
                  <Link href={`/profile/${u.username}`} className="flex items-center gap-2.5 group min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20 shrink-0 overflow-hidden">
                      {u.profile?.avatar ? (
                        <img src={getMediaUrl(u.profile.avatar)} alt={u.username} className="h-full w-full object-cover" />
                      ) : (
                        u.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-gray-800 truncate group-hover:text-primary transition">
                        {u.profile?.fullName || u.username}
                      </span>
                      <span className="text-[10px] text-gray-400 truncate">@{u.username}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleFollowToggle(u.id)}
                    className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 ${
                      isFollowing
                        ? 'border border-gray-300 text-gray-500 hover:text-red-500 hover:border-red-300'
                        : 'bg-primary text-white hover:bg-primary-hover'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-gray-400 py-1">No suggested users found.</span>
          )}
        </div>
      </div>
    </aside>
  );
}
