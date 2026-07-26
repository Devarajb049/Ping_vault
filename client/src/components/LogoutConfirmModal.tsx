import React from 'react';
import { AlertTriangle } from 'lucide-react';

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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pvDarker/90 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Logout Confirmation"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl glass-panel border border-pvDanger/40 bg-pvDark/95 p-6 space-y-6 shadow-2xl text-center animate-slide-in cursor-default"
      >
        <div className="w-14 h-14 rounded-2xl bg-pvDanger/20 border border-pvDanger/40 flex items-center justify-center text-pvDanger mx-auto shadow-glow-primary">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="font-poppins font-bold text-xl text-white">Logout?</h3>


          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to log out of your encrypted PingVault session?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onClose}
            className="py-2.5 rounded-xl font-bold text-xs bg-pvDarker border border-pvAccent/30 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="py-2.5 rounded-xl font-bold text-xs bg-pvDanger text-white hover:opacity-90 shadow-sm transition-opacity"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
