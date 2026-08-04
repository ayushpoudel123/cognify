'use client';

import React from 'react';
import Link from 'next/link';
import { X, LogIn, UserPlus, ShieldCheck } from 'lucide-react';

interface AuthGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
}

export function AuthGuardModal({ isOpen, onClose, action = 'perform this action' }: AuthGuardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-200 relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center gap-4 text-center pt-2">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-gray-900">Login Required</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              You need to be logged in to {action}. Join Cognify to start sharing and learning.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 w-full mt-2">
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>Log In</span>
            </Link>

            <Link
              href="/register"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-primary py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition"
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </Link>
          </div>

          <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 transition mt-1">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
