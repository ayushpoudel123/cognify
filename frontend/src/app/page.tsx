'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { RightSidebar } from '@/shared/components/layout/RightSidebar';
import { PostCard } from '@/features/posts/components/PostCard';
import { CreatePostModal } from '@/features/posts/components/CreatePostModal';
import { postsApi } from '@/features/posts/api';
import { Sparkles, Flame, Users as UsersIcon, Plus } from 'lucide-react';

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<'latest' | 'trending' | 'following'>('latest');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let res: any;
      if (activeTab === 'trending') {
        res = await postsApi.getTrendingFeed();
      } else if (activeTab === 'following') {
        res = await postsApi.getFollowingFeed();
      } else {
        res = await postsApi.getLatestFeed();
      }
      setPosts(res.data?.items || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  return (
    <div className="flex gap-8 items-start">
      <Sidebar onOpenCreatePost={() => setIsCreateOpen(true)} />

      {/* Main Feed Container */}
      <section className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Feed Header Tabs */}
        <div className="glass-card p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('latest')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition ${
                activeTab === 'latest'
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-gray-400 hover:text-white hover:bg-surface'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Latest</span>
            </button>

            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition ${
                activeTab === 'trending'
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-gray-400 hover:text-white hover:bg-surface'
              }`}
            >
              <Flame className="h-4 w-4 text-amber-400" />
              <span>Trending</span>
            </button>

            <button
              onClick={() => setActiveTab('following')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition ${
                activeTab === 'following'
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-gray-400 hover:text-white hover:bg-surface'
              }`}
            >
              <UsersIcon className="h-4 w-4" />
              <span>Following</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:opacity-90 transition lg:hidden"
          >
            <Plus className="h-4 w-4" />
            <span>Post</span>
          </button>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 h-48 animate-pulse bg-surface/40" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center gap-3">
            <Sparkles className="h-10 w-10 text-primary/40" />
            <h3 className="text-lg font-bold text-white">No Educational Posts Yet</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Be the first to share knowledge, write notes, or post a study question!
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover transition"
            >
              Create First Post
            </button>
          </div>
        )}
      </section>

      <RightSidebar />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={fetchPosts}
      />
    </div>
  );
}
