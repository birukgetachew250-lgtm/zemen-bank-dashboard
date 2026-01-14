
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Loader2, ShieldQuestion, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/transactions/DateRangePicker';
import { DateRange } from 'react-day-picker';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AuditLog {
  id: number;
  timestamp: string;
  userEmail: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  status: string;
}

interface WhitelistEntry {
  id: number;
  cidr: string;
  label: string;
}

export default function LoginSessionsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [logLoading, setLogLoading] = useState(true);
  const [whitelistLoading, setWhitelistLoading] = useState(true);
  const [logQuery, setLogQuery] = useState('');
  const [logDateRange, setLogDateRange] = useState<DateRange | undefined>();
  const [newCidr, setNewCidr] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WhitelistEntry | null>(null);

  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setLogLoading(true);
    const params = new URLSearchParams();
    if (logQuery) params.append('query', logQuery);
    if (logDateRange?.from) params.append('from', logDateRange.from.toISOString());
    if (logDateRange?.to) params.append('to', logDateRange.to.toISOString());

    try {
      const res = await fetch(`/api/security/activity-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch activity logs.' });
    } finally {
      setLogLoading(false);
    }
  }, [logQuery, logDateRange, toast]);

  const fetchWhitelist = useCallback(async () => {
    setWhitelistLoading(true);
    try {
      const res = await fetch('/api/security/ip-whitelist');
      if (!res.ok) throw new Error('Failed to fetch whitelist');
      const data = await res.json();
      setWhitelist(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch IP whitelist.' });
    } finally {
      setWhitelistLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLogs();
    fetchWhitelist();
  }, [fetchLogs, fetchWhitelist]);

  const handleAddIp = async () => {
      if (!newCidr || !newLabel) {
          toast({ variant: 'destructive', title: 'Missing fields', description: 'Please provide both an IP range and a label.'});
          return;
      }
      setIsAdding(true);
      try {
          const res = await fetch('/api/security/ip-whitelist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ cidr: newCidr, label: newLabel }),
          });
          if (!res.ok) {
              const error = await res.json();
              throw new Error(error.message);
          }
          toast({ title: 'Success', description: 'IP range added to whitelist.' });
          setNewCidr('');
          setNewLabel('');
          fetchWhitelist(); // Refresh list
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
          setIsAdding(false);
      }
  };

    const handleDeleteIp = async () => {
        if (!itemToDelete) return;
        try {
            const res = await fetch('/api/security/ip-whitelist', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemToDelete.id }),
            });
            if (!res.ok) {
                 const error = await res.json();
                 throw new Error(error.message);
            }
             toast({ title: 'Success', description: 'IP range removed from whitelist.' });
             fetchWhitelist(); // Refresh list
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || 'Failed to remove IP range.'});
        } finally {
            setItemToDelete(null);
        }
    }

  return (
    <Tabs defaultValue="logs">
        <TabsList className="grid grid-cols-2 w-full max-w-lg">
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="ip">IP Whitelisting</TabsTrigger>
        </TabsList>
        <TabsContent value="logs" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>System Activity Log</CardTitle>
                    <CardDescription>A comprehensive, filterable audit trail of all administrative actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <Input placeholder='Search logs...' className="flex-grow" value={logQuery} onChange={(e) => setLogQuery(e.target.value)} />
                        <DateRangePicker date={logDateRange} onDateChange={setLogDateRange} />
                        <Button onClick={fetchLogs} disabled={logLoading}>
                          {logLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                          Search
                        </Button>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>IP Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}><TableCell colSpan={5} className="py-4"><div className="animate-pulse bg-muted h-5 rounded-md"></div></TableCell></TableRow>
                                    ))
                                ) : logs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell>{format(new Date(log.timestamp), 'dd MMM, HH:mm:ss')}</TableCell>
                                        <TableCell className="font-medium">{log.userEmail}</TableCell>
                                        <TableCell>
                                            <Badge variant={log.status === 'Failure' ? 'destructive' : 'secondary'}>{log.action}</Badge>
                                        </TableCell>
                                        <TableCell>{log.details || 'N/A'}</TableCell>
                                        <TableCell className="font-mono">{log.ipAddress}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="ip" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>IP Whitelisting</CardTitle>
                    <CardDescription>Manage IP address ranges permitted to access this admin panel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="space-y-4">
                         <h3 className="font-semibold">Add New IP Range</h3>
                         <div className="flex items-end gap-4">
                             <div className="flex-grow">
                                <Label htmlFor="ip-range">IP Range (CIDR format)</Label>
                                <Input id="ip-range" placeholder="e.g., 196.188.10.0/24" value={newCidr} onChange={e => setNewCidr(e.target.value)} />
                             </div>
                             <div className="flex-grow">
                                <Label htmlFor="ip-label">Label</Label>
                                <Input id="ip-label" placeholder="e.g., Bole Office WiFi" value={newLabel} onChange={e => setNewLabel(e.target.value)}/>
                             </div>
                             <Button onClick={handleAddIp} disabled={isAdding}>
                               {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2"/>}
                               Add Range
                             </Button>
                         </div>
                     </div>
                     <Separator />
                    <div className="space-y-4">
                        <h3 className="font-semibold">Allowed IP Ranges</h3>
                        <div className="rounded-md border">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Range (CIDR)</TableHead>
                                        <TableHead>Label</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {whitelistLoading ? (
                                        <TableRow><TableCell colSpan={3} className="py-4 text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                                    ) : whitelist.map(ip => (
                                        <TableRow key={ip.id}>
                                            <TableCell className="font-mono">{ip.cidr}</TableCell>
                                            <TableCell>{ip.label}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => setItemToDelete(ip)}>Remove</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>

     <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action will permanently remove the IP range <span className="font-semibold">{itemToDelete?.cidr}</span> from the whitelist.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteIp} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
