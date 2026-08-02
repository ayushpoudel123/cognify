'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/providers/AuthProvider';
import { authApi } from '../api';
import { User, Mail, Lock, UserPlus, BookOpen } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res: any = await authApi.register({ email, username, fullName, password });
      login(res.data);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 w-full max-w-md mx-auto border-secondary/20 shadow-2xl">
      <div className="flex flex-col items-center gap-2 text-center mb-8">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white shadow-lg shadow-secondary/30">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Join Cognify</h1>
        <p className="text-sm text-gray-400">Create your account & start sharing knowledge</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-center text-sm font-medium text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              required
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              required
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="email"
              required
              placeholder="learner@cognify.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-primary py-3 text-sm font-semibold text-white shadow-lg shadow-secondary/25 hover:opacity-90 transition disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" />
          <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
        </button>
      </form>
    </div>
  );
}
