'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { apiClient } from '@/shared/lib/axios';
import { ShieldCheck, Users, ShieldAlert, CheckCircle2, Ban } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes]: any = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (userId: string) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/toggle-status`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex gap-8 items-start">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>Platform Admin Controls</span>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-5 border-primary/20">
              <span className="text-xs font-semibold text-gray-400 uppercase">Total Accounts</span>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</p>
            </div>
            <div className="glass-card p-5 border-secondary/20">
              <span className="text-xs font-semibold text-gray-400 uppercase">Published Content</span>
              <p className="text-2xl font-bold text-white mt-1">{stats.activePosts}</p>
            </div>
            <div className="glass-card p-5 border-amber-500/20">
              <span className="text-xs font-semibold text-gray-400 uppercase">Pending Reports</span>
              <p className="text-2xl font-bold text-white mt-1">{stats.pendingReports}</p>
            </div>
          </div>
        )}

        {/* User Management Table */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Manage Platform Users</span>
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
                        {u.username[0]?.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">@{u.username}</span>
                        <span className="text-[10px] text-gray-400">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-md bg-surface border border-surface-border px-2 py-0.5 font-medium text-gray-300">
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
                        onClick={() => handleToggleStatus(u.id)}
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
      </div>
    </div>
  );
}
