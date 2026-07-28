import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'stat' | 'text';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', count = 3 }) => {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {items.map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-slate-900/60 dark:bg-white/5 border border-slate-800 dark:border-white/10 space-y-4 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl skeleton-shimmer" />
              <div className="w-16 h-6 rounded-full skeleton-shimmer" />
            </div>
            <div className="space-y-2">
              <div className="w-24 h-3 rounded skeleton-shimmer" />
              <div className="w-16 h-8 rounded-lg skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full space-y-3">
        <div className="h-10 rounded-xl skeleton-shimmer" />
        {items.map((_, i) => (
          <div key={i} className="h-16 rounded-2xl skeleton-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-3xl bg-slate-900/60 dark:bg-white/5 border border-slate-800 dark:border-white/10 space-y-4 shadow-md"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl skeleton-shimmer" />
            <div className="space-y-2 flex-1">
              <div className="w-3/4 h-4 rounded skeleton-shimmer" />
              <div className="w-1/2 h-3 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="w-full h-12 rounded-xl skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
};
