'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { PostCard } from '@/features/posts/components/PostCard';
import { postsApi } from '@/features/posts/api';
import { apiClient } from '@/shared/lib/axios';
import { MessageSquare, Send, CornerDownRight } from 'lucide-react';

export default function PostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPostAndComments = async () => {
    if (!params?.id) return;
    try {
      const [postRes, commentsRes]: any = await Promise.all([
        postsApi.getPostById(params.id as string),
        apiClient.get(`/comments/post/${params.id}`),
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostAndComments();
  }, [params?.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await apiClient.post('/comments', {
        postId: params?.id,
        content: newComment,
      });
      setNewComment('');
      fetchPostAndComments();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-8">
        <Sidebar />
        <div className="flex-1 glass-card p-12 h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex gap-8 items-start">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {post && <PostCard post={post} />}

        {/* Comment Input Box */}
        <div className="glass-card p-6 flex flex-col gap-4 border-primary/20">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Discussion ({comments.length})</span>
          </h3>

          <form onSubmit={handleAddComment} className="flex gap-3">
            <input
              type="text"
              placeholder="Write a thoughtful comment or question..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 rounded-xl border border-surface-border bg-surface/60 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover transition"
            >
              <Send className="h-4 w-4" />
              <span>Comment</span>
            </button>
          </form>

          {/* Comment Tree */}
          <div className="flex flex-col gap-4 pt-4 border-t border-surface-border">
            {comments.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-3 p-4 rounded-xl bg-surface/40 border border-surface-border">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {comment.author?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-white">@{comment.author?.username}</span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-300 pl-9">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
