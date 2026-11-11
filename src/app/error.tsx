'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /Loading chunk [\d\w-]+ failed/i.test(error?.message || '') ||
      /Failed to fetch dynamically imported module/i.test(error?.message || '');

    if (isChunkError && typeof window !== 'undefined') {
      const reloadKey = 'zemen:chunk-reload';
      const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
      if (Date.now() - lastReload > 10000) {
        sessionStorage.setItem(reloadKey, String(Date.now()));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-lg space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Page Update Required</h2>
        <p className="text-sm text-muted-foreground">
          A new version of the portal was recently deployed or a page resource failed to load. Please refresh to load the latest version.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => reset()}
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}
