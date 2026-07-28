import React from 'react';
import { Shield, Lock } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  const sizeClasses = {
    sm: { icon: 'w-7 h-7', shield: 'w-4 h-4', title: 'text-base' },
    md: { icon: 'w-9 h-9', shield: 'w-5 h-5', title: 'text-xl' },
    lg: { icon: 'w-12 h-12', shield: 'w-7 h-7', title: 'text-2xl' },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      <div className={`relative ${currentSize.icon} flex items-center justify-center rounded-xl bg-gradient-to-br from-pvPrimary to-pvSecondary text-white shadow-glow-primary overflow-hidden group`}>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Shield className={`${currentSize.shield} text-white`} />
        <Lock className="w-2.5 h-2.5 text-white/90 absolute bottom-1.5 right-1.5" />
      </div>

      {variant === 'full' && (
        <div className="flex flex-col">
          <div className={`font-jakarta font-extrabold ${currentSize.title} tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent`}>
            PING<span className="text-pvPrimary dark:text-pvSecondary font-black">VAULT</span>
          </div>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold -mt-1">
            Zero-Knowledge E2EE
          </span>
        </div>
      )}
    </div>
  );
};
