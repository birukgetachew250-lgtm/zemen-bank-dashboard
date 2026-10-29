'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, Smartphone, Fingerprint, Landmark } from 'lucide-react';

const FEATURES = [
  { icon: ShieldCheck, title: 'Maker–Checker control', desc: 'Every sensitive change is reviewed and approved.' },
  { icon: Fingerprint, title: 'Protected customer data', desc: 'Encrypted PII and hashed credentials end to end.' },
  { icon: Smartphone, title: 'Mobile banking operations', desc: 'Onboard, link, reset and support Zemen customers.' },
];

/** Split-screen auth layout: animated brand panel + frosted form card. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.1fr_1fr] bg-[hsl(225,55%,6%)]">
      {/* ── Brand panel ── */}
      <div
        className="relative hidden overflow-hidden lg:flex flex-col justify-between p-12 text-white"
        style={{
          background:
            'radial-gradient(90% 70% at 0% 0%, hsl(347 72% 30%) 0%, transparent 60%), radial-gradient(80% 80% at 100% 100%, hsl(233 60% 30%) 0%, transparent 60%), linear-gradient(160deg, hsl(222 50% 10%), hsl(225 55% 5%))',
        }}
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[hsl(347,85%,50%)] opacity-30 blur-[110px] animate-aurora" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-[hsl(38,92%,55%)] opacity-15 blur-[120px] animate-aurora-slow" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative flex items-center gap-3"
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-xl ring-1 ring-white/20 bg-white/5">
            <Image src="/images/logo.png" alt="Zemen Bank" fill className="object-cover" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">Zemen Bank</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[hsl(38,92%,60%)]/90">Admin Center</p>
          </div>
        </motion.div>

        <div className="relative max-w-xl">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="text-5xl font-extrabold leading-[1.05] tracking-tight"
          >
            Banking operations,
            <br />
            <span className="text-gradient-brand">beautifully simple.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="mt-5 max-w-md text-base text-white/60"
          >
            The control center for Zemen Super App — manage customers, accounts and security with confidence.
          </motion.p>

          <div className="mt-10 space-y-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 200, damping: 22 }}
                  className="glass-dark flex items-center gap-4 rounded-2xl p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(347,80%,50%)]/20 ring-1 ring-[hsl(347,80%,60%)]/30">
                    <Icon className="h-5 w-5 text-[hsl(347,90%,75%)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{f.title}</p>
                    <p className="text-xs text-white/55">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-white/40">
          <Landmark className="h-3.5 w-3.5" /> Licensed by the National Bank of Ethiopia · Zemen Bank S.C.
        </p>
      </div>

      {/* ── Form panel ── */}
      <div
        className="relative flex items-center justify-center overflow-hidden px-5 py-10"
        style={{ background: 'linear-gradient(180deg, hsl(220 25% 97%), hsl(220 20% 94%))' }}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[hsl(347,80%,50%)] opacity-10 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[hsl(233,60%,55%)] opacity-10 blur-[90px]" />

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="relative mb-5 h-14 w-14 overflow-hidden rounded-2xl shadow-[0_12px_30px_-8px_hsl(347_72%_44%/0.5)] ring-1 ring-black/5 lg:hidden">
              <Image src="/images/logo.png" alt="Zemen Bank" fill className="object-cover" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="rounded-3xl border border-white/80 bg-white/80 p-7 backdrop-blur-xl shadow-[0_30px_70px_-24px_rgba(15,23,42,0.28),0_2px_6px_rgba(15,23,42,0.05)]">
            {children}
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Secured session · © {new Date().getFullYear()} Zemen Bank
          </p>
        </motion.div>
      </div>
    </div>
  );
}

