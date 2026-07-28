import React, { useState } from 'react';
import { X, Copy, Check, Share2, Link as LinkIcon } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultId: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, vaultId }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/received?vaultId=${vaultId}`;

  if (!isOpen) return null;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
      />

      <div className="relative w-full max-w-md bg-slate-900 dark:bg-pvBg border border-slate-800 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 text-slate-100 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-white/10">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-pvPrimary" />
            <h3 className="font-bold text-lg text-slate-100 dark:text-white">Share Vault Access</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Shareable Link */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-pvPrimary" />
            <span>Vault Access Link</span>
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-950/80 dark:bg-white/5 border border-slate-800 dark:border-white/10 text-slate-300 font-mono text-xs rounded-xl px-3 py-2.5 outline-none select-all"
            />
            <button
              onClick={copyShareLink}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-pvPrimary text-white shadow-glow-primary hover:opacity-90 transition-all flex items-center space-x-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
