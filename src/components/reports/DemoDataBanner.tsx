import { cn } from '@/lib/utils';

export function DemoDataBanner({ className }: { className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
      'bg-amber-100 border border-amber-300 text-amber-800',
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      📊 Demo Data — Connect Oracle DB for live data
    </span>
  );
}

export function LiveDataBadge({ className }: { className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
      'bg-green-100 border border-green-300 text-green-700',
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Live Data
    </span>
  );
}

export function DataSourceBadge({ isLive }: { isLive: boolean }) {
  return isLive ? <LiveDataBadge /> : <DemoDataBanner />;
}
