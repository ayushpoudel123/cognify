'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageSquare, Bookmark, Eye, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { postsApi } from '../api';
import { getMediaUrl } from '@/shared/lib/utils';
import { useAuth } from '@/shared/providers/AuthProvider';
import { EditPostModal } from './EditPostModal';
import { apiClient } from '@/shared/lib/axios';

interface PostCardProps {
  post: any;
  onPostUpdated?: () => void;
  onPostDeleted?: () => void;
  onRequireAuth?: () => void;
}

export function PostCard({ post, onPostUpdated, onPostDeleted, onRequireAuth }: PostCardProps) {
  const { user: currentUser } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isAuthor = currentUser && (currentUser.id === post.authorId || currentUser.id === post.author?.id);

  const handleLike = async () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    try {
      const res: any = await postsApi.toggleLike(post.id);
      setIsLiked(res.data.liked);
      setLikesCount((prev: number) => (res.data.liked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    try {
      const res: any = await postsApi.toggleBookmark(post.id);
      setIsBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiClient.delete(`/posts/${post.id}`);
      if (onPostDeleted) onPostDeleted();
      else if (onPostUpdated) onPostUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <article className="glass-card p-6 flex flex-col gap-4 border-surface-border hover:border-primary/30 transition-all duration-300 relative">
        {/* Header / Author Details */}
        <div className="flex items-center justify-between">
          <Link href={`/profile/${post.author?.username}`} className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/30 group-hover:border-primary transition shrink-0">
              {post.author?.profile?.avatar ? (
                <img
                  src={getMediaUrl(post.author.profile.avatar)}
                  alt={post.author.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                post.author?.username?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 group-hover:text-primary transition">
                {post.author?.profile?.fullName || post.author?.username}
              </span>
              <span className="text-xs text-gray-500">@{post.author?.username}</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {post.category && (
              <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                {post.category.name}
              </span>
            )}

            {isAuthor && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-xl p-1.5 shadow-xl border border-gray-200 flex flex-col gap-1 animate-in fade-in zoom-in duration-100">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setIsEditOpen(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Post</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleDelete();
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title & Content */}
        <div className="flex flex-col gap-2">
          <Link href={`/post/${post.id}`} className="group">
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-primary transition leading-snug">
              {post.title}
            </h2>
          </Link>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{post.content}</p>
        </div>

        {/* Media Attachments */}
        {post.media && post.media.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-surface-border mt-2">
            {post.media[0].type === 'VIDEO' ? (
              <video src={getMediaUrl(post.media[0].url)} controls className="w-full max-h-96 object-cover" />
            ) : (
              <img src={getMediaUrl(post.media[0].url)} alt={post.title} className="w-full max-h-96 object-cover" />
            )}
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {post.hashtags.map((tag: string) => (
              <Link
                key={tag}
                href={`/explore?q=${encodeURIComponent(tag)}`}
                className="text-xs font-medium text-secondary hover:underline"
              >
                #{tag.replace('#', '')}
              </Link>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-surface-border pt-4 mt-2">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-primary transition"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentsCount || 0}</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <Eye className="h-4 w-4" />
              <span>{post.viewsCount || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBookmark}
              className={`text-gray-400 hover:text-secondary transition ${
                isBookmarked ? 'text-secondary fill-current' : ''
              }`}
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>

      <EditPostModal
        isOpen={isEditOpen}
        post={post}
        onClose={() => setIsEditOpen(false)}
        onPostUpdated={onPostUpdated}
      />
    </>
  );
}
