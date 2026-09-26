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
  RefreshCw,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'comments' | 'reports'>('users');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, postsRes, commentsRes, reportsRes]: any = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/posts'),
        apiClient.get('/admin/comments'),
        apiClient.get('/admin/reports'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setPosts(postsRes.data || []);
      setComments(commentsRes.data || []);
      setReports(reportsRes.data || []);
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

  const handleUpdatePostStatus = async (postId: string, status: string) => {
    try {
      await apiClient.patch(`/admin/posts/${postId}/status`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
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
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
          Checking Admin privileges...
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 items-start">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Admin Header Banner */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900">Cognify Admin Control Center</h1>
              <span className="text-xs text-gray-500">Platform Ownership & Content Moderation</span>
            </div>
          </div>

          <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-semibold text-amber-700">
            Admin: @{currentUser?.username}
          </span>
        </div>

        {/* High-Level Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">User Accounts</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Active Posts</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activePosts}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Total Comments</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalComments || 0}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase">Pending Reports</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingReports}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-1.5 flex items-center gap-1 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeTab === 'users' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <Users className="h-4 w-4" />
            <span>Manage Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeTab === 'posts' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <FileText className="h-4 w-4" />
            <span>Post Moderation ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeTab === 'comments' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comments ({comments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeTab === 'reports' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Reports ({reports.length})</span>
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Platform User Accounts</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase font-semibold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
                          {u.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">@{u.username}</span>
                          <span className="text-[10px] text-gray-400">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-md px-2 py-0.5 font-semibold text-[11px] ${u.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.isActive ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold flex items-center gap-1">
                            <Ban className="h-3.5 w-3.5" /> Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`px-3 py-1 rounded-lg font-semibold text-xs transition ${u.isActive
                                ? 'border border-red-200 text-red-600 hover:bg-red-50'
                                : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                              }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Post Content Moderation Controls</span>
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {posts.map((p) => {
                const isFlagged = p.status === 'FLAGGED';
                const isTakenDown = p.status === 'TAKEN_DOWN';
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start justify-between gap-4 transition ${isTakenDown
                        ? 'bg-red-50/50 border-red-200'
                        : isFlagged
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-primary">@{p.author?.username}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isTakenDown
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : isFlagged
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">{p.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{p.content}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      {isTakenDown || isFlagged ? (
                        <button
                          onClick={() => handleUpdatePostStatus(p.id, 'PUBLISHED')}
                          className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleUpdatePostStatus(p.id, 'FLAGGED')}
                            className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                          >
                            <Flag className="h-3.5 w-3.5" />
                            <span>Flag</span>
                          </button>
                          <button
                            onClick={() => handleUpdatePostStatus(p.id, 'TAKEN_DOWN')}
                            className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Take Down</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeletePost(p.id)}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comments Moderation Tab */}
        {activeTab === 'comments' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Comments Activity Moderation</span>
            </h3>

            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start justify-between gap-4"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">@{c.author?.username}</span>
                      <span className="text-[10px] text-gray-400">
                        On post: {c.post?.title || 'Post'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800">{c.content}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span>User & Content Reports</span>
            </h3>

            {reports.length > 0 ? (
              <div className="flex flex-col gap-3">
                {reports.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-900">Reporter: @{r.reporter?.username}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold uppercase">{r.reason}</span>
                      </div>
                      <p className="text-xs text-gray-700 mt-1">{r.details || 'No details specified.'}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{r.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">No reports pending.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
