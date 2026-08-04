'use client';

import React from 'react';

interface SimilarityGaugeProps {
  score: number;  // 0.0 to 1.0 (or 0 to 100 — auto-detected)
  size?: number;
  label?: string;
}

export default function SimilarityGauge({ score, size = 140, label = 'Similarity' }: SimilarityGaugeProps) {
  // Auto-detect if the score is 0-1 or 0-100
  const pct = score > 1 ? score : score * 100;
  const normalizedPct = Math.min(100, Math.max(0, pct));

  // Color gradient: red → yellow → green
  const getColor = (p: number) => {
    if (p >= 80) return 'hsl(142, 70%, 50%)';
    if (p >= 60) return 'hsl(48, 90%, 55%)';
    if (p >= 40) return 'hsl(30, 90%, 55%)';
    return 'hsl(0, 75%, 55%)';
  };

  const color = getColor(normalizedPct);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (normalizedPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={8}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.6s ease',
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold tabular-nums"
            style={{ fontSize: size * 0.22, color, fontFamily: 'var(--font-outfit)' }}
          >
            {normalizedPct.toFixed(1)}%
          </span>
        </div>
      </div>
      <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
    </div>
  );
}
