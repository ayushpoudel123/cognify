'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { apiClient } from '@/shared/lib/axios';
import { BarChart3, Eye, Heart, MessageSquare, Users, Sparkles } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/analytics/dashboard')
      .then((res: any) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex gap-8 items-start">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-xl">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span>Creator Dashboard & Insights</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-28 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Total Views</span>
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <span className="text-2xl font-bold text-gray-900 mt-2">{stats.totalViews}</span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Total Likes</span>
                  <Heart className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-2xl font-bold text-gray-900 mt-2">{stats.totalLikes}</span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Comments</span>
                  <MessageSquare className="h-4 w-4 text-secondary" />
                </div>
                <span className="text-2xl font-bold text-gray-900 mt-2">{stats.totalComments}</span>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Followers</span>
                  <Users className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-2xl font-bold text-gray-900 mt-2">{stats.followersCount}</span>
              </div>
            </div>

            {/* Top Posts Table */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span>Top Performing Educational Posts</span>
              </h3>
              <div className="flex flex-col gap-3">
                {stats.topPosts?.map((post: any) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <span className="text-sm font-semibold text-gray-900 truncate max-w-md">{post.title}</span>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                      <span>{post.viewsCount} views</span>
                      <span>{post.likesCount} likes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
