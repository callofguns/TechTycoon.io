import { motion } from 'framer-motion';
import type { DayPoint } from '../types';

interface Props {
  history: DayPoint[];
  /** Which number to chart. */
  metric?: 'units' | 'revenue';
  className?: string;
  color?: string;
}

/**
 * Tiny line chart of the last ~30 days, drawn as a plain SVG polyline with a
 * soft fill underneath. No chart library needed for something this small.
 */
export function Sparkline({ history, metric = 'units', className, color = '#5b7fff' }: Props) {
  const width = 100;
  const height = 32;

  if (history.length < 2) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
        <line
          x1="0"
          y1={height - 1}
          x2={width}
          y2={height - 1}
          stroke={color}
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  const values = history.map((point) => (metric === 'units' ? point.units : point.revenue));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    // Leave 2px of padding top and bottom so the line never clips.
    const y = height - 2 - ((value - min) / range) * (height - 4);
    return { x, y };
  });

  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} ${width},${height} 0,${height}`;
  const gradientId = `spark-${metric}-${Math.round(max)}-${points.length}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <motion.polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0.85, opacity: 0.6 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      />
    </svg>
  );
}
