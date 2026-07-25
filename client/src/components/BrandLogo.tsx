import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'monochrome' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
}) => {
  const sizePx = {
    sm: { icon: 24, text: 'text-base' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
    xl: { icon: 64, text: 'text-4xl' },
  }[size];

  const strokeColor = variant === 'monochrome' ? '#FFFFFF' : '#0FA4AF';
  const fillColor = variant === 'monochrome' ? '#FFFFFF' : '#025259';
  const accentColor = variant === 'monochrome' ? '#FFFFFF' : '#FF947A';

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* Original Abstract "P" + "V" + Shield Geometric Vector Logo Symbol */}
      <svg
        width={sizePx.icon}
        height={sizePx.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="pvBrandGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#025259" />
            <stop offset="0.5" stopColor="#0FA4AF" />
            <stop offset="1" stopColor="#FF947A" />
          </linearGradient>
          <filter id="pvGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Shield Polygon Outer Geometry */}
        <path
          d="M50 5 L88 20 V50 C88 72 71 90 50 96 C29 90 12 72 12 50 V20 L50 5 Z"
          fill="url(#pvBrandGrad)"
          opacity="0.15"
        />

        <path
          d="M50 8 L85 22.5 V48 C85 68.5 69.5 85 50 91 C30.5 85 15 68.5 15 48 V22.5 L50 8 Z"
          stroke="url(#pvBrandGrad)"
          strokeWidth="4"
          strokeLinejoin="round"
          filter="url(#pvGlow)"
        />

        {/* Interlocking Abstract "P" Left Loop */}
        <path
          d="M32 30 V70 M32 30 H48 C56 30 62 36 62 43 C62 50 56 56 48 56 H32"
          stroke="#0FA4AF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interlocking Abstract "V" Dynamic Chevron */}
        <path
          d="M44 48 L56 68 L68 48"
          stroke={accentColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center Encrypted Core Node */}
        <circle cx="56" cy="68" r="4" fill="#FFFFFF" />
      </svg>

      {/* Brand Typography */}
      {variant !== 'icon' && (
        <div className="flex items-center tracking-tight font-poppins">
          <span className={`font-extrabold text-white ${sizePx.text}`}>Ping</span>
          <span className={`font-bold text-pvAccent ml-1 ${sizePx.text}`}>Vault</span>
        </div>
      )}
    </div>
  );
};
