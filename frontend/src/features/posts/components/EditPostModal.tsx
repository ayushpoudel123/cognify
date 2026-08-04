'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Upload, Trash2 } from 'lucide-react';
import { postsApi } from '../api';
import { apiClient } from '@/shared/lib/axios';
import { getMediaUrl } from '@/shared/lib/utils';

interface EditPostModalProps {
  isOpen: boolean;
  post: any;
  onClose: () => void;
  onPostUpdated?: () => void;
}

export function EditPostModal({ isOpen, post, onClose, onPostUpdated }: EditPostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setHashtags(Array.isArray(post.hashtags) ? post.hashtags.join(', ') : '');
      const firstMedia = post.media?.[0];
      setMediaUrl(firstMedia?.url || '');
      setMediaType(firstMedia?.type === 'VIDEO' ? 'VIDEO' : 'IMAGE');
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res: any = await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data?.url || res.url;
      setMediaUrl(uploadedUrl);
      if (file.type.startsWith('video/')) {
        setMediaType('VIDEO');
      } else {
        setMediaType('IMAGE');
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsedHashtags = hashtags
        .split(',')
        .map((h) => h.trim().replace('#', ''))
        .filter(Boolean);

      await apiClient.patch(`/posts/${post.id}`, {
        title,
        content,
        type: mediaType,
        hashtags: parsedHashtags,
        mediaUrls: mediaUrl ? [mediaUrl] : [],
      });

      if (onPostUpdated) onPostUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl p-6 border-primary/30 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
          <Edit3 className="h-5 w-5 text-primary" />
          <span>Edit Educational Post</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            required
            placeholder="Post Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-surface/60 px-4 py-3 text-base font-semibold text-white placeholder-gray-500 focus:border-primary focus:outline-none"
          />

          <textarea
            required
            rows={5}
            placeholder="Educational content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-surface/60 p-4 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none"
          />

          <input
            type="text"
            placeholder="Hashtags separated by commas (e.g. MachineLearning, Python)"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            className="w-full rounded-xl border border-surface-border bg-surface/60 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-primary focus:outline-none"
          />

          {/* Media File Picker & Preview */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Attach or Replace Image/Video
            </label>
            {mediaUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-surface-border group max-h-48">
                {mediaType === 'VIDEO' ? (
                  <video src={getMediaUrl(mediaUrl)} controls className="w-full max-h-48 object-cover" />
                ) : (
                  <img src={getMediaUrl(mediaUrl)} alt="Upload preview" className="w-full max-h-48 object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="absolute top-2 right-2 rounded-lg bg-red-600/80 p-1.5 text-white hover:bg-red-600 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border bg-surface/30 py-4 text-xs font-medium text-gray-400 hover:border-primary hover:text-white transition cursor-pointer">
                <Upload className="h-4 w-4 text-primary" />
                <span>{uploading ? 'Uploading media...' : 'Choose Image or Video File'}</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:opacity-90 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
