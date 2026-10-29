'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  LayoutDashboard,
  ClipboardList,
  FileCheck2,
  Users,
  Link2,
  ShieldAlert,
  KeyRound,
  Smartphone,
  LockOpen,
  PieChart,
  ShieldCheck,
  Settings,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  label: string;
  category: 'Navigation' | 'Maker Requests' | 'Checker Approvals' | 'Tools';
  href: string;
  icon: React.ReactNode;
  keywords?: string[];
}

const ITEMS: PaletteItem[] = [
  // Navigation
  { id: 'dash', label: 'Main Dashboard', category: 'Navigation', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" />, keywords: ['home', 'overview', 'stats'] },
  { id: 'maker-q', label: 'Maker Dashboard', category: 'Navigation', href: '/overview/maker', icon: <ClipboardList className="h-4 w-4" />, keywords: ['maker', 'requests', 'my'] },
  { id: 'checker-q', label: 'Checker Dashboard', category: 'Navigation', href: '/overview/checker', icon: <FileCheck2 className="h-4 w-4" />, keywords: ['checker', 'pending', 'review'] },
  { id: 'customers', label: 'Customer Audit & Search', category: 'Navigation', href: '/customers/audit', icon: <Users className="h-4 w-4" />, keywords: ['cif', 'users', 'accounts'] },
  { id: 'online-link', label: 'Online Linking Overview', category: 'Navigation', href: '/online-linking/overview', icon: <Link2 className="h-4 w-4" />, keywords: ['onboarding', 'linking'] },
  { id: 'reports', label: 'Transaction Reports', category: 'Navigation', href: '/reports/transactions', icon: <PieChart className="h-4 w-4" />, keywords: ['tx', 'volume', 'history'] },
  { id: 'risk-aml', label: 'AML & KYC Compliance', category: 'Navigation', href: '/risk/aml-kyc', icon: <ShieldCheck className="h-4 w-4" />, keywords: ['compliance', 'sanctions', 'aml'] },
  { id: 'settings', label: 'System Settings', category: 'Navigation', href: '/settings', icon: <Settings className="h-4 w-4" />, keywords: ['config', 'admin'] },

  // Maker
  { id: 'new-cust', label: 'Register New Customer', category: 'Maker Requests', href: '/customers/create', icon: <Users className="h-4 w-4 text-rose-500" />, keywords: ['onboard', 'create', 'maker'] },
  { id: 'link-acc', label: 'Link Account to CIF', category: 'Maker Requests', href: '/customers/link-account', icon: <Link2 className="h-4 w-4 text-indigo-500" />, keywords: ['casa', 'loan', 'link'] },
  { id: 'sec-reset', label: 'Reset Security Questions', category: 'Maker Requests', href: '/customers/request-security-reset', icon: <ShieldAlert className="h-4 w-4 text-purple-500" />, keywords: ['security', 'questions', 'reset'] },
  { id: 'pin-reset', label: 'Request PIN Reset', category: 'Maker Requests', href: '/customers/request-pin-reset', icon: <KeyRound className="h-4 w-4 text-amber-500" />, keywords: ['pin', 'temporary'] },
  { id: 'act-resend', label: 'Resend Activation Code', category: 'Maker Requests', href: '/customers/resend-activation', icon: <Smartphone className="h-4 w-4 text-sky-500" />, keywords: ['activation', 'sms'] },
  { id: 'unlock-c', label: 'Unlock Customer Profile', category: 'Maker Requests', href: '/customers/unlock-customer', icon: <LockOpen className="h-4 w-4 text-emerald-500" />, keywords: ['unlock', 'locked', 'frozen'] },

  // Checker
  { id: 'appr-new', label: 'Approve New Customers', category: 'Checker Approvals', href: '/customers/approve-new', icon: <FileCheck2 className="h-4 w-4 text-amber-500" />, keywords: ['verify', 'checker'] },
  { id: 'appr-acc', label: 'Approve Account Linking', category: 'Checker Approvals', href: '/customers/approve-accounts', icon: <FileCheck2 className="h-4 w-4 text-emerald-500" />, keywords: ['checker', 'accounts'] },
  { id: 'appr-sec', label: 'Approve Security Resets', category: 'Checker Approvals', href: '/customers/approve-security', icon: <FileCheck2 className="h-4 w-4 text-purple-500" />, keywords: ['security', 'checker'] },
  { id: 'appr-pin', label: 'Approve PIN Resets', category: 'Checker Approvals', href: '/customers/approve-pin-reset', icon: <FileCheck2 className="h-4 w-4 text-rose-500" />, keywords: ['pin', 'checker'] },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter items
  const filtered = ITEMS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const matchesLabel = item.label.toLowerCase().includes(q);
    const matchesCategory = item.category.toLowerCase().includes(q);
    const matchesKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
    return matchesLabel || matchesCategory || matchesKeywords;
  });

  const isNumericQuery = /^\d{3,}$/.test(query.trim());

  const handleSelect = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length + (isNumericQuery ? 1 : 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length + (isNumericQuery ? 1 : 0)) % (filtered.length + (isNumericQuery ? 1 : 0)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isNumericQuery && selectedIndex === 0) {
        handleSelect(`/customers/${query.trim()}`);
      } else {
        const item = isNumericQuery ? filtered[selectedIndex - 1] : filtered[selectedIndex];
        if (item) handleSelect(item.href);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-[0_30px_90px_-20px_rgba(15,23,42,0.45)]">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>

        {/* Search header */}
        <div className="relative flex items-center border-b border-slate-100 px-4 py-3.5">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a CIF, customer name, or command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent px-3 text-base font-medium text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results container */}
        <div className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin">
          {/* Quick jump for numeric CIF */}
          {isNumericQuery && (
            <div
              onClick={() => handleSelect(`/customers/${query.trim()}`)}
              className={`flex items-center justify-between gap-3 rounded-xl p-3 cursor-pointer transition-colors ${
                selectedIndex === 0 ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Open Customer Profile for CIF: <span className="font-mono text-primary">{query.trim()}</span></p>
                  <p className="text-xs text-slate-500">Jump directly to accounts, loans & security</p>
                </div>
              </div>
              <CornerDownLeft className="h-4 w-4 text-slate-400" />
            </div>
          )}

          {filtered.length === 0 && !isNumericQuery ? (
            <div className="py-12 text-center">
              <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No matching commands or pages</p>
              <p className="text-xs text-slate-400 mt-0.5">Try searching for a CIF number or keyword</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const adjustedIdx = isNumericQuery ? idx + 1 : idx;
              const isSelected = selectedIndex === adjustedIdx;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(adjustedIdx)}
                  className={`group flex items-center justify-between gap-3 rounded-xl p-2.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[hsl(347,72%,44%/0.08)] text-slate-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isSelected ? 'bg-white shadow-sm ring-1 ring-slate-200 text-primary' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium leading-none truncate">{item.label}</p>
                      <p className="text-[11px] text-slate-400 mt-1 capitalize leading-none">{item.category}</p>
                    </div>
                  </div>
                  {isSelected ? (
                    <CornerDownLeft className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="rounded bg-white px-1.5 py-0.5 border border-slate-200">↑↓</kbd> Navigate</span>
            <span><kbd className="rounded bg-white px-1.5 py-0.5 border border-slate-200">↵</kbd> Select</span>
          </div>
          <span>Zemen Command Palette</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

