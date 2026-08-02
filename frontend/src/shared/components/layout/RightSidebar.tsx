'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Users, Hash, UserPlus, UserCheck } from 'lucide-react';
import { apiClient } from '@/shared/lib/axios';
import { getMediaUrl } from '@/shared/lib/utils';

export function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>({});

  const trendingTopics = [
    { tag: '#MachineLearning', posts: '2.4k posts' },
    { tag: '#WebDevelopment', posts: '1.8k posts' },
    { tag: '#DataScience', posts: '1.2k posts' },
    { tag: '#SystemDesign', posts: '950 posts' },
  ];

  useEffect(() => {
    apiClient
      .get('/users/suggested')
      .then((res: any) => {
        setSuggestedUsers(res.data || []);
      })
      .catch(console.error);
  }, []);

  const handleFollowToggle = async (userId: string) => {
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
    <aside className="sticky top-20 hidden xl:flex flex-col gap-6 w-80 shrink-0">
      {/* Trending Topics */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-white font-semibold text-base border-b border-surface-border pb-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span>Trending Topics</span>
        </div>
        <div className="flex flex-col gap-3">
          {trendingTopics.map((topic) => (
            <Link
              key={topic.tag}
              href={`/explore?q=${encodeURIComponent(topic.tag)}`}
              className="flex items-center justify-between group py-1"
            >
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary group-hover:scale-110 transition" />
                <span className="text-sm font-medium text-gray-200 group-hover:text-primary transition">
                  {topic.tag.replace('#', '')}
                </span>
              </div>
              <span className="text-xs text-gray-500">{topic.posts}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Real Suggested Educated Minds */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-white font-semibold text-base border-b border-surface-border pb-3">
          <Users className="h-5 w-5 text-secondary" />
          <span>Suggested Minds</span>
        </div>
        <div className="flex flex-col gap-3">
          {suggestedUsers.length > 0 ? (
            suggestedUsers.map((u) => {
              const isFollowing = followingMap[u.id];
              return (
                <div key={u.id} className="flex items-center justify-between py-1">
                  <Link href={`/profile/${u.username}`} className="flex items-center gap-3 group min-w-0 flex-1">
                    <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-sm border border-secondary/30 group-hover:border-secondary transition shrink-0 overflow-hidden">
                      {u.profile?.avatar ? (
                        <img src={getMediaUrl(u.profile.avatar)} alt={u.username} className="h-full w-full object-cover" />
                      ) : (
                        u.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-white truncate group-hover:text-secondary transition">
                        {u.profile?.fullName || u.username}
                      </span>
                      <span className="text-xs text-gray-400 truncate">@{u.username}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleFollowToggle(u.id)}
                    className={`ml-2 px-3 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                      isFollowing
                        ? 'border border-surface-border text-gray-400 hover:text-red-400'
                        : 'bg-primary text-white hover:bg-primary-hover'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })
          ) : (
            <span className="text-xs text-gray-500 py-2">No suggested users found.</span>
          )}
        </div>
      </div>
    </aside>
  );
}
