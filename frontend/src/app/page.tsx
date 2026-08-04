'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { RightSidebar } from '@/shared/components/layout/RightSidebar';
import { PostCard } from '@/features/posts/components/PostCard';
import { CreatePostModal } from '@/features/posts/components/CreatePostModal';
import { AuthGuardModal } from '@/shared/components/AuthGuardModal';
import { postsApi } from '@/features/posts/api';
import { useAuth } from '@/shared/providers/AuthProvider';
import { Sparkles, Flame, Users as UsersIcon, Plus, Users, Compass } from 'lucide-react';
import Link from 'next/link';

export default function FeedPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'latest' | 'trending' | 'following'>('latest');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState('');

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

  const handleRequireAuth = (action = 'perform this action') => {
    setAuthAction(action);
    setAuthModalOpen(true);
  };

  const handleCreatePost = () => {
    if (!currentUser) {
      handleRequireAuth('create a post');
      return;
    }
    setIsCreateOpen(true);
  };

  const tabs = [
    { id: 'latest', label: 'Latest', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'trending', label: 'Trending', icon: <Flame className="h-4 w-4 text-amber-500" /> },
    { id: 'following', label: 'Following', icon: <UsersIcon className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="flex gap-6 items-start">
      <Sidebar onOpenCreatePost={handleCreatePost} />

      {/* Main Feed Container */}
      <section className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Feed Header Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-1.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs tracking-wide transition ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCreatePost}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition lg:hidden"
          >
            <Plus className="h-4 w-4" />
            <span>Post</span>
          </button>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 h-48 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostUpdated={fetchPosts}
                onPostDeleted={fetchPosts}
                onRequireAuth={() => handleRequireAuth('like or interact with posts')}
              />
            ))}
          </div>
        ) : activeTab === 'following' ? (
          /* Following-specific empty state */
          <div className="bg-white rounded-2xl border border-gray-200 p-14 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No posts from your connections yet</h3>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              You aren't following anyone yet, or the people you follow haven't posted recently. Discover new educators and learners!
            </p>
            <Link
              href="/explore"
              className="mt-2 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover transition"
            >
              <Compass className="h-4 w-4" />
              <span>Discover People to Follow</span>
            </Link>
          </div>
        ) : (
          /* Generic empty state */
          <div className="bg-white rounded-2xl border border-gray-200 p-14 flex flex-col items-center justify-center text-center gap-4 shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No posts here yet</h3>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              Be the first to share knowledge, write study notes, or post a question!
            </p>
            <button
              onClick={handleCreatePost}
              className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover transition"
            >
              Create First Post
            </button>
          </div>
        )}
      </section>

      <RightSidebar onRequireAuth={() => handleRequireAuth('follow users')} />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={fetchPosts}
      />

      <AuthGuardModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        action={authAction}
      />
    </div>
  );
}
