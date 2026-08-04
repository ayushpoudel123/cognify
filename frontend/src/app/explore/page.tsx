'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { PostCard } from '@/features/posts/components/PostCard';
import { apiClient } from '@/shared/lib/axios';
import { getMediaUrl } from '@/shared/lib/utils';
import { Search, Compass, BookOpen, Users, Tag, SearchX } from 'lucide-react';

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
  const [hasSearched, setHasSearched] = useState(false);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  const fetchSearchOrFallback = async (searchTerm: string) => {
    setLoading(true);
    setHasSearched(!!searchTerm.trim());
    setActiveQuery(searchTerm);
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

  const hasResults =
    results.users.length > 0 || results.posts.length > 0 || results.categories.length > 0;
  const noResultsFound = hasSearched && !loading && !hasResults;

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-5">
      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
          <Compass className="h-5 w-5 text-primary" />
          <span>Search Cognify</span>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics, tutorials, skills, users…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover transition shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 h-24 animate-pulse shadow-sm" />
          ))}
        </div>
      )}

      {/* No Results Fallback */}
      {noResultsFound && (
        <div className="bg-white rounded-2xl border border-gray-200 p-14 flex flex-col items-center gap-4 text-center shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <SearchX className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-bold text-gray-800">No results found</h3>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            No matching topics, users, or posts found for{' '}
            <span className="font-semibold text-gray-700">"{activeQuery}"</span>. Try a different keyword or hashtag.
          </p>
          <button
            onClick={() => {
              setQuery('');
              fetchSearchOrFallback('');
            }}
            className="mt-2 px-5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition"
          >
            Explore All Content
          </button>
        </div>
      )}

      {/* Discovery Fallback Categories */}
      {!loading && results.categories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
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
                className="rounded-full bg-gray-100 hover:bg-primary hover:text-white border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Users Results */}
      {!loading && results.users.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            <span>People ({results.users.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.users.map((u: any) => (
              <Link
                key={u.id}
                href={`/profile/${u.username}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition group"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs overflow-hidden border border-primary/20 shrink-0">
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
                  <span className="text-[10px] text-gray-400">@{u.username}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Post Results */}
      {!loading && results.posts.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Posts ({results.posts.length})</span>
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
    <div className="flex gap-6 items-start">
      <Sidebar />
      <Suspense fallback={<div className="flex-1 bg-white rounded-2xl border border-gray-200 h-64 animate-pulse" />}>
        <ExploreContent />
      </Suspense>
    </div>
  );
}
