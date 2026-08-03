import React from 'react';

interface IconSwapProps {
  /** 'a' renders iconA active; 'b' renders iconB active */
  state: 'a' | 'b';
  iconA: React.ReactNode;
  iconB: React.ReactNode;
  className?: string;
}

export const IconSwap: React.FC<IconSwapProps> = ({ state, iconA, iconB, className = '' }) => {
  return (
    <div className={`t-icon-swap ${className}`} data-state={state}>
      <span className="t-icon flex items-center justify-center" data-icon="a">
        {iconA}
      </span>
      <span className="t-icon flex items-center justify-center" data-icon="b">
        {iconB}
      </span>
    </div>
  );
};
