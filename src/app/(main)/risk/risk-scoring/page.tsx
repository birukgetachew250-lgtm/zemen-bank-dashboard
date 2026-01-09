'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gauge, TrendingUp, UserCheck, UserX, AlertTriangle, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const scoreData = {
    averageScore: 42,
    highRiskCustomers: 128,
    lowRiskCustomers: "85%",
    trend: "stable",
};

const riskDistributionData = [
  { name: '0-20 (Very Low)', count: 15000 },
  { name: '21-40 (Low)', count: 35000 },
  { name: '41-60 (Medium)', count: 8000 },
  { name: '61-80 (High)', count: 1200 },
  { name: '81-100 (Very High)', count: 128 },
];

const topRiskyCustomers = [
    { id: 1, cif: '009876', name: 'Al Shabaab', score: 98, reason: 'Sanctions List Match' },
    { id: 2, cif: '001234', name: 'Juan Carlos', score: 95, reason: 'Unusual Remittance Pattern' },
    { id: 3, cif: '005678', name: 'Wei Zhang', score: 91, reason: 'High Velocity P2P' },
];

const topRiskyTransactions = [
    { id: 'tx1', type: 'Remittance', amount: 500000, score: 96, reason: 'Exceeds Profile Limit' },
    { id: 'tx2', type: 'P2P', amount: 25000, score: 90, reason: 'Rapid Fire Transfers' },
];

const ScoreCard = ({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

export default function RiskScoringPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ScoreCard title="Average Customer Risk Score" value={scoreData.averageScore} icon={<Gauge />} description="out of 100" />
        <ScoreCard title="High-Risk Customers" value={scoreData.highRiskCustomers} icon={<UserX />} description="Score > 80" />
        <ScoreCard title="Low-Risk Customers" value={scoreData.lowRiskCustomers} icon={<UserCheck />} description="Score < 40" />
        <ScoreCard title="Risk Trend (30d)" value={scoreData.trend} icon={<TrendingUp />} description="+2% from last month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Customer Risk Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={riskDistributionData} layout="vertical" margin={{ left: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} fontSize={12} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                        <Legend />
                        <Bar dataKey="count" name="Customers" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Top Risky Entities</CardTitle>
            </CardHeader>
            <CardContent>
                <h4 className="text-sm font-semibold mb-2">Customers</h4>
                <div className="rounded-md border text-sm">
                    {topRiskyCustomers.map(c => (
                        <div key={c.id} className="flex justify-between items-center p-2 border-b last:border-b-0">
                            <div>
                                <div className="font-medium">{c.name} ({c.cif})</div>
                                <div className="text-xs text-muted-foreground">{c.reason}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="destructive">{c.score}</Badge>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><ArrowRight /></Button>
                            </div>
                        </div>
                    ))}
                </div>
                <h4 className="text-sm font-semibold mb-2 mt-4">Transactions</h4>
                 <div className="rounded-md border text-sm">
                    {topRiskyTransactions.map(t => (
                        <div key={t.id} className="flex justify-between items-center p-2 border-b last:border-b-0">
                            <div>
                                <div className="font-medium">{t.type} - ETB {t.amount.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">{t.reason}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="destructive">{t.score}</Badge>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><ArrowRight /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
