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

  // Color gradient: red → amber → green
  const getColor = (p: number) => {
    if (p >= 80) return 'hsl(var(--success, 142 70% 50%))'; // using standard success color if available or raw hsl
    if (p >= 60) return 'hsl(var(--warning, 48 90% 55%))';
    return 'hsl(var(--destructive, 0 75% 55%))';
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
            className="stroke-muted"
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
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold tabular-nums"
            style={{ fontSize: size * 0.22, color }}
          >
            {normalizedPct.toFixed(1)}%
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}
