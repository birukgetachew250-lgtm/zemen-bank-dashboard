'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, BarChart3, TrendingUp, CircleDollarSign, CheckCircle } from 'lucide-react';
import { DateFilter } from '@/components/dashboard/DateFilter';

const generateDailyData = (days: number) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dau: Math.floor(80000 + Math.random() * 20000 + i * 500),
      mau: Math.floor(1200000 + Math.random() * 100000 + i * 5000),
      txVolume: Math.floor(150000 + Math.random() * 30000 + i * 1000),
      txValue: Math.floor(25000000 + Math.random() * 5000000 + i * 100000),
    };
  });
};

const overviewData = {
    dau: "98,450",
    mau: "1,320,100",
    txVolume: "175,890",
    txValue: "ETB 28,945,600",
    successRate: "99.7%",
};

const dailyData = generateDailyData(30);

export default function OverviewMetricsPage() {
  const [dateRange, setDateRange] = useState('30d');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Overview Metrics</CardTitle>
          <CardDescription>Key performance indicators for business health and user adoption.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-end">
          <DateFilter value={dateRange} onChange={setDateRange} />
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard title="Daily Active Users (DAU)" value={overviewData.dau} icon={<Users />} />
        <MetricCard title="Monthly Active Users (MAU)" value={overviewData.mau} icon={<Users />} />
        <MetricCard title="Transaction Volume" value={overviewData.txVolume} icon={<BarChart3 />} />
        <MetricCard title="Transaction Value" value={overviewData.txValue} icon={<CircleDollarSign />} />
        <MetricCard title="Success Rate" value={overviewData.successRate} icon={<CheckCircle />} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ChartCard title="Active Users (DAU vs MAU)">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}/>
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="dau" name="DAU" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    <Area yAxisId="right" type="monotone" dataKey="mau" name="MAU" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
         <ChartCard title="Transaction Volume & Value">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis yAxisId="left" unit="M"
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} 
                        fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" unit="k"
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                        fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}/>
                     <Legend />
                     <Bar yAxisId="left" dataKey="txValue" name="Value (ETB)" fill="#8884d8" radius={[4, 4, 0, 0]} />
                     <Bar yAxisId="right" dataKey="txVolume" name="Volume" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

const MetricCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);


const ChartCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
)
