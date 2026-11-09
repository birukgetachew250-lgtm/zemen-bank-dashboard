'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, User, Phone, Hash, X, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CustomerSearchResult {
  id: string;
  cifNumber: string;
  name: string;
  phoneNumber: string;
  email?: string;
  branchName?: string;
  mobileStatus?: string;
  matchType: 'CIF' | 'Phone' | 'Name';
}

const matchBadgeConfig: Record<
  CustomerSearchResult['matchType'],
  { label: string; className: string; Icon: typeof Hash }
> = {
  CIF: {
    label: 'CIF Match',
    className:
      'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    Icon: Hash,
  },
  Phone: {
    label: 'Phone Match',
    className:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    Icon: Phone,
  },
  Name: {
    label: 'Name Match',
    className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    Icon: User,
  },
};

export function GlobalCustomerSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/customers/search?q=${encodeURIComponent(trimmed)}`,
          {
            signal: controller.signal,
            cache: 'no-store',
          }
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setActiveIndex(0);
          setOpen(true);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('[GlobalCustomerSearch] error:', err);
        }
      } finally {
        setLoading(false);
      }
    }, 240);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: CustomerSearchResult) => {
    setOpen(false);
    setQuery('');
    router.push(`/customers/${encodeURIComponent(item.cifNumber)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (results.length ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        results.length ? (prev - 1 + results.length) % results.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) {
        handleSelect(results[activeIndex]);
      } else if (query.trim().length >= 3) {
        setOpen(false);
        router.push(`/customers/${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm md:w-80 lg:w-96">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search customer by Name, Phone, or CIF..."
          aria-label="Global Customer Search"
          className={cn(
            'h-9 w-full rounded-xl border border-border/80 bg-background/80 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground',
            'transition-all duration-200 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20'
          )}
        />
        {loading ? (
          <Loader2 className=" absolute right-2.5 h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Auto-suggest dropdown */}
      {open && query.trim().length >= 2 && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95"
          role="listbox"
        >
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Customer Directory Matches</span>
            <span>{results.length} found</span>
          </div>

          {loading && results.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Searching customers...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs font-medium text-foreground">
                No matching customers for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Try searching by full name, +251 phone number, or 7-digit CIF.
              </p>
            </div>
          ) : (
            <ul className="max-h-80 divide-y divide-border/50 overflow-y-auto p-1">
              {results.map((item, idx) => {
                const badge = matchBadgeConfig[item.matchType] || matchBadgeConfig.Name;
                const BadgeIcon = badge.Icon;
                const isActive = idx === activeIndex;

                return (
                  <li key={`${item.cifNumber}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                        isActive ? 'bg-accent/15 text-foreground' : 'hover:bg-muted/60'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {item.name}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              'inline-flex items-center gap-1 px-1.5 py-0 text-[10px] font-semibold',
                              badge.className
                            )}
                          >
                            <BadgeIcon className="h-2.5 w-2.5" />
                            {badge.label}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="font-mono font-medium text-foreground/80">
                            CIF: {item.cifNumber}
                          </span>
                          {item.phoneNumber && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5" />
                              {item.phoneNumber}
                            </span>
                          )}
                          {item.branchName && <span>· {item.branchName}</span>}
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
