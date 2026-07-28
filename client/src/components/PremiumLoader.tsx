import React from 'react';
import { Shield, Lock, Cpu } from 'lucide-react';

interface PremiumLoaderProps {
  progress?: number;
  message?: string;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({
  progress = 75,
  message = 'Encrypting zero-knowledge payload...',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 dark:bg-pvBg/95 backdrop-blur-2xl p-4 text-slate-100">
      <div className="flex flex-col items-center space-y-6 max-w-sm text-center">
        {/* Animated Icon Glow */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pvPrimary to-pvSecondary flex items-center justify-center shadow-glow-primary animate-pulse">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-md">
            <Lock className="w-4 h-4 text-pvSuccess animate-bounce" />
          </div>
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-white tracking-wide">PINGVAULT SECURE</h3>
          <p className="text-xs text-slate-400 font-mono flex items-center justify-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-pvPrimary animate-spin" />
            <span>{message}</span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-pvPrimary to-pvSecondary rounded-full transition-all duration-300 shadow-glow-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>WEB-CRYPTO SHA-256</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
