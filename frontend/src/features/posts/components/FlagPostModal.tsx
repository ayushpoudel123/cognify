'use client';

import React, { useState, useEffect } from 'react';
import { X, Flag, AlertTriangle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/shared/lib/axios';

interface FlagPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  initialReason?: string;
  onFlagSuccess: () => void;
}

const PRESET_FLAG_REASONS = [
  'Inappropriate or offensive content',
  'Factually incorrect or misleading educational material',
  'Plagiarism or copyright violation',
  'Spam, advertising, or self-promotion',
  'Harassment or disrespectful language towards community members',
  'Other violation of Cognify Community Guidelines',
];

export function FlagPostModal({
  isOpen,
  onClose,
  post,
  initialReason,
  onFlagSuccess,
}: FlagPostModalProps) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_FLAG_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialReason) {
      setCustomReason(initialReason);
    } else {
      setCustomReason('');
    }
    setError(null);
  }, [initialReason, isOpen]);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalReason = customReason.trim() || selectedPreset;
    if (!finalReason) {
      setError('Please provide a reason for flagging this post.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.patch(`/admin/posts/${post.id}/status`, {
        status: 'FLAGGED',
        reason: finalReason,
      });

      onFlagSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          'Failed to flag post. Please verify admin privileges.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-gray-200 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Flag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Flag Post with Reason</h2>
            <p className="text-xs text-gray-500">The author will be notified with this moderation reason</p>
          </div>
        </div>

        {/* Post Preview Box */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
          <span className="font-semibold text-gray-800 line-clamp-1">{post.title}</span>
          <span className="text-[11px] text-gray-500">Author: @{post.author?.username || 'user'}</span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700">Select Common Reason</label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 focus:border-amber-500 focus:bg-white focus:outline-none"
            >
              {PRESET_FLAG_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Reason / Explanatory Note for Author
            </label>
            <textarea
              rows={3}
              placeholder="Explain to the author specifically why their post was flagged (e.g., Missing citations, inappropriate language)..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/10 transition resize-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              This reason will be visible on the author's post card and dispatched via notification so they know how to rectify their content.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
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
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50"
            >
              <Flag className="h-3.5 w-3.5" />
              <span>{loading ? 'Flagging Post...' : 'Flag Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
