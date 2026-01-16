
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { DateRangePicker } from '@/components/transactions/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { format } from "date-fns";

interface AuditLog {
  id: number;
  timestamp: string;
  userEmail: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  status: string;
}

export default function UsersAuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (dateRange?.from) params.append('from', dateRange.from.toISOString());
    if (dateRange?.to) params.append('to', dateRange.to.toISOString());

    try {
      const res = await fetch(`/api/security/activity-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [query, dateRange]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>System Users Audit Trail</CardTitle>
        <CardDescription>A detailed log of all actions performed by system users.</CardDescription>
      </CardHeader>
      <CardContent>
          <div className="flex items-center gap-4 mb-4">
              <Input placeholder='Search by user email, action, details...' className="flex-grow" value={query} onChange={(e) => setQuery(e.target.value)} />
              <DateRangePicker date={dateRange} onDateChange={setDateRange} />
              <Button onClick={fetchLogs} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
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
                {isLoading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}><TableCell colSpan={5} className="py-4"><div className="animate-pulse bg-muted h-5 rounded-md"></div></TableCell></TableRow>
                    ))
                ) : logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm:ss')}</TableCell>
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
  );
}
