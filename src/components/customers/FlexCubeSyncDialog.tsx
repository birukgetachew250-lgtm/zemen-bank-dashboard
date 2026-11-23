'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Loader2,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Landmark,
  ArrowRight,
  ShieldAlert,
  Layers,
  Lock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FlexCubeSyncDialogProps {
  cifNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSynced?: (syncedProfile: any) => void;
}

export function FlexCubeSyncDialog({
  cifNumber,
  open,
  onOpenChange,
  onSynced,
}: FlexCubeSyncDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [syncCustomerStatus, setSyncCustomerStatus] = useState(true);

  const loadPreview = useCallback(async () => {
    if (!cifNumber) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/customers/${encodeURIComponent(cifNumber)}/sync-flexcube?_t=${Date.now()}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch FlexCube sync preview.');
      }
      setPreview(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'FlexCube Lookup Warning',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [cifNumber, toast]);

  useEffect(() => {
    if (open && cifNumber) {
      loadPreview();
    }
  }, [open, cifNumber, loadPreview]);

  const handleApplySync = async () => {
    if (!cifNumber) return;
    setSyncing(true);
    try {
      const res = await fetch(
        `/api/customers/${encodeURIComponent(cifNumber)}/sync-flexcube`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            syncCustomerStatus,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to synchronize customer with FlexCube.');
      }

      toast({
        title: 'Synced with FlexCube',
        description: data.message,
      });
      onOpenChange(false);
      if (onSynced) {
        onSynced(data.syncedProfile);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: error.message,
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <RefreshCw className="h-5 w-5 text-primary" />
            Sync Customer Profile &amp; Accounts from FlexCube (CIF: {cifNumber})
          </DialogTitle>
          <DialogDescription>
            Read-only synchronization directly from Core Banking (<code className="font-mono text-xs">FCUBSPRD</code>) into{' '}
            <code className="font-mono text-xs">USER_MODULE.AppUsers</code> and{' '}
            <code className="font-mono text-xs">USER_MODULE.Accounts</code>. Phone numbers are normalized to{' '}
            <code className="font-mono text-xs">2519...</code> format, and existing emails are preserved if FlexCube has no email.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm">Querying FlexCube Core Banking for CIF {cifNumber}...</p>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Customer Freeze / Deceased Alert if detected in FlexCube */}
            {(preview?.flexcube?.isCustomerFrozen || preview?.flexcube?.isCustomerDeceased) && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-rose-700 dark:text-rose-300">
                <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sm">
                    Core Banking Alert: Customer is marked{' '}
                    {preview?.flexcube?.isCustomerDeceased ? 'DECEASED' : 'FROZEN'} in FlexCube
                  </p>
                  <p>
                    Syncing will automatically suspend the customer&apos;s Mobile and USSD access and mark frozen accounts accordingly.
                  </p>
                </div>
              </div>
            )}

            {/* Read-Only Demographic & Contact Sync Preview */}
            <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  1. Core Banking Profile Attributes (Read-Only from FlexCube)
                </h4>
                {preview?.flexcube?.customerCategory && (
                  <Badge variant="outline" className="font-mono text-xs">
                    FlexCube Category: {preview.flexcube.customerCategory}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {/* Full Name */}
                <div className="rounded-xl border border-border bg-background p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="h-3.5 w-3.5 text-primary" />
                      Full Name
                    </span>
                    <Badge variant="secondary" className="text-[10px]">Read-Only</Badge>
                  </div>
                  <p className="text-sm font-bold text-foreground break-words">
                    {preview?.flexcube?.fullName || '—'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Current DB: <span className="font-medium text-foreground">{preview?.current?.fullName || '—'}</span>
                  </p>
                </div>

                {/* Normalized Phone Number */}
                <div className="rounded-xl border border-border bg-background p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      Normalized Phone
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-mono">251...</Badge>
                  </div>
                  <p className="font-mono text-sm font-bold text-foreground">
                    {preview?.flexcube?.phoneNumber || '—'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Current DB: <span className="font-mono text-foreground">{preview?.current?.phoneNumber || '—'}</span>
                    {preview?.flexcube?.phonePreservedFromDb && (
                      <span className="block text-amber-600 dark:text-amber-400">
                        (Preserved from DB — empty in FlexCube)
                      </span>
                    )}
                  </p>
                </div>

                {/* Email Address */}
                <div className="rounded-xl border border-border bg-background p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      Email Address
                    </span>
                    <Badge variant="secondary" className="text-[10px]">Read-Only</Badge>
                  </div>
                  <p className="text-sm font-bold text-foreground break-all">
                    {preview?.flexcube?.email || 'None'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Current DB: <span className="text-foreground">{preview?.current?.email || 'None'}</span>
                    {preview?.flexcube?.emailPreservedFromDb && (
                      <span className="block text-emerald-600 dark:text-emerald-400">
                        (Keeping existing email — empty in FlexCube)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border bg-background p-3">
                <div className="space-y-0.5">
                  <Label className="text-xs font-semibold">
                    Sync Customer Freeze / Deceased Status from FlexCube
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Automatically suspend Mobile &amp; USSD status if customer CIF is frozen in FlexCube.
                  </p>
                </div>
                <Switch
                  checked={syncCustomerStatus}
                  onCheckedChange={setSyncCustomerStatus}
                />
              </div>
            </div>

            {/* Linked Accounts Status, AccountClass & CustomerCategory Comparison */}
            <div className="rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-primary" />
                  2. Linked Accounts Status, AccountClass &amp; CustomerCategory Sync
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {preview?.accountComparisons?.length || 0} Linked Account(s)
                </Badge>
              </div>

              {!preview?.accountComparisons || preview.accountComparisons.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No linked accounts found in USER_MODULE.Accounts for this customer.
                </p>
              ) : (
                <div className="space-y-2">
                  {preview.accountComparisons.map((acc: any) => (
                    <div
                      key={acc.id}
                      className="flex flex-col gap-2 rounded-xl border border-border/80 bg-muted/15 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-bold text-foreground">
                            {acc.accountNumber}
                          </span>
                          <Badge variant="outline" className="font-mono text-[11px]">
                            <Layers className="mr-1 h-3 w-3 text-primary" />
                            Class: {acc.flexcubeAccountClass}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-[11px]">
                            Category: {acc.flexcubeCustomerCategory}
                          </Badge>
                          {acc.classOrCategoryMissing && (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                              Will Populate Missing Class/Category
                            </Badge>
                          )}
                        </div>
                        {acc.statusReason && (
                          <p className="text-[11px] text-rose-600 dark:text-rose-400">
                            FlexCube Note: {acc.statusReason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          DB: {acc.currentStatus || 'Active'}
                        </Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <Badge
                          className={cn(
                            'text-xs',
                            acc.recommendedStatus === 'Active'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : acc.recommendedStatus === 'Frozen' || acc.recommendedStatus === 'Blocked'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          )}
                        >
                          FlexCube: {acc.recommendedStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={syncing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={loadPreview}
            disabled={loading || syncing}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
            Re-Check FlexCube
          </Button>
          <Button
            type="button"
            onClick={handleApplySync}
            disabled={loading || syncing}
          >
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Sync &amp; Update Database
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
