'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ShieldCheck, Activity } from 'lucide-react';

/** Dark glass hero in the Revolut / Apple Card style, with animated counter. */
export function DashboardHero({
  total,
  active,
  linked,
  userName,
}: {
  total: number;
  active: number;
  linked: number;
  userName?: string;
}) {
  const totalRef = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: total,
        duration: 1.6,
        ease: 'power3.out',
        onUpdate: () => {
          if (totalRef.current) totalRef.current.textContent = Math.round(obj.v).toLocaleString();
        },
      });
      gsap.from('.hero-chip', { y: 14, opacity: 0, duration: 0.7, stagger: 0.1, delay: 0.3, ease: 'power3.out' });
      gsap.to('.hero-orb', { y: -14, duration: 3.5, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 0.6 });
    }, root);
    return () => ctx.revert();
  }, [total]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div
      ref={root}
      data-reveal
      className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.6)]"
      style={{
        background:
          'radial-gradient(90% 120% at 100% 0%, hsl(347 75% 38%) 0%, transparent 55%), radial-gradient(70% 90% at 0% 100%, hsl(233 60% 38%) 0%, transparent 60%), linear-gradient(135deg, hsl(222 50% 10%), hsl(225 55% 6%))',
      }}
    >
      <div className="hero-orb pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[hsl(347,90%,60%)] opacity-25 blur-3xl" />
      <div className="hero-orb pointer-events-none absolute right-40 bottom-0 h-40 w-40 rounded-full bg-[hsl(38,92%,55%)] opacity-20 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />

      <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p className="text-sm text-white/60">
            {greeting}{userName ? `, ${userName.split(' ')[0]}` : ''} 👋
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-white/90">Total mobile banking customers</h1>
          <div className="mt-3 flex items-end gap-3">
            <span
              ref={totalRef}
              className="text-5xl md:text-7xl font-extrabold tracking-tighter text-gradient-brand leading-none"
            >
              0
            </span>
            <span className="hero-chip mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
              <Activity className="h-3 w-3" /> {activePct}% active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="hero-chip glass-dark rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-white/50">Linked accounts</p>
            <p className="mt-1 text-2xl font-bold">{linked.toLocaleString()}</p>
          </div>
          <div className="hero-chip glass-dark rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-white/50">Active users</p>
            <p className="mt-1 text-2xl font-bold">{active.toLocaleString()}</p>
          </div>
          <div className="hero-chip glass-dark col-span-2 flex items-center gap-3 rounded-2xl px-4 py-3">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            <p className="text-xs text-white/70">All sensitive changes require Maker–Checker approval.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

