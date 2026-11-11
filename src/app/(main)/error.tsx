'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function MainErrorBoundary({
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
    <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-lg space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Unable to Load Page View</h2>
        <p className="text-sm text-muted-foreground">
          The application was recently updated or a script chunk expired. Click below to reload the latest version.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => reset()}>
            Retry View
          </Button>
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Hard Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
