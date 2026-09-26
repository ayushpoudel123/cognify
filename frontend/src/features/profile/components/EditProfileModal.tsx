'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, AtSign, BookOpen, Globe, Save, AlertCircle } from 'lucide-react';
import { apiClient } from '@/shared/lib/axios';
import { useAuth } from '@/shared/providers/AuthProvider';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUser: any;
  onProfileUpdated: (updatedUser: any) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  profileUser,
  onProfileUpdated,
}: EditProfileModalProps) {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [education, setEducation] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profileUser) {
      setFullName(profileUser.profile?.fullName || '');
      setUsername(profileUser.username || '');
      setBio(profileUser.profile?.bio || '');
      setEducation(profileUser.profile?.education || '');
      setWebsite(profileUser.profile?.website || '');
      setError(null);
    }
  }, [profileUser, isOpen]);

  if (!isOpen || !profileUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      setError('Username must be 3-30 characters long and can only contain letters, numbers, and underscores.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        fullName: fullName.trim(),
        username: cleanUsername,
        bio: bio.trim(),
        education: education.trim(),
        website: website.trim(),
      };

      const res: any = await apiClient.patch('/users/profile', payload);
      const updatedUser = res.data;

      // Update global auth context
      updateUser(updatedUser);
      onProfileUpdated(updatedUser);

      // If username changed, redirect to new profile URL
      if (cleanUsername !== profileUser.username) {
        router.push(`/profile/${cleanUsername}`);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to update profile. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 border border-gray-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Edit Profile</h2>
            <p className="text-xs text-gray-500">Update your public identity and profile details</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2.5 text-xs text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition font-mono"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Letters, numbers, and underscores only (3-30 chars).
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Bio
            </label>
            <textarea
              rows={3}
              placeholder="Tell others about what you are learning or teaching..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition resize-none"
            />
          </div>

          {/* Education / Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Education / Headline
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. CS Student @ Stanford or ML Educator"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Website / Portfolio URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="url"
                placeholder="https://yourportfolio.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-primary/20 hover:opacity-95 transition disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{loading ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
