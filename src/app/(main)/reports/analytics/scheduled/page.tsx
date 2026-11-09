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
import { Input } from '@/components/ui/input';
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
  Edit,
  Trash2,
  Play,
  Mail,
  Pause,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { PageHeroBanner } from '@/components/layout/PageHeroBanner';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ScheduledReport {
  id: string;
  name: string;
  dataset: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  recipients: string;
  format: 'CSV' | 'JSON';
  lastSent: Date;
  status: 'Active' | 'Paused';
}

const INITIAL_REPORTS: ScheduledReport[] = [
  {
    id: 'sr-1',
    name: 'Daily Financial & Gateway Transaction Summary',
    dataset: 'transactions',
    frequency: 'Daily',
    recipients: 'operations@zemenbank.com, ebanking@zemenbank.com',
    format: 'CSV',
    lastSent: new Date(),
    status: 'Active',
  },
  {
    id: 'sr-2',
    name: 'Daily WSO2 API Gateway Performance & Error Report',
    dataset: 'wso2_logs',
    frequency: 'Daily',
    recipients: 'it-monitoring@zemenbank.com',
    format: 'CSV',
    lastSent: new Date(Date.now() - 4 * 3600 * 1000),
    status: 'Active',
  },
  {
    id: 'sr-3',
    name: 'Weekly Customer Onboarding & Branch Inclusion Report',
    dataset: 'customers',
    frequency: 'Weekly',
    recipients: 'retail-banking@zemenbank.com',
    format: 'CSV',
    lastSent: new Date(Date.now() - 3 * 86400 * 1000),
    status: 'Active',
  },
  {
    id: 'sr-4',
    name: 'Weekly Bankworld-to-SuperApp Migration Progress',
    dataset: 'migration',
    frequency: 'Weekly',
    recipients: 'migration-team@zemenbank.com',
    format: 'CSV',
    lastSent: new Date(Date.now() - 2 * 86400 * 1000),
    status: 'Active',
  },
  {
    id: 'sr-5',
    name: 'Monthly Maker-Checker Compliance & Audit Trail',
    dataset: 'approvals',
    frequency: 'Monthly',
    recipients: 'compliance@zemenbank.com, internal-audit@zemenbank.com',
    format: 'CSV',
    lastSent: new Date(Date.now() - 12 * 86400 * 1000),
    status: 'Active',
  },
];

const DATASET_LABELS: Record<string, string> = {
  transactions: 'Transactions (LIMIT_CHARGE_MODULE)',
  wso2_logs: 'WSO2 Gateway Logs (Last 15 Days)',
  customers: 'Enrolled Customers (USER_MODULE)',
  accounts: 'Linked Bank Accounts (USER_MODULE)',
  devices: 'Customer Devices (DEVICE_CONTROL)',
  ratings: 'App Ratings & Feedback (DEVICE_CONTROL)',
  migration: 'App Migration Whitelist (MIGRATION_MODULE)',
  approvals: 'Maker-Checker Workflow History',
  audit_logs: 'System Security & Activity Audit',
};

export default function ScheduledReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ScheduledReport[]>(INITIAL_REPORTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDataset, setFormDataset] = useState('transactions');
  const [formFrequency, setFormFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [formRecipients, setFormRecipients] = useState('');
  const [formFormat, setFormFormat] = useState<'CSV' | 'JSON'>('CSV');

  const openDialog = (report?: ScheduledReport) => {
    if (report) {
      setEditingReport(report);
      setFormName(report.name);
      setFormDataset(report.dataset);
      setFormFrequency(report.frequency);
      setFormRecipients(report.recipients);
      setFormFormat(report.format);
    } else {
      setEditingReport(null);
      setFormName('');
      setFormDataset('transactions');
      setFormFrequency('Daily');
      setFormRecipients('');
      setFormFormat('CSV');
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formRecipients.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please enter a report name and at least one recipient email.',
      });
      return;
    }

    if (editingReport) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === editingReport.id
            ? {
                ...r,
                name: formName.trim(),
                dataset: formDataset,
                frequency: formFrequency,
                recipients: formRecipients.trim(),
                format: formFormat,
              }
            : r
        )
      );
      toast({ title: 'Schedule Updated', description: `"${formName}" has been updated.` });
    } else {
      const created: ScheduledReport = {
        id: `sr-${Date.now()}`,
        name: formName.trim(),
        dataset: formDataset,
        frequency: formFrequency,
        recipients: formRecipients.trim(),
        format: formFormat,
        lastSent: new Date(),
        status: 'Active',
      };
      setReports((prev) => [created, ...prev]);
      toast({ title: 'Schedule Created', description: `"${created.name}" is now active.` });
    }
    setIsDialogOpen(false);
  };

  const toggleStatus = (id: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r
      )
    );
  };

  const deleteSchedule = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast({ title: 'Schedule Removed', description: 'Scheduled report has been deleted.' });
  };

  const runAndDownloadNow = async (report: ScheduledReport) => {
    setRunningId(report.id);
    try {
      const res = await fetch(`/api/reports/export?dataset=${report.dataset}&days=30`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch live report dataset');
      const data = await res.json();
      const rows: any[] = data.rows || [];

      if (report.format === 'JSON') {
        const blob = new Blob([JSON.stringify(rows, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.dataset}-scheduled-run.json`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const headers = rows.length > 0 ? Object.keys(rows[0]) : ['Message'];
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
            : ['Message', `"No records found for ${report.dataset} in the selected window"`];
        const blob = new Blob([csvLines.join('\n')], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.dataset}-scheduled-run.csv`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, lastSent: new Date() } : r))
      );
      toast({
        title: 'Report Executed & Downloaded',
        description: `Generated ${rows.length} rows from ${DATASET_LABELS[report.dataset] || report.dataset}.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Execution Failed',
        description: err.message,
      });
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeroBanner
        variant="indigo"
        icon={<Mail className="h-6 w-6 text-indigo-300" />}
        title="Scheduled Reports & Automated Dispatch"
        subtitle="Configure automated daily, weekly, and monthly database reports or trigger immediate on-demand execution"
        actions={
          <Button
            onClick={() => openDialog()}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 border rounded-xl"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Schedule
          </Button>
        }
      />

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">Active &amp; Paused Report Schedules</CardTitle>
          <CardDescription>
            Click &ldquo;Run Now&rdquo; on any schedule to query the live database and download the report immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Report Name</TableHead>
                  <TableHead>Live Data Source</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Last Executed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-muted/20">
                    <TableCell className="font-semibold">{report.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {DATASET_LABELS[report.dataset] || report.dataset}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.frequency}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{report.format}</TableCell>
                    <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">
                      {report.recipients}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(report.lastSent, 'dd MMM yyyy, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          report.status === 'Active'
                            ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        }
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1"
                          disabled={runningId === report.id}
                          onClick={() => runAndDownloadNow(report)}
                        >
                          {runningId === report.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                          Run Now
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={report.status === 'Active' ? 'Pause Schedule' : 'Resume Schedule'}
                          onClick={() => toggleStatus(report.id)}
                        >
                          <Pause className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openDialog(report)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() => deleteSchedule(report.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReport ? 'Edit' : 'Create'} Scheduled Report</DialogTitle>
            <DialogDescription>
              Select the live database module, schedule cadence, and recipient list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Report Title</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Daily WSO2 Gateway Summary"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Live Data Source</Label>
              <Select value={formDataset} onValueChange={setFormDataset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DATASET_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Select
                  value={formFrequency}
                  onValueChange={(v: any) => setFormFrequency(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Export Format</Label>
                <Select value={formFormat} onValueChange={(v: any) => setFormFormat(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSV">CSV (Spreadsheet)</SelectItem>
                    <SelectItem value="JSON">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
              <Input
                id="recipients"
                value={formRecipients}
                onChange={(e) => setFormRecipients(e.target.value)}
                placeholder="execs@zemenbank.com, compliance@zemenbank.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
