
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, Clock, Download, GitCompareArrows, PlusCircle, RotateCcw, ShieldQuestion, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';

interface Backup {
    id: string;
    timestamp: Date;
    createdBy: string;
    description: string;
    type: 'Full' | 'Partial';
    services: string[];
    status: 'Completed' | 'InProgress';
}

const mockBackups: Backup[] = [
    { id: 'bkp_1', timestamp: new Date(Date.now() - 2 * 3600 * 1000), createdBy: 'admin@zemenbank.com', description: 'Pre-deployment of v1.2', type: 'Full', services: ['All'], status: 'Completed' },
    { id: 'bkp_2', timestamp: new Date(Date.now() - 24 * 3600 * 1000), createdBy: 'system', description: 'Daily automatic backup', type: 'Full', services: ['All'], status: 'Completed' },
    { id: 'bkp_3', timestamp: new Date(Date.now() - 5 * 60 * 1000), createdBy: 'ops@zemenbank.com', description: 'Updating transaction limits', type: 'Partial', services: ['Limits Service', 'Config Service'], status: 'InProgress' },
];

export default function BackupRestorePage() {
    const [isCreateOpen, setCreateOpen] = useState(false);

  return (
    <>
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Configuration Backup & Restore</CardTitle>
                    <CardDescription>Manage versioned snapshots of all service configurations for rollback and recovery.</CardDescription>
                </div>
                 <Button onClick={() => setCreateOpen(true)}><PlusCircle className="mr-2"/>Create New Backup</Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Created By</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockBackups.map(b => (
                                <TableRow key={b.id}>
                                    <TableCell>{format(b.timestamp, 'dd MMM yyyy, HH:mm')}</TableCell>
                                    <TableCell className="font-medium">{b.description}</TableCell>
                                    <TableCell><Badge variant="outline">{b.type}</Badge></TableCell>
                                    <TableCell>{b.createdBy}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {b.status === 'Completed' ? <CheckCheck className="text-green-500" /> : <Clock className="text-yellow-500" />}
                                            {b.status}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-1">
                                        <Button variant="ghost" size="sm" title="Restore"><RotateCcw /></Button>
                                        <Button variant="ghost" size="sm" title="Compare"><GitCompareArrows /></Button>
                                        <Button variant="ghost" size="sm" title="Download"><Download /></Button>
                                        <Button variant="ghost" size="sm" title="Delete" className="text-red-500 hover:text-red-600"><Trash2 /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Configuration Backup</DialogTitle>
                    <DialogDescription>Create a recoverable snapshot of service configurations.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="desc">Description / Tag</Label>
                        <Input id="desc" placeholder="e.g., 'Before limits update for March'" />
                    </div>
                     <div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="include-secrets" />
                            <Label htmlFor="include-secrets" className="flex items-center gap-1">
                                Include secrets (API keys, credentials)
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <ShieldQuestion className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="max-w-xs">Warning: Including secrets creates a highly sensitive backup file. Requires secondary approval.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button>Create Backup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
