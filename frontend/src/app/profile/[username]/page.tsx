'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { PostCard } from '@/features/posts/components/PostCard';
import { useAuth } from '@/shared/providers/AuthProvider';
import { apiClient } from '@/shared/lib/axios';
import { getMediaUrl } from '@/shared/lib/utils';
import { EditProfileModal } from '@/features/profile/components/EditProfileModal';
import {
  User,
  Award,
  BookOpen,
  Globe,
  UserPlus,
  UserCheck,
  MessageSquare,
  Camera,
  X,
  Users,
  Edit3,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // User's Educational Posts
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Modals for Followers & Following Lists
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUserPosts = async (userId: string) => {
    setPostsLoading(true);
    try {
      const res: any = await apiClient.get(`/posts/user/${userId}`);
      setUserPosts(res.data || []);
    } catch (err) {
      console.error('Failed to load user posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (params?.username) {
      setLoading(true);
      try {
        const res: any = await apiClient.get(`/users/profile/${params.username}`);
        setProfileUser(res.data);
        if (res.data?.id) {
          fetchUserPosts(res.data.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [params?.username]);

  const handleFollowToggle = async () => {
    if (!profileUser) return;
    try {
      const res: any = await apiClient.post(`/social/follow/${profileUser.id}`);
      setIsFollowing(res.data.following);
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const openListModal = async (type: 'followers' | 'following') => {
    if (!profileUser) return;
    setModalType(type);
    setModalLoading(true);
    try {
      const res: any = await apiClient.get(`/social/${type}/${profileUser.id}`);
      setModalUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadRes: any = await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const avatarUrl = uploadRes.data?.url || uploadRes.url;
      await apiClient.patch('/users/profile', { avatar: avatarUrl });
      fetchProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadRes: any = await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const coverUrl = uploadRes.data?.url || uploadRes.url;
      await apiClient.patch('/users/profile', { coverImage: coverUrl });
      fetchProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDirectMessage = async () => {
    if (!profileUser) return;
    try {
      await apiClient.post(`/chat/conversation/${profileUser.id}`);
      router.push('/chat');
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

  if (!profileUser) {
    return (
      <div className="flex gap-8">
        <Sidebar />
        <div className="flex-1 glass-card p-12 text-center text-gray-400">
          User profile not found.
        </div>
      </div>
    );
  }

  const profile = profileUser.profile || {};
  const isSelf = currentUser?.id === profileUser.id;
  const isAdmin = profileUser.role === 'ADMIN';

  return (
    <div className="flex gap-8 items-start">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Header Cover & Avatar */}
        <div className="glass-card overflow-hidden relative border-surface-border">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-primary/30 via-secondary/20 to-background border-b border-surface-border relative overflow-hidden">
            {profile.coverImage && (
              <img src={getMediaUrl(profile.coverImage)} alt="Cover" className="w-full h-full object-cover" />
            )}
            {isSelf && (
              <label className="absolute top-4 right-4 rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/80 transition cursor-pointer flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-primary" />
                <span>{uploadingCover ? 'Uploading...' : 'Change Cover'}</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="p-6 pt-0 relative flex flex-col gap-4">
            <div className="flex items-end justify-between -mt-16">
              {/* Avatar Photo */}
              <div className="relative group">
                <div className="h-28 w-28 rounded-full bg-surface border-4 border-background overflow-hidden shadow-2xl flex items-center justify-center text-primary font-bold text-3xl">
                  {profile.avatar ? (
                    <img src={getMediaUrl(profile.avatar)} alt={profileUser.username} className="h-full w-full object-cover" />
                  ) : (
                    profileUser.username?.[0]?.toUpperCase()
                  )}
                </div>
                {isSelf && (
                  <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition cursor-pointer">
                    <Camera className="h-6 w-6" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isSelf ? (
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 shadow-sm transition"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-primary" />
                    <span>Edit Profile</span>
                  </button>
                ) : isAdmin ? (
                  <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-700 shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Administrator</span>
                  </div>
                ) : (
                  currentUser?.role !== 'ADMIN' && (
                    <>
                      <button
                        onClick={handleDirectMessage}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-100 transition"
                      >
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span>Message</span>
                      </button>

                      <button
                        onClick={handleFollowToggle}
                        className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-semibold shadow-md transition ${
                          isFollowing
                            ? 'bg-gray-100 border border-gray-300 text-gray-700 hover:text-red-500 hover:border-red-300'
                            : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="h-4 w-4" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </>
                  )
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {profile.fullName || profileUser.username}
                </h1>
                {isAdmin && (
                  <span className="rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                    ADMIN
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-500">@{profileUser.username}</span>
            </div>

            {/* Followers & Following Interactive Stats (Hidden on Admin profiles) */}
            {!isAdmin && (
              <div className="flex items-center gap-6 py-2 border-y border-gray-100 my-1">
                <button
                  onClick={() => openListModal('followers')}
                  className="flex items-center gap-1.5 text-sm hover:text-primary transition"
                >
                  <span className="font-bold text-gray-900 text-base">{profileUser.followersCount || 0}</span>
                  <span className="text-gray-500">Followers</span>
                </button>

                <button
                  onClick={() => openListModal('following')}
                  className="flex items-center gap-1.5 text-sm hover:text-primary transition"
                >
                  <span className="font-bold text-gray-900 text-base">{profileUser.followingCount || 0}</span>
                  <span className="text-gray-500">Following</span>
                </button>
              </div>
            )}

            {profile.bio && (
              <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">{profile.bio}</p>
            )}

            {/* Profile Meta & Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
              {profile.education && (
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>{profile.education}</span>
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  <span>{profile.website.replace('https://', '')}</span>
                </a>
              )}
            </div>

            {/* Skills Badges */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-gray-100 border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User's Educational Posts Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>
                {isSelf ? 'My Educational Posts' : `${profileUser.username}'s Posts`} ({userPosts.length})
              </span>
            </h2>
          </div>

          {postsLoading ? (
            <div className="flex flex-col gap-4">
              <div className="glass-card p-6 h-36 animate-pulse bg-gray-50 rounded-2xl" />
              <div className="glass-card p-6 h-36 animate-pulse bg-gray-50 rounded-2xl" />
            </div>
          ) : userPosts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostUpdated={() => fetchUserPosts(profileUser.id)}
                  onPostDeleted={() => fetchUserPosts(profileUser.id)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-2 border-dashed border-gray-200">
              <BookOpen className="h-8 w-8 text-gray-300" />
              <span className="text-sm font-semibold text-gray-700">No educational posts published yet</span>
              <p className="text-xs text-gray-400 max-w-sm">
                {isSelf
                  ? 'Share study notes, tutorials, or insights with the Cognify learning community!'
                  : 'This user has not created any educational posts yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Followers / Following Modal List */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-gray-200 shadow-2xl relative">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>{modalType === 'followers' ? 'Followers' : 'Following'}</span>
            </h3>

            {modalLoading ? (
              <div className="p-8 text-center text-xs text-gray-400 animate-pulse">Loading list...</div>
            ) : modalUsers.length > 0 ? (
              <div className="max-h-80 overflow-y-auto flex flex-col divide-y divide-gray-100">
                {modalUsers.map((u) => (
                  <div key={u.id} className="py-3 flex items-center justify-between">
                    <Link
                      href={`/profile/${u.username}`}
                      onClick={() => setModalType(null)}
                      className="flex items-center gap-3 group"
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm overflow-hidden border border-primary/30">
                        {u.profile?.avatar ? (
                          <img src={getMediaUrl(u.profile.avatar)} alt={u.username} className="h-full w-full object-cover" />
                        ) : (
                          u.username?.[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-primary transition">
                          {u.profile?.fullName || u.username}
                        </span>
                        <span className="text-xs text-gray-500">@{u.username}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">No users found.</div>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal (Full Name & Username) */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profileUser={profileUser}
        onProfileUpdated={(updated) => {
          setProfileUser(updated);
          fetchProfile();
        }}
      />
    </div>
  );
}
