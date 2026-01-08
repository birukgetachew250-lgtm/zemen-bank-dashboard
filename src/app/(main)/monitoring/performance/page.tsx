
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Gauge, Timer, AlertOctagon, Cpu, MemoryStick, BarChart } from 'lucide-react';

const services = [
  { id: 'payments', name: 'Payments Service' },
  { id: 'transfers', name: 'Transfers Service' },
  { id: 'auth', name: 'Auth Service' },
  { id: 'all', name: 'All Services Overview' },
];

const timeRanges = [
  { value: '5m', label: 'Last 5 Minutes' },
  { value: '1h', label: 'Last 1 Hour' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
];

const generateData = (numPoints: number) => {
  return Array.from({ length: numPoints }, (_, i) => ({
    time: new Date(Date.now() - (numPoints - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    latency: Math.floor(Math.random() * (150 - 50) + 50),
    rps: Math.floor(Math.random() * (1200 - 800) + 800),
    errors: parseFloat((Math.random() * 0.5).toFixed(2)),
  }));
};

const performanceData = {
  '5m': generateData(5),
  '1h': generateData(60),
  '24h': generateData(24 * 6),
  '7d': generateData(7 * 24),
};

const currentMetrics = {
    latency: 89,
    errorRate: 0.1,
    rps: 1024,
    cpu: 45,
    memory: 62
}


const MetricCard = ({ title, value, icon, unit }: { title: string, value: number, icon: React.ReactNode, unit: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}<span className="text-xs text-muted-foreground ml-1">{unit}</span></div>
        </CardContent>
    </Card>
);

export default function PerformanceMetricsPage() {
  const [selectedService, setSelectedService] = useState('payments');
  const [timeRange, setTimeRange] = useState('1h');
  const data = performanceData[timeRange as keyof typeof performanceData];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Deep dive into resource consumption and performance KPIs per microservice to identify bottlenecks.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard title="Avg Latency (p95)" value={currentMetrics.latency} icon={<Timer className="h-4 w-4 text-muted-foreground" />} unit="ms"/>
        <MetricCard title="Request Rate" value={currentMetrics.rps} icon={<BarChart className="h-4 w-4 text-muted-foreground" />} unit="rps"/>
        <MetricCard title="Error Rate" value={currentMetrics.errorRate} icon={<AlertOctagon className="h-4 w-4 text-muted-foreground" />} unit="%"/>
        <MetricCard title="CPU Usage" value={currentMetrics.cpu} icon={<Cpu className="h-4 w-4 text-muted-foreground" />} unit="%"/>
        <MetricCard title="Memory Usage" value={currentMetrics.memory} icon={<MemoryStick className="h-4 w-4 text-muted-foreground" />} unit="%"/>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Latency (p95)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis unit="ms" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}/>
                        <Area type="monotone" dataKey="latency" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Request Rate & Error Rate</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" unit="rps" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" unit="%" fontSize={12} tickLine={false} axisLine={false}/>
                        <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}/>
                        <Area yAxisId="left" type="monotone" dataKey="rps" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="RPS" />
                        <Area yAxisId="right" type="monotone" dataKey="errors" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} name="Error Rate" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
