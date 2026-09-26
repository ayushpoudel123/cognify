'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/shared/lib/axios';

interface ReportPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  onReportSubmitted?: () => void;
}

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam or Promotional', desc: 'Commercial advertising, repetitive content, or automated bot posts' },
  { value: 'HARASSMENT', label: 'Harassment or Hate', desc: 'Bullying, hate speech, or derogatory comments towards others' },
  { value: 'FALSE_INFORMATION', label: 'Misinformation', desc: 'Factually inaccurate educational content or deceptive claims' },
  { value: 'OTHER', label: 'Community Guideline Violation', desc: 'Other inappropriate or non-educational content' },
];

export function ReportPostModal({
  isOpen,
  onClose,
  post,
  onReportSubmitted,
}: ReportPostModalProps) {
  const [reason, setReason] = useState('SPAM');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.post('/reports', {
        targetType: 'POST',
        targetId: post.id,
        reason,
        details: details.trim() || undefined,
      });

      setSubmitted(true);
      if (onReportSubmitted) onReportSubmitted();
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          'Failed to submit report. Please try again.',
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
          <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Report Educational Content</h2>
            <p className="text-xs text-gray-500">Flag this post for administrator moderation</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Thank you for your report</h3>
            <p className="text-xs text-gray-500 max-w-xs">
              Our moderation team has been notified and will review this content against community safety standards.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-700">Reason for Report</label>
              <div className="flex flex-col gap-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                      reason === r.value
                        ? 'border-red-300 bg-red-50/40 text-gray-900'
                        : 'border-gray-200 bg-gray-50 hover:bg-white text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="mt-0.5 text-red-600 focus:ring-red-500"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">{r.label}</span>
                      <span className="text-[11px] text-gray-500">{r.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Describe why this post should be reviewed..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900 placeholder-gray-400 focus:border-red-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400/10 transition resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
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
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-red-500/20 hover:bg-red-700 transition disabled:opacity-50"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{loading ? 'Submitting Report...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
