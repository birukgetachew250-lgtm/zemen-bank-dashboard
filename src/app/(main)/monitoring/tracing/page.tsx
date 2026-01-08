
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Span {
  id: string;
  name: string;
  duration: number;
  offset: number;
  status: 'ok' | 'error';
  details?: Record<string, string>;
}

interface Trace {
  id: string;
  startTime: string;
  duration: number;
  services: string[];
  status: 'ok' | 'error';
  spans: Span[];
}

const mockTraces: Trace[] = [
  {
    id: 'trace-123-abc',
    startTime: '2023-10-30 10:05:15.123',
    duration: 245,
    services: ['frontend-gw', 'auth', 'wallets', 'transfers', 'notifications'],
    status: 'ok',
    spans: [
      { id: 's1', name: 'frontend-gw: POST /api/transfer', duration: 245, offset: 0, status: 'ok' },
      { id: 's2', name: 'auth: verifyToken', duration: 30, offset: 5, status: 'ok' },
      { id: 's3', name: 'wallets: getBalance', duration: 50, offset: 40, status: 'ok' },
      { id: 's4', name: 'transfers: execute', duration: 120, offset: 95, status: 'ok' },
      { id: 's5', name: 'wallets: debit', duration: 60, offset: 100, status: 'ok' },
      { id: 's6', name: 'wallets: credit', duration: 55, offset: 105, status: 'ok' },
      { id: 's7', name: 'notifications: sendSMS', duration: 30, offset: 215, status: 'ok' },
    ]
  },
  {
    id: 'trace-456-def',
    startTime: '2023-10-30 10:04:30.456',
    duration: 350,
    services: ['frontend-gw', 'auth', 'payments', 'interop-switch'],
    status: 'error',
    spans: [
      { id: 't1', name: 'frontend-gw: POST /api/billpay', duration: 350, offset: 0, status: 'error' },
      { id: 't2', name: 'auth: verifyToken', duration: 25, offset: 10, status: 'ok' },
      { id: 't3', name: 'payments: processBill', duration: 310, offset: 40, status: 'error', details: { error: 'true', 'error.message': 'Upstream provider timeout' } },
      { id: 't4', name: 'interop-switch: callProvider', duration: 300, offset: 45, status: 'error', details: { 'http.status_code': '504' } },
    ]
  },
];

const TraceSpan = ({ span, totalDuration, level }: { span: Span, totalDuration: number, level: number }) => {
    const width = (span.duration / totalDuration) * 100;
    const offset = (span.offset / totalDuration) * 100;
    
    return (
        <div className="relative my-1 py-1" style={{ paddingLeft: `${level * 20}px`}}>
            <div className="flex items-center text-xs">
                <span className="font-mono text-muted-foreground w-24 shrink-0">{span.duration}ms</span>
                <div className="flex-grow h-6 rounded bg-muted">
                    <div 
                        className={`h-full rounded ${span.status === 'error' ? 'bg-red-400' : 'bg-blue-400'}`}
                        style={{ marginLeft: `${offset}%`, width: `${width}%` }}
                    >
                        <span className="text-white text-[10px] pl-1 truncate block">{span.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function TransactionTracingPage() {
  const [query, setQuery] = useState('');
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(mockTraces[1]);

  const filteredTraces = useMemo(() => {
    if (!query) return mockTraces;
    return mockTraces.filter(t => t.id.includes(query) || t.services.some(s => s.includes(query)));
  }, [query]);

  return (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle>Distributed Transaction Tracing</CardTitle>
            <CardDescription>Trace a transaction's end-to-end journey across all microservices to debug failures.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trace List */}
            <div className="md:col-span-1 flex flex-col gap-4">
                <div className="flex gap-2">
                    <Input placeholder="Search Trace ID, Service..." value={query} onChange={e => setQuery(e.target.value)} />
                    <Button><Search /></Button>
                </div>
                <div className="rounded-md border flex-grow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Trace ID</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTraces.map(trace => (
                                <TableRow key={trace.id} onClick={() => setSelectedTrace(trace)} className="cursor-pointer" data-state={selectedTrace?.id === trace.id ? 'selected' : ''}>
                                    <TableCell className="font-mono text-xs">{trace.id}</TableCell>
                                    <TableCell>{trace.duration}ms</TableCell>
                                    <TableCell>
                                        <Badge variant={trace.status === 'error' ? 'destructive' : 'secondary'}>{trace.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Trace Details */}
            <div className="md:col-span-2 rounded-lg border p-4">
                {selectedTrace ? (
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                           <div>
                             <h3 className="font-semibold">Trace Details</h3>
                             <p className="font-mono text-sm text-muted-foreground">{selectedTrace.id}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-sm">Duration: <span className="font-bold">{selectedTrace.duration}ms</span></p>
                             <p className="text-sm">Services: <span className="font-bold">{selectedTrace.services.length}</span></p>
                           </div>
                        </div>
                        <Separator />
                        <div className="flex-grow overflow-auto py-4">
                           {selectedTrace.spans.map((span, index) => (
                               <TraceSpan key={span.id} span={span} totalDuration={selectedTrace.duration} level={index} />
                           ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Select a trace to view its details</p>
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
