import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'monochrome' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showTagline = false,
}) => {
  const sizePx = {
    sm: { container: 'w-8 h-8 rounded-xl p-1.5', icon: 'w-4 h-4', text: 'text-lg', tagline: 'text-[10px]' },
    md: { container: 'w-10 h-10 rounded-2xl p-2', icon: 'w-5 h-5', text: 'text-xl', tagline: 'text-xs' },
    lg: { container: 'w-14 h-14 rounded-2xl p-3', icon: 'w-7 h-7', text: 'text-2xl', tagline: 'text-xs' },
    xl: { container: 'w-20 h-20 rounded-3xl p-4', icon: 'w-10 h-10', text: 'text-4xl', tagline: 'text-sm' },
    '2xl': { container: 'w-24 h-24 rounded-3xl p-5', icon: 'w-12 h-12', text: 'text-5xl', tagline: 'text-base' },
  }[size];

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* Glowing Squircle Badge Icon Container */}
      <div className="relative group flex items-center justify-center">
        {/* Soft Glow Effect */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 opacity-40 blur-md group-hover:opacity-75 transition duration-300" />

        {/* Teal-Cyan Gradient Rounded Square Badge */}
        <div
          className={`relative z-10 flex items-center justify-center bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 border border-teal-300/40 shadow-lg shadow-teal-900/40 ${sizePx.container} transition-transform duration-300 group-hover:scale-105`}
        >
          {/* Shield Lock Vector */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${sizePx.icon} text-white drop-shadow-md`}
          >
            {/* Outer Shield Path */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            {/* Inner Lock Shackle & Keyhole */}
            <circle cx="12" cy="11" r="1.5" fill="currentColor" stroke="none" />
            <path d="M12 12.5v3" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight font-poppins">
            <span className={`font-extrabold text-white tracking-tight ${sizePx.text}`}>Ping</span>
            <span className={`font-bold text-white ml-1.5 ${sizePx.text}`}>Vault</span>
          </div>
          {showTagline && (
            <span className={`font-mono uppercase text-teal-300/90 tracking-widest ${sizePx.tagline}`}>
              Zero-Knowledge E2EE
            </span>
          )}
        </div>
      )}
    </div>
  );
};



