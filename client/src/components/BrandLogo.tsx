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
    sm: { icon: 28, text: 'text-lg', tagline: 'text-[10px]' },
    md: { icon: 38, text: 'text-xl', tagline: 'text-xs' },
    lg: { icon: 50, text: 'text-2xl', tagline: 'text-xs' },
    xl: { icon: 68, text: 'text-4xl', tagline: 'text-sm' },
    '2xl': { icon: 90, text: 'text-5xl', tagline: 'text-base' },
  }[size];

  const strokeColor = variant === 'monochrome' ? '#FFFFFF' : '#0FA4AF';
  const accentColor = variant === 'monochrome' ? '#FFFFFF' : '#FF947A';

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* High-Tech Cyber Shield Logo Icon */}
      <div className="relative group flex items-center justify-center">
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-pvPrimary via-pvAccent to-pvTeal opacity-40 blur-md group-hover:opacity-75 transition duration-500 animate-pulse" />
        <svg
          width={sizePx.icon}
          height={sizePx.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="pvShieldGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#025259" />
              <stop offset="0.4" stopColor="#0FA4AF" />
              <stop offset="0.8" stopColor="#38BDF8" />
              <stop offset="1" stopColor="#FF947A" />
            </linearGradient>

            <linearGradient id="pvCoreGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FF947A" />
              <stop offset="1" stopColor="#0FA4AF" />
            </linearGradient>

            <filter id="pvGlowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Cyber Shield Base */}
          <path
            d="M50 6 L88 22 V48 C88 72 70 89 50 95 C30 89 12 72 12 48 V22 L50 6 Z"
            fill="url(#pvShieldGradient)"
            fillOpacity="0.18"
            stroke="url(#pvShieldGradient)"
            strokeWidth="3.5"
            strokeLinejoin="round"
            filter="url(#pvGlowEffect)"
          />

          {/* Inner Hexagonal Circuit Ring */}
          <polygon
            points="50,18 78,32 78,64 50,78 22,64 22,32"
            stroke="#0FA4AF"
            strokeWidth="2"
            strokeOpacity="0.6"
            strokeDasharray="4 2"
            fill="none"
          />

          {/* Interlocking Stylized 'P' & 'V' Vault Emblem */}
          <path
            d="M34 32 V68 M34 32 H50 C58 32 64 37 64 44 C64 51 58 56 50 56 H34"
            stroke="url(#pvShieldGradient)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M45 50 L56 68 L67 50"
            stroke={accentColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Encrypted Lock Node Core */}
          <circle cx="56" cy="68" r="4.5" fill="#FFFFFF" className="animate-ping" opacity="0.75" />
          <circle cx="56" cy="68" r="3.5" fill="url(#pvCoreGradient)" />
        </svg>
      </div>

      {/* Brand Typography */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight font-poppins">
            <span className={`font-extrabold text-white tracking-wide ${sizePx.text}`}>Ping</span>
            <span className={`font-bold bg-gradient-to-r from-pvAccent via-amber-300 to-pvTeal bg-clip-text text-transparent ml-1.5 ${sizePx.text}`}>
              Vault
            </span>
          </div>
          {showTagline && (
            <span className={`font-mono uppercase text-teal-300/80 tracking-widest ${sizePx.tagline}`}>
              Zero-Knowledge E2EE
            </span>
          )}
        </div>
      )}
    </div>
  );
};

