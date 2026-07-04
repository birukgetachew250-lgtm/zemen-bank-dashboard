'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Trash2, Edit, ChevronDown, ChevronRight, HardHat } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type RuleAction = 'Alert' | 'Block' | 'Hold';
interface FraudRule {
    id: string;
    name: string;
    condition: string;
    action: RuleAction;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    enabled: boolean;
}

const mockRules: FraudRule[] = [
    { id: 'rule1', name: 'High Value Tx / New Device', condition: 'Tx Amount > 50,000 ETB AND New Device', action: 'Hold', priority: 'Critical', enabled: true },
    { id: 'rule2', name: 'Rapid Velocity', condition: '> 5 Txs in 10 mins', action: 'Alert', priority: 'High', enabled: true },
    { id: 'rule3', name: 'Geofence Anomaly', condition: 'Tx outside Ethiopia', action: 'Alert', priority: 'Medium', enabled: true },
    { id: 'rule4', name: 'Dormant Account Activity', condition: 'First Tx in > 180 days', action: 'Hold', priority: 'High', enabled: true },
    { id: 'rule5', name: 'Old rule to be deprecated', condition: 'Tx Amount > 100,000 ETB', action: 'Alert', priority: 'Low', enabled: false },
];

interface FlaggedTransaction {
    id: string;
    timestamp: Date;
    amount: number;
    ruleTriggered: string;
    riskScore: number;
    customerPhone: string;
    status: 'New' | 'Investigating' | 'Resolved';
}

const mockFlaggedTxs: FlaggedTransaction[] = [
    { id: 'flag1', timestamp: new Date(), amount: 75000, ruleTriggered: 'High Value Tx / New Device', riskScore: 92, customerPhone: '0911223344', status: 'New' },
    { id: 'flag2', timestamp: new Date(Date.now() - 2 * 60000), amount: 1200, ruleTriggered: 'Rapid Velocity', riskScore: 78, customerPhone: '0922334455', status: 'New' },
    { id: 'flag3', timestamp: new Date(Date.now() - 5 * 60000), amount: 500, ruleTriggered: 'Rapid Velocity', riskScore: 75, customerPhone: '0922334455', status: 'Investigating' },
    { id: 'flag4', timestamp: new Date(Date.now() - 10 * 60000), amount: 25000, ruleTriggered: 'Dormant Account Activity', riskScore: 85, customerPhone: '0933445566', status: 'Resolved' },
];

const priorityColors = {
    Low: 'bg-gray-500',
    Medium: 'bg-yellow-500',
    High: 'bg-orange-500',
    Critical: 'bg-red-600',
}

export default function FraudMonitoringPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRule, setFilterRule] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredTxs = mockFlaggedTxs.filter(tx => {
      const matchSearch = tx.customerPhone.includes(searchTerm) || tx.id.includes(searchTerm);
      const matchRule = filterRule === 'all' || tx.ruleTriggered === filterRule;
      const ruleData = mockRules.find(r => r.name === tx.ruleTriggered);
      const matchPriority = filterPriority === 'all' || ruleData?.priority === filterPriority;
      return matchSearch && matchRule && matchPriority;
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="relative overflow-hidden rounded-2xl p-6 animate-fade-up" style={{ background: 'linear-gradient(135deg, hsl(24, 90%, 50%) 0%, hsl(14, 90%, 40%) 100%)' }}>
        <h1 className="text-3xl font-bold text-white relative z-10">Fraud Monitoring</h1>
        <p className="text-white/80 mt-2 relative z-10">Real-time transaction monitoring and rules engine.</p>
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card className="glass-card animate-fade-up">
                <CardHeader className="flex-row items-center justify-between">
                     <div>
                        <CardTitle>Fraud Detection Rules Engine</CardTitle>
                        <CardDescription>Define and manage the logic for detecting fraudulent transactions.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4"/> New Rule</Button>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                                {isOpen ? <ChevronDown /> : <ChevronRight />}
                                <span className="sr-only">Toggle Rules</span>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rule Name</TableHead>
                                        <TableHead>Condition</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockRules.map(rule => (
                                        <TableRow key={rule.id}>
                                            <TableCell className="font-medium">{rule.name}</TableCell>
                                            <TableCell className="font-mono text-xs">{rule.condition}</TableCell>
                                            <TableCell><Badge variant="outline">{rule.action}</Badge></TableCell>
                                            <TableCell>
                                                <Badge className={cn("text-white", priorityColors[rule.priority])}>
                                                    {rule.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={rule.enabled ? 'secondary' : 'destructive'} className={cn(rule.enabled && 'bg-green-100 text-green-800')}>
                                                    {rule.enabled ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
        
        <Card className="flex-grow flex flex-col glass-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
                <CardTitle>Live Fraud Monitoring Feed</CardTitle>
                <CardDescription>Real-time stream of transactions flagged by the rules engine.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                 <div className="flex items-center gap-4 mb-4">
                    <Input placeholder='Search Tx ID, Phone...' className="flex-grow" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <Select value={filterRule} onValueChange={setFilterRule}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by rule..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Rules</SelectItem>
                            {mockRules.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by priority..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            {Object.keys(priorityColors).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="rounded-md border flex-grow overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Customer Phone</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Rule Triggered</TableHead>
                                <TableHead>Risk Score</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTxs.length > 0 ? filteredTxs.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>{format(tx.timestamp, 'HH:mm:ss')}</TableCell>
                                    <TableCell className="font-mono">{tx.customerPhone}</TableCell>
                                    <TableCell>ETB {tx.amount.toLocaleString()}</TableCell>
                                    <TableCell><Badge variant="destructive">{tx.ruleTriggered}</Badge></TableCell>
                                    <TableCell className="font-semibold">{tx.riskScore}</TableCell>
                                    <TableCell><Badge variant={tx.status === 'New' ? 'default' : 'outline'}>{tx.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="secondary"><HardHat className="mr-2 h-4 w-4"/>Investigate</Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">No transactions found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
