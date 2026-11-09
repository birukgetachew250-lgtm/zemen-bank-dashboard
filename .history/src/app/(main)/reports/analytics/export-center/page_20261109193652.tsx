'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PlusCircle,
  Download,
  DownloadCloud,
  CheckCircle2,
  Loader2,
  Database,
  FileSpreadsheet,
} from 'lucide-react';
import { PageHeroBanner } from '@/components/layout/PageHeroBanner';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ExportJob {
  id: string;
  datasetKey: string;
  datasetLabel: string;
  daysWindow: number;
  format: 'CSV' | 'JSON';
  rowCount: number;
  isLive: boolean;
  requestedAt: Date;
  status: 'Ready' | 'Processing' | 'Failed';
  cachedRows?: any[];
}

const EXPORT_DATASETS = [
  {
    key: 'transactions',
    label: 'Financial Transactions (LIMIT_CHARGE_MODULE.CustomerTransactions)',
    desc: 'Debit/Credit accounts, CIF, amount, fees, FlexCube reference, and status',
  },
  {
    key: 'wso2_logs',
    label: 'WSO2 Request Logs — Last 15 Days (WSO2_MODULE.WSO2_REQUEST_LOGS)',
    desc: 'Gateway request ID, service name, endpoint, HTTP status, execution ms, and error codes',
  },
  {
    key: 'customers',
    label: 'Registered Customers (USER_MODULE.AppUsers)',
    desc: 'Decrypted customer profile, CIF, branch, Mobile/USSD status, MFA channel, and registration date',
  },
  {
    key: 'accounts',
    label: 'Linked Bank Accounts (USER_MODULE.Accounts)',
    desc: 'CIF, decrypted account number, account type, currency, branch, and status',
  },
  {
    key: 'devices',
    label: 'Enrolled Mobile Devices (DEVICE_CONTROL_MODULE.CustomerDevices)',
    desc: 'Device ID, model, OS, app version, registration status, and last seen timestamp',
  },
  {
    key: 'ratings',
    label: 'Customer App Ratings & Reviews (DEVICE_CONTROL_MODULE.AppRatings)',
    desc: 'Star rating (1–5), customer comments, CIF, phone, device OS, and app version',
  },
  {
    key: 'migration',
    label: 'Bankworld Migration Whitelist (MIGRATION_MODULE.MigrationWhitelists)',
    desc: 'HostAccountId, Bankworld username, CIF, migration status, and migrated timestamp',
  },
  {
    key: 'approvals',
    label: 'Maker–Checker Approval History (Workflow DB)',
    desc: 'All customer & account workflow requests, maker email, checker remarks, and status',
  },
  {
    key: 'audit_logs',
    label: 'System Security & Activity Audit Trail (SystemActivityLog)',
    desc: 'Admin actions, mutations, timestamps, IP addresses, and outcomes',
  },
];

export default function ExportCenterPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState('transactions');
  const [selectedDays, setSelectedDays] = useState('30');
  const [selectedFormat, setSelectedFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [generating, setGenerating] = useState(false);

  const [exportHistory, setExportHistory] = useState<ExportJob[]>([]);

  const downloadRows = (rows: any[], filenameBase: string, fmt: 'CSV' | 'JSON') => {
    if (fmt === 'JSON') {
      const blob = new Blob([JSON.stringify(rows, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenameBase}.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    }

    const headers = rows.length > 0 ? Object.keys(rows[0]) : ['Info'];
    const csvLines =
      rows.length > 0
        ? [
            headers.join(','),
            ...rows.map((r) =>
              headers
                .map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`)
                .join(',')
            ),
          ]
        : ['Info', '"No records returned for this time range"'];
    const blob = new Blob([csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenameBase}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleGenerateExport = async (
    datasetKey = selectedDataset,
    daysStr = selectedDays,
    fmt = selectedFormat
  ) => {
    setGenerating(true);
    const dsMeta =
      EXPORT_DATASETS.find((d) => d.key === datasetKey) || EXPORT_DATASETS[0];
    try {
      const res = await fetch(
        `/api/reports/export?dataset=${encodeURIComponent(datasetKey)}&days=${encodeURIComponent(daysStr)}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('Failed to fetch export dataset');
      const data = await res.json();
      const rows: any[] = data.rows || [];

      const job: ExportJob = {
        id: `exp-${Date.now()}`,
        datasetKey,
        datasetLabel: dsMeta.label,
        daysWindow: Number(daysStr),
        format: fmt,
        rowCount: rows.length,
        isLive: Boolean(data.isLive),
        requestedAt: new Date(),
        status: 'Ready',
        cachedRows: rows,
      };

      setExportHistory((prev) => [job, ...prev]);
      setIsDialogOpen(false);

      downloadRows(
        rows,
        `zemen-${datasetKey}-${new Date().toISOString().split('T')[0]}`,
        fmt
      );

      toast({
        title: 'Export Completed & Downloaded',
        description: `Exported ${rows.length.toLocaleString()} records from ${dsMeta.label}.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: err.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeroBanner
        variant="indigo"
        icon={<DownloadCloud className="h-6 w-6 text-indigo-300" />}
        title="Enterprise Data Export Center"
        subtitle="Generate and download on-demand CSV or JSON extracts directly from all connected Oracle & workflow databases"
        actions={
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 border rounded-xl"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> New Custom Export
          </Button>
        }
      />

      {/* Quick One-Click Live Dataset Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORT_DATASETS.map((ds) => (
          <Card
            key={ds.key}
            className="border-border/80 flex flex-col justify-between hover:border-primary/40 transition-colors"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-bold leading-snug">
                  {ds.label}
                </CardTitle>
                <Database className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              </div>
              <CardDescription className="text-xs mt-1">{ds.desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={generating}
                onClick={() => handleGenerateExport(ds.key, '30', 'CSV')}
              >
                <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                Export CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                disabled={generating}
                onClick={() => handleGenerateExport(ds.key, '30', 'JSON')}
              >
                JSON
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Session Export History Table */}
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">Generated Exports History</CardTitle>
          <CardDescription>
            All exports generated during this session — click Download to save a copy again
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Requested At</TableHead>
                  <TableHead>Data Source</TableHead>
                  <TableHead>Window</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead className="text-right">Rows Exported</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exportHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Click any &ldquo;Export CSV&rdquo; button above or &ldquo;New Custom Export&rdquo; to generate a live data extract.
                    </TableCell>
                  </TableRow>
                ) : (
                  exportHistory.map((ex) => (
                    <TableRow key={ex.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {format(ex.requestedAt, 'dd MMM yyyy, HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{ex.datasetLabel}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        Last {ex.daysWindow} Days
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {ex.format}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {ex.rowCount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() =>
                            downloadRows(
                              ex.cachedRows || [],
                              `zemen-${ex.datasetKey}-reexport`,
                              ex.format
                            )
                          }
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Download Again
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Data Export</DialogTitle>
            <DialogDescription>
              Select the live database table, lookback window, and output format.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="space-y-1.5">
              <Label>Database Module / Dataset</Label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_DATASETS.map((ds) => (
                    <SelectItem key={ds.key} value={ds.key}>
                      {ds.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Date Range Window</Label>
              <Select value={selectedDays} onValueChange={setSelectedDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Today (Last 24 Hours)</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="15">Last 15 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last 365 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Export Format</Label>
              <Select
                value={selectedFormat}
                onValueChange={(v: any) => setSelectedFormat(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSV">CSV (Excel Compatible)</SelectItem>
                  <SelectItem value="JSON">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={generating}
              onClick={() =>
                handleGenerateExport(selectedDataset, selectedDays, selectedFormat)
              }
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Generate &amp; Download
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
