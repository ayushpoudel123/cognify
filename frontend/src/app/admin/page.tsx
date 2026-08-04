'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { apiClient } from '@/shared/lib/axios';
import { useAuth } from '@/shared/providers/AuthProvider';
import {
  ShieldCheck,
  Users,
  FileText,
  MessageSquare,
  CheckCircle2,
  Ban,
  Trash2,
  Flag,
  ShieldAlert,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'comments'>('users');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, postsRes, commentsRes]: any = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/posts'),
        apiClient.get('/admin/comments'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setPosts(postsRes.data || []);
      setComments(commentsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || currentUser.role !== 'ADMIN') {
        router.push('/login/admin');
      } else {
        fetchData();
      }
    }
  }, [currentUser, authLoading]);

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/toggle-status`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiClient.delete(`/admin/posts/${postId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await apiClient.delete(`/admin/comments/${commentId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || (currentUser && currentUser.role !== 'ADMIN')) {
    return (
      <div className="flex gap-8 items-start">
        <Sidebar />
        <div className="flex-1 glass-card p-12 text-center text-gray-400">
          Checking Admin privileges...
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 items-start">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>Cognify Admin Control Center</span>
          </div>

          <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
            Logged in as Admin (@{currentUser?.username})
          </span>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="glass-card p-5 border-primary/20">
              <span className="text-xs font-semibold text-gray-400 uppercase">Total Accounts</span>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</p>
            </div>
            <div className="glass-card p-5 border-secondary/20">
              <span className="text-xs font-semibold text-gray-400 uppercase">Total Posts</span>
              <p className="text-2xl font-bold text-white mt-1">{stats.activePosts}</p>
            </div>
            <div className="glass-card p-5 border-emerald-500/20">
              <span className="text-xs font-semibold text-gray-400 uppercase">Total Comments</span>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalComments || 0}</p>
            </div>
            <div className="glass-card p-5 border-amber-500/20">
              <span className="text-xs font-semibold text-gray-400 uppercase">Pending Reports</span>
              <p className="text-2xl font-bold text-white mt-1">{stats.pendingReports}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="glass-card p-2 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Manage Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'posts' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Post Moderation ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'comments' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comment Moderation ({comments.length})</span>
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Platform User Accounts</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-border text-gray-400 uppercase font-semibold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface/30">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">@{u.username}</span>
                          <span className="text-[10px] text-gray-400">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-md px-2 py-0.5 font-medium ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-surface border border-surface-border text-gray-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.isActive ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="text-red-400 font-semibold flex items-center gap-1">
                            <Ban className="h-3.5 w-3.5" /> Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-3 py-1 rounded-lg font-semibold text-xs transition ${
                            u.isActive
                              ? 'border border-red-500/30 text-red-400 hover:bg-red-500/10'
                              : 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Posts Moderation Tab */}
        {activeTab === 'posts' && (
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4 text-secondary" />
              <span>Posts Content Moderation</span>
            </h3>

            <div className="flex flex-col gap-3">
              {posts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-surface-border bg-surface/30 flex items-start justify-between gap-4"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">@{p.author?.username}</span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                    <p className="text-xs text-gray-300 line-clamp-2">{p.content}</p>
                  </div>

                  <button
                    onClick={() => handleDeletePost(p.id)}
                    className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Flag / Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Moderation Tab */}
        {activeTab === 'comments' && (
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>Comments Activity Moderation</span>
            </h3>

            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-surface-border bg-surface/30 flex items-start justify-between gap-4"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400">@{c.author?.username}</span>
                      <span className="text-[10px] text-gray-500">
                        On post: {c.post?.title || 'Post'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200">{c.content}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
