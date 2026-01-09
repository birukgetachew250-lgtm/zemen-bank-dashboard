'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, UserPlus, MapPin, PersonStanding } from 'lucide-react';
import { DateFilter } from '@/components/dashboard/DateFilter';

const regions = ['All', 'Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Somali', 'Afar'];
const channels = ['All', 'Agent', 'App', 'USSD'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const inclusionData = {
    unbankedOnboarded: "12,540",
    ruralVsUrban: "35% / 65%",
    agentSignups: "45%",
    genderDistribution: "60% M / 40% F",
};

const onboardingData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2025, i, 1).toLocaleString('default', { month: 'short' }),
    onboarded: 10000 + Math.random() * 2000 + i * 500,
}));

const genderData = [
  { name: 'Male', value: 60 },
  { name: 'Female', value: 40 },
];

const channelData = [
  { name: 'Agent', value: 45 },
  { name: 'App', value: 35 },
  { name: 'USSD', value: 20 },
];

const EthiopiaMap = () => (
    <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Interactive Map of Ethiopia Placeholder</p>
    </div>
);

export default function FinancialInclusionPage() {
  const [dateRange, setDateRange] = useState('90d');
  const [region, setRegion] = useState('All');

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
            <CardTitle>Financial Inclusion Insights</CardTitle>
            <CardDescription>Track progress on unbanked onboarding and regional service penetration.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-end gap-4">
                <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Region" /></SelectTrigger>
                    <SelectContent>{regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
                <DateFilter value={dateRange} onChange={setDateRange} />
            </CardContent>
        </Card>
      
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Unbanked Onboarded" value={inclusionData.unbankedOnboarded} icon={<UserPlus />} />
            <MetricCard title="Rural / Urban Split" value={inclusionData.ruralVsUrban} icon={<MapPin />} />
            <MetricCard title="Agent-driven Signups" value={inclusionData.agentSignups} icon={<Users />} />
            <MetricCard title="Gender Distribution" value={inclusionData.genderDistribution} icon={<PersonStanding />} />
        </div>

        <Card>
            <CardHeader><CardTitle>Regional Penetration</CardTitle></CardHeader>
            <CardContent><EthiopiaMap /></CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            <ChartCard title="Monthly Onboarding Trend">
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={onboardingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Area type="monotone" dataKey="onboarded" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Onboarding by Channel">
                 <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {channelData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Gender Distribution">
                 <ResponsiveContainer width="100%" height={250}>
                     <PieChart>
                        <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Legend />
                    </PieChart>
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
        <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);
