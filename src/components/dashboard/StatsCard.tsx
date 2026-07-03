
'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient?: string;         // tailwind gradient classes or inline style
  gradientStyle?: string;    // CSS gradient string for style prop
  trend?: number;            // positive = up, negative = down, 0/undefined = neutral
  trendLabel?: string;       // e.g. "vs last month"
  subtitle?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  gradient,
  gradientStyle,
  trend,
  trendLabel,
  subtitle,
  className,
}: StatsCardProps) {
  const valueRef = useRef<HTMLSpanElement>(null);

  /* ── Animated number count-up ── */
  useEffect(() => {
    const el = valueRef.current;
    if (!el) return;
    const num = parseFloat(String(value).replace(/,/g, ''));
    if (isNaN(num)) return;

    let start = 0;
    const duration = 900;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(eased * num);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = typeof value === 'number' ? value.toLocaleString() : value;
    };
    requestAnimationFrame(step);
  }, [value]);

  const trendIcon =
    trend === undefined || trend === 0 ? (
      <Minus className="h-3 w-3" />
    ) : trend > 0 ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    );

  const trendColor =
    trend === undefined || trend === 0
      ? 'text-muted-foreground'
      : trend > 0
      ? 'text-emerald-600'
      : 'text-red-500';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white border border-slate-200/80',
        'transition-all duration-300 hover:-translate-y-1',
        'hover:shadow-lg hover:shadow-slate-200/60 hover:border-slate-300/80',
        'animate-fade-up',
        className
      )}
      style={{ boxShadow: '0 2px 8px rgba(34,47,90,0.06)' }}
    >
      {/* Background gradient blob */}
      <div
        className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-8 blur-2xl pointer-events-none transition-all duration-500 group-hover:opacity-15 group-hover:scale-110"
        style={{ background: gradientStyle || 'hsl(347,72%,44%)' }}
      />

      <div className="relative p-5">
        {/* Top row: title + icon */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-none">
            {title}
          </p>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            style={{
              background: gradientStyle
                ? `linear-gradient(135deg, ${gradientStyle}22, ${gradientStyle}44)`
                : 'hsl(347,72%,95%)',
            }}
          >
            <div className="[&>svg]:h-5 [&>svg]:w-5" style={{ color: gradientStyle || 'hsl(347,72%,44%)' }}>
              {icon}
            </div>
          </div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <span
            ref={valueRef}
            className="text-3xl font-extrabold text-foreground tracking-tight animate-count-up"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        </div>

        {/* Subtitle or trend */}
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <div className={cn('flex items-center gap-0.5 text-xs font-semibold', trendColor)}>
              {trendIcon}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
          {(trendLabel || subtitle) && (
            <p className="text-xs text-muted-foreground truncate">{trendLabel || subtitle}</p>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
        style={{ background: gradientStyle ? `linear-gradient(90deg, transparent, ${gradientStyle}, transparent)` : 'transparent' }}
      />
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
