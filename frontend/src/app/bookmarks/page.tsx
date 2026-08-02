'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { PostCard } from '@/features/posts/components/PostCard';
import { apiClient } from '@/shared/lib/axios';
import { Bookmark, Sparkles } from 'lucide-react';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/social/bookmarks')
      .then((res: any) => setBookmarks(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex gap-8 items-start">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <Bookmark className="h-6 w-6 text-secondary" />
          <span>Saved Knowledge Collection</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card p-6 h-48 animate-pulse" />
            ))}
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="flex flex-col gap-6">
            {bookmarks.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center gap-3">
            <Bookmark className="h-10 w-10 text-secondary/40" />
            <h3 className="text-lg font-bold text-white">No Saved Posts Yet</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Bookmark useful educational posts while browsing to view them anytime here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
