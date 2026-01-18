
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { cn } from '@/lib/utils';
import { StatsCard, StatsCardSkeleton } from '@/components/dashboard/StatsCard';

export interface Integration {
    id: number;
    name: string;
    service: 'WSO2' | 'Flexcube' | 'SMS';
    endpointUrl: string;
    status: 'Connected' | 'Disconnected';
    isProduction: boolean;
}

type ApiStatus = 'Healthy' | 'Degraded' | 'Down';

interface ApiMetric extends Integration {
  apiStatus: ApiStatus;
  latency: number;
  uptime: number;
  errorRate: number;
  history: { time: string; latency: number }[];
}

const statusConfig: { [key in ApiStatus]: { Icon: React.ElementType, color: string, label: string } } = {
  Healthy: { Icon: CheckCircle, color: 'text-green-500', label: 'Healthy' },
  Degraded: { Icon: AlertTriangle, color: 'text-yellow-500', label: 'Degraded' },
  Down: { Icon: XCircle, color: 'text-red-500', label: 'Down' },
};

const generateMetrics = (integration: Integration): ApiMetric => {
  const isDown = integration.status === 'Disconnected' || Math.random() < 0.05;
  const isDegraded = !isDown && Math.random() < 0.15;
  const status = isDown ? 'Down' : isDegraded ? 'Degraded' : 'Healthy';

  const generateHistory = () => Array.from({ length: 12 }, (_, i) => ({
    time: `${11 - i}m ago`,
    latency: status === 'Down' ? 0 : Math.floor(Math.random() * (350 - 50) + 50 + (isDegraded ? 150 : 0)),
  })).reverse();

  return {
    ...integration,
    apiStatus: status,
    latency: status === 'Down' ? 0 : Math.floor(Math.random() * (350 - 50) + 50 + (isDegraded ? 200 : 0)),
    uptime: status === 'Down' ? Math.random() * (98 - 90) + 90 : Math.random() * (100 - 99.9) + 99.9,
    errorRate: status === 'Healthy' ? Math.random() * 0.5 : status === 'Degraded' ? Math.random() * (5 - 1) + 1 : 100,
    history: generateHistory(),
  };
};

export function ApiMonitoringClient({ initialIntegrations }: { initialIntegrations: Integration[] }) {
    const [metrics, setMetrics] = useState<ApiMetric[]>(() => initialIntegrations.map(generateMetrics));
    const [selectedApi, setSelectedApi] = useState<ApiMetric | null>(metrics[0] || null);

    const refreshMetrics = useCallback(() => {
        setMetrics(initialIntegrations.map(generateMetrics));
    }, [initialIntegrations]);

    useEffect(() => {
        const interval = setInterval(refreshMetrics, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [refreshMetrics]);

    useEffect(() => {
        // when metrics are refreshed, if a selectedApi exists, update its data
        if (selectedApi) {
            const updatedSelectedApi = metrics.find(m => m.id === selectedApi.id);
            if (updatedSelectedApi) {
                setSelectedApi(updatedSelectedApi);
            } else {
                setSelectedApi(metrics[0] || null); // fallback if it disappears
            }
        } else if (metrics.length > 0) {
            setSelectedApi(metrics[0]);
        }
    }, [metrics, selectedApi]);


    const overallStatus = useMemo(() => {
        const downCount = metrics.filter(m => m.apiStatus === 'Down').length;
        if (downCount > 0) return { status: 'Major Outage', color: 'bg-red-500' };
        const degradedCount = metrics.filter(m => m.apiStatus === 'Degraded').length;
        if (degradedCount > 0) return { status: 'Partial Outage', color: 'bg-yellow-500' };
        return { status: 'All Systems Operational', color: 'bg-green-500' };
    }, [metrics]);

    const healthyCount = metrics.filter(s => s.apiStatus === 'Healthy').length;
    const criticalAlerts = metrics.filter(s => s.apiStatus === 'Down').length;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatsCard title="Overall API Health" value={overallStatus.status} icon={<div className={cn("h-4 w-4 rounded-full", overallStatus.color)}></div>} />
                <StatsCard title="Healthy Endpoints" value={`${healthyCount}/${metrics.length}`} icon={<CheckCircle />} />
                <StatsCard title="Critical Alerts" value={criticalAlerts.toString()} icon={<AlertTriangle />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>External API Endpoints</CardTitle>
                            <Button variant="outline" size="sm" onClick={refreshMetrics}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
                        <CardDescription>Real-time health check of critical external API integrations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Service</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Avg. Latency</TableHead>
                                        <TableHead>Uptime (24h)</TableHead>
                                        <TableHead>Error Rate</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {metrics.map(metric => {
                                        const { Icon, color, label } = statusConfig[metric.apiStatus];
                                        return (
                                            <TableRow key={metric.id} onClick={() => setSelectedApi(metric)} className={cn("cursor-pointer", selectedApi?.id === metric.id && 'bg-muted')}>
                                                <TableCell className="font-medium">{metric.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Icon className={cn("h-4 w-4", color)} />
                                                        <span>{label}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{metric.latency}ms</TableCell>
                                                <TableCell>
                                                    <Badge variant={metric.uptime > 99.9 ? 'secondary' : 'destructive'} className={cn({'bg-green-100 text-green-800': metric.uptime > 99.9})}>
                                                        {metric.uptime.toFixed(2)}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{metric.errorRate.toFixed(2)}%</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedApi ? `Latency: ${selectedApi.name}` : 'Select a Service'}</CardTitle>
                        <CardDescription>Response time over the last 12 minutes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedApi ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={selectedApi.history}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} reversed />
                                    <YAxis domain={[0, 'dataMax + 50']} unit="ms" fontSize={12} tickLine={false} axisLine={false}/>
                                    <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                                    <Line type="monotone" dataKey="latency" name="Latency" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                Select a service to view its latency graph.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
