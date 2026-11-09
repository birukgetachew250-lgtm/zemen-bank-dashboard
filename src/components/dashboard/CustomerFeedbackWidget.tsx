'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Star,
  Smartphone,
  MessageSquareQuote,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AppRatingReview {
  id: string;
  customerDeviceId: string;
  cif: string;
  maskedCif: string;
  phoneNumber: string;
  ratingScore: number;
  comment: string;
  appVersion: string;
  deviceOs: string;
  deviceOsVersion: string;
  deviceModel: string;
  status: string;
  createdAt: string;
}

interface AppRatingsResponse {
  averageRating: number;
  totalReviews: number;
  filteredTotal?: number;
  distribution: Record<number, number>;
  reviews: AppRatingReview[];
  page: number;
  pageSize: number;
  totalPages: number;
  source?: string;
  error?: string;
}

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass =
    size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <Star
            key={star}
            className={cn(
              sizeClass,
              'transition-transform',
              filled
                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]'
                : 'fill-muted/30 text-muted-foreground/30'
            )}
          />
        );
      })}
    </div>
  );
}

export function CustomerFeedbackWidget() {
  const [data, setData] = useState<AppRatingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [revealCif, setRevealCif] = useState(false);

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '6',
      });
      if (selectedStar !== null) {
        params.set('rating', String(selectedStar));
      }
      const res = await fetch(`/api/dashboard/app-ratings?${params.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch app ratings:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedStar]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handleStarFilter = (star: number) => {
    setPage(1);
    setSelectedStar((prev) => (prev === star ? null : star));
  };

  const avg = data?.averageRating ?? 0;
  const total = data?.totalReviews ?? 0;
  const dist = data?.distribution ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const reviews = data?.reviews ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <Card className="overflow-hidden border-border/80 bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-col gap-3 border-b border-border/60 bg-muted/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 ring-1 ring-amber-500/30">
            <MessageSquareQuote className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground">
              Customer App Feedback &amp; Ratings
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Real-time ratings and reviews from Zemen SuperApp users (DEVICE_CONTROL_MODULE.AppRatings)
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRevealCif((v) => !v)}
            className="h-8 gap-1.5 rounded-xl text-xs"
            title={revealCif ? 'Mask CIF numbers' : 'Unmask CIF numbers'}
          >
            {revealCif ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {revealCif ? 'Mask CIF' : 'Show CIF'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRatings}
            disabled={loading}
            className="h-8 gap-1.5 rounded-xl text-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y divide-border/60 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* Left Column: Aggregated Score & Rating Distribution */}
          <div className="flex flex-col justify-between p-6 lg:col-span-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-extrabold tracking-tight text-foreground">
                  {avg.toFixed(1)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">out of 5.0</span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <StarRow rating={avg} size="md" />
                <span className="text-xs font-medium text-muted-foreground">
                  ({total.toLocaleString()} {total === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {/* Rating Distribution Bars */}
              <div className="mt-6 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider">Rating Distribution</span>
                  {selectedStar !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStar(null);
                        setPage(1);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                    >
                      <Filter className="h-3 w-3" /> Clear ({selectedStar}★)
                    </button>
                  )}
                </div>

                {[5, 4, 3, 2, 1].map((star) => {
                  const count = dist[star] || 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const isSelected = selectedStar === star;

                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarFilter(star)}
                      className={cn(
                        'group flex w-full items-center gap-2.5 rounded-lg px-2 py-1 text-left text-xs transition-colors',
                        isSelected
                          ? 'bg-primary/10 ring-1 ring-primary/30'
                          : 'hover:bg-muted/60'
                      )}
                    >
                      <span className="flex w-8 items-center gap-1 font-semibold text-foreground">
                        {star}
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            star >= 4
                              ? 'bg-emerald-500'
                              : star === 3
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-mono text-[11px] text-muted-foreground">
                        {count} ({pct}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
              Click any star bar above to filter reviews by rating score.
            </div>
          </div>

          {/* Right Column: Scrollable & Paginated Customer Reviews */}
          <div className="flex flex-col lg:col-span-8">
            <ScrollArea className="h-[370px]">
              <div className="divide-y divide-border/60 p-4 sm:p-6">
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="animate-pulse space-y-2 rounded-xl border border-border/50 bg-muted/20 p-4"
                      >
                        <div className="flex justify-between">
                          <div className="h-4 w-32 rounded bg-muted" />
                          <div className="h-4 w-24 rounded bg-muted" />
                        </div>
                        <div className="h-3 w-48 rounded bg-muted" />
                        <div className="h-4 w-full rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <MessageSquareQuote className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      No customer feedback records found
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                      {selectedStar !== null
                        ? `No active reviews matching ${selectedStar} stars.`
                        : 'Reviews submitted by customers in the SuperApp will appear here automatically.'}
                    </p>
                  </div>
                ) : (
                  reviews.map((item) => {
                    const platformLabel = [
                      item.deviceOs
                        ? `${item.deviceOs}${item.deviceOsVersion ? ` ${item.deviceOsVersion}` : ''}`
                        : null,
                      item.deviceModel || null,
                      item.appVersion ? `v${item.appVersion}` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ');

                    const formattedDate = item.createdAt
                      ? new Date(item.createdAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—';

                    return (
                      <div
                        key={item.id}
                        className="group py-4 first:pt-0 last:pb-0 transition-colors"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                              href={`/customers/${encodeURIComponent(item.cif)}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                            >
                              CIF: {revealCif ? item.cif : item.maskedCif}
                            </Link>
                            <StarRow rating={item.ratingScore} size="sm" />
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[11px] font-semibold',
                                item.ratingScore >= 4
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : item.ratingScore === 3
                                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              )}
                            >
                              {item.ratingScore}.0 / 5
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {platformLabel && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                                <Smartphone className="h-3 w-3 text-muted-foreground" />
                                {platformLabel}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[11px]">
                              <Clock className="h-3 w-3" />
                              {formattedDate}
                            </span>
                          </div>
                        </div>

                        <p className="mt-2.5 text-sm leading-relaxed text-foreground/90">
                          {item.comment ? (
                            item.comment
                          ) : (
                            <span className="italic text-muted-foreground">
                              No written comment provided.
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t border-border/60 bg-muted/15 px-6 py-3">
              <p className="text-xs text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page}</span> of{' '}
                <span className="font-semibold text-foreground">{totalPages}</span>
                {selectedStar !== null && ` · Filtered by ${selectedStar}★`}
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
