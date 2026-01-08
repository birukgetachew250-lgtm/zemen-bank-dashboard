
'use client'

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertTriangle, XCircle, Clock, Server, Layers, RotateCw } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ServiceStatus = 'up' | 'degraded' | 'down';

interface Microservice {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number;
  lastHeartbeat: string;
  version: string;
  instances: number;
  restarts: number;
  domain: 'Core Banking' | 'Payments' | 'User Management' | 'Compliance';
}

const mockServices: Microservice[] = [
  { id: 'auth', name: 'Auth Service', status: 'up', uptime: 99.98, lastHeartbeat: '10s ago', version: '1.2.4', instances: 3, restarts: 0, domain: 'User Management' },
  { id: 'accounts', name: 'Account Service', status: 'up', uptime: 99.99, lastHeartbeat: '5s ago', version: '2.0.1', instances: 5, restarts: 1, domain: 'Core Banking' },
  { id: 'payments', name: 'Payments Service', status: 'degraded', uptime: 98.50, lastHeartbeat: '45s ago', version: '3.1.0', instances: 8, restarts: 5, domain: 'Payments' },
  { id: 'wallets', name: 'Wallets Service', status: 'up', uptime: 100.00, lastHeartbeat: '8s ago', version: '1.5.2', instances: 4, restarts: 0, domain: 'Payments' },
  { id: 'transfers', name: 'Transfers Service', status: 'up', uptime: 99.95, lastHeartbeat: '12s ago', version: '2.2.0', instances: 5, restarts: 2, domain: 'Payments' },
  { id: 'notifications', name: 'Notifications Service', status: 'up', uptime: 99.99, lastHeartbeat: '3s ago', version: '1.1.0', instances: 2, restarts: 0, domain: 'User Management' },
  { id: 'remittance', name: 'Remittance Gateway', status: 'down', uptime: 95.20, lastHeartbeat: '5m ago', version: '1.8.0', instances: 0, restarts: 12, domain: 'Payments' },
  { id: 'kyc', name: 'KYC Verification', status: 'up', uptime: 99.9, lastHeartbeat: '25s ago', version: '1.0.0', instances: 2, restarts: 1, domain: 'Compliance' },
  { id: 'fraud-detection', name: 'Fraud Detection Engine', status: 'degraded', uptime: 98.9, lastHeartbeat: '1m ago', version: '2.5.1', instances: 4, restarts: 3, domain: 'Compliance' },
];

const statusConfig: { [key in ServiceStatus]: { Icon: React.ElementType, color: string, label: string } } = {
  up: { Icon: CheckCircle, color: 'text-green-500', label: 'Up' },
  degraded: { Icon: AlertTriangle, color: 'text-yellow-500', label: 'Degraded' },
  down: { Icon: XCircle, color: 'text-red-500', label: 'Down' },
};

export default function MicroservicesHealthPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredServices = useMemo(() => {
    return mockServices.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const healthyCount = mockServices.filter(s => s.status === 'up').length;
  const criticalAlerts = mockServices.filter(s => s.status === 'down').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Overall System Health" value={`${((healthyCount / mockServices.length) * 100).toFixed(1)}%`} icon={<CheckCircle />} color="bg-green-100 text-green-800" />
        <StatsCard title="Healthy Services" value={`${healthyCount}/${mockServices.length}`} icon={<Server />} color="bg-blue-100 text-blue-800" />
        <StatsCard title="Critical Alerts" value={criticalAlerts.toString()} icon={<AlertTriangle />} color="bg-red-100 text-red-800" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Microservices Health</CardTitle>
          <CardDescription>A high-level overview of all microservices with instant visibility into their operational status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search service name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="up">Healthy</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
                <SelectItem value="down">Unhealthy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Uptime (30d)</TableHead>
                  <TableHead>Instances</TableHead>
                  <TableHead>Restarts</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Last Heartbeat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map(service => {
                  const { Icon, color, label } = statusConfig[service.status];
                  return (
                    <TableRow key={service.id}>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Icon className={cn("h-5 w-5", color)} />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{service.name}</span>
                          <span className="text-xs text-muted-foreground">{service.domain}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.uptime > 99 ? 'secondary' : 'destructive'} className={cn({'bg-green-100 text-green-800': service.uptime > 99, 'bg-red-100 text-red-800': service.uptime <= 99})}>{service.uptime.toFixed(2)}%</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Layers className="h-4 w-4 text-muted-foreground"/> {service.instances}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <RotateCw className="h-4 w-4 text-muted-foreground"/> {service.restarts}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.version}</Badge>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground"/> {service.lastHeartbeat}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
