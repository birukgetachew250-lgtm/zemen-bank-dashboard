'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PageHeroBannerProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'crimson' | 'emerald' | 'indigo' | 'amber' | 'slate';
  className?: string;
  children?: React.ReactNode;
}

const VARIANTS = {
  crimson: {
    bg: 'radial-gradient(90% 120% at 100% 0%, hsl(347 75% 38%) 0%, transparent 60%), radial-gradient(70% 90% at 0% 100%, hsl(233 60% 36%) 0%, transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(225 55% 6%))',
    glow1: 'bg-[hsl(347,90%,60%)]',
    glow2: 'bg-[hsl(38,92%,55%)]',
    iconRing: 'ring-[hsl(347,72%,50%)/0.3] bg-[hsl(347,72%,44%)/0.2] text-[hsl(347,90%,75%)]',
  },
  emerald: {
    bg: 'radial-gradient(90% 120% at 100% 0%, hsl(158 64% 32%) 0%, transparent 60%), radial-gradient(70% 90% at 0% 100%, hsl(210 60% 25%) 0%, transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(225 55% 6%))',
    glow1: 'bg-emerald-400',
    glow2: 'bg-teal-300',
    iconRing: 'ring-emerald-400/30 bg-emerald-500/20 text-emerald-300',
  },
  indigo: {
    bg: 'radial-gradient(90% 120% at 100% 0%, hsl(233 65% 42%) 0%, transparent 60%), radial-gradient(70% 90% at 0% 100%, hsl(270 60% 30%) 0%, transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(225 55% 6%))',
    glow1: 'bg-indigo-400',
    glow2: 'bg-violet-400',
    iconRing: 'ring-indigo-400/30 bg-indigo-500/20 text-indigo-300',
  },
  amber: {
    bg: 'radial-gradient(90% 120% at 100% 0%, hsl(38 92% 38%) 0%, transparent 60%), radial-gradient(70% 90% at 0% 100%, hsl(15 80% 30%) 0%, transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(225 55% 6%))',
    glow1: 'bg-amber-400',
    glow2: 'bg-orange-400',
    iconRing: 'ring-amber-400/30 bg-amber-500/20 text-amber-300',
  },
  slate: {
    bg: 'radial-gradient(90% 120% at 100% 0%, hsl(222 35% 25%) 0%, transparent 60%), radial-gradient(70% 90% at 0% 100%, hsl(215 25% 20%) 0%, transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(225 55% 6%))',
    glow1: 'bg-slate-400',
    glow2: 'bg-blue-400',
    iconRing: 'ring-white/20 bg-white/10 text-white',
  },
};

export function PageHeroBanner({
  title,
  subtitle,
  icon,
  badge,
  actions,
  variant = 'crimson',
  className,
  children,
}: PageHeroBannerProps) {
  const conf = VARIANTS[variant] || VARIANTS.crimson;

  return (
    <div
      data-reveal
      className={cn(
        'relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-[0_20px_50px_-16px_rgba(15,23,42,0.5)] border border-white/10 backdrop-blur-xl',
        className
      )}
      style={{ background: conf.bg }}
    >
      {/* Ambient glowing blobs */}
      <div
        className={cn(
          'pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full opacity-20 blur-3xl animate-aurora',
          conf.glow1
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute right-48 -bottom-12 h-48 w-48 rounded-full opacity-15 blur-3xl animate-aurora-slow',
          conf.glow2
        )}
      />

      {/* Micro dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Content layout */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-4">
          {icon && (
            <motion.div
              whileHover={{ scale: 1.08, rotate: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 backdrop-blur-md',
                conf.iconRing
              )}
            >
              {icon}
            </motion.div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="mt-1 text-sm md:text-base text-white/70 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>

      {children && <div className="relative z-10 mt-6">{children}</div>}
    </div>
  );
}

