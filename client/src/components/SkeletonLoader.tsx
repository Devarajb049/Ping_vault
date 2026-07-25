import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="p-6 rounded-3xl glass-panel border border-pvAccent/20 space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="w-12 h-12 rounded-2xl bg-pvDarker/80 border border-pvAccent/20" />
      <div className="w-16 h-6 rounded-full bg-pvDarker/80 border border-pvAccent/20" />
    </div>
    <div className="space-y-2">
      <div className="w-24 h-3 rounded bg-pvDarker/80" />
      <div className="w-16 h-8 rounded bg-pvDarker/80" />
    </div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="p-6 rounded-3xl glass-panel border border-pvAccent/20 space-y-4 animate-pulse">
    <div className="w-48 h-6 bg-pvDarker/80 rounded" />
    <div className="space-y-3 pt-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-12 bg-pvDarker/60 rounded-xl border border-pvAccent/10 w-full" />
      ))}
    </div>
  </div>
);
