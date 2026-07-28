import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ChartPoint {
  label: string;
  sent: number;
  received: number;
}

const mockData: ChartPoint[] = [
  { label: 'Mon', sent: 4, received: 8 },
  { label: 'Tue', sent: 7, received: 12 },
  { label: 'Wed', sent: 12, received: 15 },
  { label: 'Thu', sent: 9, received: 10 },
  { label: 'Fri', sent: 18, received: 22 },
  { label: 'Sat', sent: 14, received: 16 },
  { label: 'Sun', sent: 20, received: 28 },
];

export const AnalyticsChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = Math.max(...mockData.flatMap((d) => [d.sent, d.received])) + 5;
  const width = 600;
  const height = 220;
  const padding = 30;

  const pointsSent = mockData.map((d, i) => {
    const x = padding + (i / (mockData.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.sent / maxValue) * (height - padding * 2);
    return { x, y };
  });

  const pointsReceived = mockData.map((d, i) => {
    const x = padding + (i / (mockData.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.received / maxValue) * (height - padding * 2);
    return { x, y };
  });

  // Create smooth bezier path string
  const createSvgPath = (points: { x: number; y: number }[]) => {
    return points.reduce((acc, point, index) => {
      if (index === 0) return `M ${point.x},${point.y}`;
      const prev = points[index - 1];
      const cx1 = prev.x + (point.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (point.x - prev.x) / 2;
      const cy2 = point.y;
      return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${point.x},${point.y}`;
    }, '');
  };

  const pathSent = createSvgPath(pointsSent);
  const pathReceived = createSvgPath(pointsReceived);

  const areaReceived = `${pathReceived} L ${pointsReceived[pointsReceived.length - 1].x},${height - padding} L ${pointsReceived[0].x},${height - padding} Z`;
  const areaSent = `${pathSent} L ${pointsSent[pointsSent.length - 1].x},${height - padding} L ${pointsSent[0].x},${height - padding} Z`;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 dark:text-white flex items-center gap-2">
            <span>Vault Transmission Activity</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-pvPrimary/20 text-pvPrimary border border-pvPrimary/30">
              Real-time
            </span>
          </h3>
          <p className="text-xs text-slate-400">7-day incoming vs outgoing encrypted vaults</p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pvPrimary inline-block"></span>
            <span className="text-slate-300">Received</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pvPurple inline-block"></span>
            <span className="text-slate-300">Transmitted</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="gradientReceived" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="gradientSent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.33, 0.66, 1].map((pct, i) => {
          const y = height - padding - pct * (height - padding * 2);
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="currentColor"
              className="text-slate-800/40 dark:text-slate-700/30"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area paths */}
        <path d={areaReceived} fill="url(#gradientReceived)" />
        <path d={areaSent} fill="url(#gradientSent)" />

        {/* Lines */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          d={pathReceived}
          fill="none"
          stroke="#2563EB"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
          d={pathSent}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />

        {/* Data Points */}
        {pointsReceived.map((pt, i) => (
          <g
            key={`rec-${i}`}
            className="cursor-pointer"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === i ? '6' : '4'}
              className="fill-pvPrimary stroke-white dark:stroke-slate-900 transition-all"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* X Axis Labels */}
        {mockData.map((d, i) => {
          const x = padding + (i / (mockData.length - 1)) * (width - padding * 2);
          return (
            <text
              key={d.label}
              x={x}
              y={height - 8}
              textAnchor="middle"
              className="text-[11px] fill-slate-400 font-medium"
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute top-2 right-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md text-xs space-y-1 shadow-xl z-20"
        >
          <div className="font-bold text-white">{mockData[hoveredIdx].label}</div>
          <div className="flex items-center justify-between space-x-4 text-pvPrimary">
            <span>Received:</span>
            <span className="font-mono font-bold">{mockData[hoveredIdx].received}</span>
          </div>
          <div className="flex items-center justify-between space-x-4 text-pvPurple">
            <span>Sent:</span>
            <span className="font-mono font-bold">{mockData[hoveredIdx].sent}</span>
          </div>
        </div>
      )}
    </div>
  );
};
