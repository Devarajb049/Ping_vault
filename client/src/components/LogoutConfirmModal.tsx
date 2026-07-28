import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
      />

      <div className="relative w-full max-w-sm bg-slate-900 dark:bg-pvBg border border-slate-800 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-pvDanger/15 border border-pvDanger/30 flex items-center justify-center text-pvDanger">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100 dark:text-white">Confirm Sign Out</h3>
            <p className="text-xs text-slate-400">Terminating session & clearing keys</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          Your browser's decrypted local RSA private key cache will be cleared. You will need your login credentials to sign back in.
        </p>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-pvDanger text-white shadow-glow-danger hover:bg-red-600 transition-all"
          >
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
};
