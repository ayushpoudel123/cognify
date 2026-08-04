'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, User, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { apiClient } from '@/shared/lib/axios';

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res: any = await apiClient.post('/auth/admin/register', {
          email,
          username,
          password,
          fullName: fullName || undefined,
        });
        login(res.data);
        router.push('/admin');
      } else {
        const res: any = await apiClient.post('/auth/admin/login', {
          emailOrUsername,
          password,
        });
        login(res.data);
        router.push('/admin');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          'Authentication failed. Please check credentials and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-amber-200 shadow-card p-8">
        <div className="text-center flex flex-col items-center gap-2 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {isRegister ? 'Create Admin Account' : 'Admin Control Portal'}
          </h2>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            {isRegister
              ? 'Set up a System Administrator account for Cognify.'
              : 'Log in with administrator credentials to access platform controls.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-center gap-3 text-xs text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister ? (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Admin Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="admin_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@cognify.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Admin Email or Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="admin or admin@cognify.com"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 mt-2"
          >
            {isRegister ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            <span>{loading ? 'Authenticating...' : isRegister ? 'Create Admin Account' : 'Login as Admin'}</span>
          </button>
        </form>

        <div className="text-center border-t border-gray-100 pt-5 mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-amber-600 hover:underline font-semibold"
          >
            {isRegister ? 'Already have an admin account? Log in' : 'First time? Create admin account'}
          </button>
          <Link href="/login" className="text-xs text-gray-400 hover:text-gray-700 transition">
            ← Back to Regular Login
          </Link>
        </div>
      </div>
    </div>
  );
}
