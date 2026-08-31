'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/providers/AuthProvider';
import { authApi } from '../api';
import { BookOpen, Mail, Lock, LogIn } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res: any = await authApi.login({ emailOrUsername, password });
      login(res.data);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email/username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-card">
      <div className="flex flex-col items-center gap-2 text-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Welcome back to Cognify</h1>
        <p className="text-sm text-gray-500">Log in to your learning account</p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3 text-center text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Email or Username
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              required
              placeholder="learner@cognify.com"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition shadow-sm disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" />
          <span>{loading ? 'Logging in...' : 'Log In'}</span>
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Sign up for free
        </Link>
      </div>
    </div>
  );
}
