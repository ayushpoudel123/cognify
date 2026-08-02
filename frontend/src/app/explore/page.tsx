'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { PostCard } from '@/features/posts/components/PostCard';
import { apiClient } from '@/shared/lib/axios';
import { getMediaUrl } from '@/shared/lib/utils';
import { Search, Compass, BookOpen, Users, Tag, Sparkles } from 'lucide-react';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<{ users: any[]; posts: any[]; categories: any[] }>({
    users: [],
    posts: [],
    categories: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchSearchOrFallback = async (searchTerm: string) => {
    setLoading(true);
    try {
      const res: any = await apiClient.get(`/search?q=${encodeURIComponent(searchTerm)}`);
      setResults(res.data || { users: [], posts: [], categories: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchOrFallback(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSearchOrFallback(query);
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-6">
      {/* Search Input Card */}
      <div className="glass-card p-6 flex flex-col gap-4 border-primary/20">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Compass className="h-5 w-5 text-primary" />
          <span>Global Knowledge Search & Discovery</span>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics, tutorials, skills (e.g. AI, React, Systems)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface/60 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-xs font-semibold text-white shadow-lg hover:opacity-90 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Discovery Fallback Categories */}
      {results.categories && results.categories.length > 0 && (
        <div className="glass-card p-5 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-primary" />
            <span>Popular Categories</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {results.categories.map((cat: any) => (
              <button
                key={cat.id || cat.name}
                onClick={() => {
                  setQuery(cat.name);
                  fetchSearchOrFallback(cat.name);
                }}
                className="rounded-xl bg-surface hover:bg-primary/20 hover:text-primary border border-surface-border px-3.5 py-1.5 text-xs font-semibold text-gray-300 transition"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Discovery Users List */}
      {results.users && results.users.length > 0 && (
        <div className="glass-card p-5 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4 w-4 text-secondary" />
            <span>Learners & Educators ({results.users.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {results.users.map((u: any) => (
              <Link
                key={u.id}
                href={`/profile/${u.username}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface/40 hover:bg-surface border border-surface-border transition group"
              >
                <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-secondary text-xs overflow-hidden border border-secondary/30">
                  {u.profile?.avatar ? (
                    <img src={getMediaUrl(u.profile.avatar)} alt={u.username} className="h-full w-full object-cover" />
                  ) : (
                    u.username?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate group-hover:text-secondary transition">
                    {u.profile?.fullName || u.username}
                  </span>
                  <span className="text-[10px] text-gray-400">@{u.username}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results Posts List */}
      {results.posts && results.posts.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Educational Posts ({results.posts.length})</span>
          </h3>
          {results.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="flex gap-8 items-start">
      <Sidebar />
      <Suspense fallback={<div className="flex-1 glass-card p-12 h-64 animate-pulse" />}>
        <ExploreContent />
      </Suspense>
    </div>
  );
}
