
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch";
import { CheckCircle, XCircle, Power, Edit, Save, Trash2, Loader2, PlusCircle, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export interface Integration {
    id: number;
    name: string;
    type: 'WSO2' | 'Flexcube' | 'SMS';
    baseUrl: string;
    username?: string | null;
    password?: string | null;
    status: 'Connected' | 'Disconnected';
    isProduction: boolean;
}

const statusConfig: { [key in Integration['status']]: { Icon: React.ElementType, color: string } } = {
  'Connected': { Icon: CheckCircle, color: 'text-green-500' },
  'Disconnected': { Icon: XCircle, color: 'text-red-500' },
};

export default function IntegrationConfigPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIntegration, setSelectedIntegration] = useState<Partial<Integration>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
    const [integrationToDelete, setIntegrationToDelete] = useState<Integration | null>(null);

    const { toast } = useToast();

    const fetchIntegrations = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/integrations');
            if (!res.ok) throw new Error("Failed to fetch integrations.");
            const data = await res.json();
            setIntegrations(data);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);

    const handleAddNew = () => {
      setSelectedIntegration({
        name: '',
        type: 'WSO2',
        baseUrl: '',
        username: '',
        password: '',
        isProduction: false,
        status: 'Disconnected'
      });
      setDialogMode('add');
      setIsDialogOpen(true);
    }
    
    const handleEdit = (integration: Integration) => {
      setSelectedIntegration({ ...integration, password: '' });
      setDialogMode('edit');
      setIsDialogOpen(true);
    };
    
    const handleDeleteClick = (integration: Integration) => {
      setIntegrationToDelete(integration);
    }

    const handleConfirmDelete = async () => {
      if (!integrationToDelete) return;

      try {
        const res = await fetch(`/api/integrations?id=${integrationToDelete.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete');
        toast({ title: 'Success', description: 'Integration deleted.' });
        fetchIntegrations();
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setIntegrationToDelete(null);
      }
    }

    const handleSave = async () => {
      setIsSaving(true);
      try {
        const method = dialogMode === 'edit' ? 'PUT' : 'POST';
        const res = await fetch('/api/integrations', {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedIntegration)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        toast({ title: 'Success', description: `Configuration ${dialogMode === 'edit' ? 'updated' : 'created'}.` });
        setIsDialogOpen(false);
        fetchIntegrations();
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
      } finally {
        setIsSaving(false);
      }
    };
    
    const handleFieldChange = (field: keyof Integration, value: any) => {
        setSelectedIntegration(prev => ({ ...prev, [field]: value }));
    };

    return (
      <>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Integration Services</CardTitle>
                    <CardDescription>Manage connections to core banking, middleware, and other third-party APIs.</CardDescription>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Integration
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : (
                <div className="rounded-md border">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Service</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Base URL</TableHead>
                              <TableHead>Environment</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {integrations.map(p => {
                              const { Icon, color } = statusConfig[p.status];
                              return (
                                  <TableRow key={p.id}>
                                      <TableCell className="font-medium">{p.name}</TableCell>
                                      <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                                      <TableCell className="font-mono text-xs">{p.baseUrl}</TableCell>
                                      <TableCell>
                                        <Badge variant={p.isProduction ? 'destructive' : 'secondary'}>{p.isProduction ? 'Production' : 'Test'}</Badge>
                                      </TableCell>
                                      <TableCell>
                                          <div className="flex items-center gap-2">
                                              <Icon className={cn("h-4 w-4", color)} />
                                              <span>{p.status}</span>
                                          </div>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteClick(p)}><Trash2 className="h-4 w-4"/></Button>
                                      </TableCell>
                                  </TableRow>
                              )
                          })}
                      </TableBody>
                  </Table>
                </div>
                )}
            </CardContent>
        </Card>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dialogMode === 'edit' ? 'Edit' : 'Add'} Integration</DialogTitle>
                    <DialogDescription>Manage configuration details for the service.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <ConfigItem label="Service Name">
                    <Input value={selectedIntegration.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} />
                  </ConfigItem>
                  <ConfigItem label="Service Type">
                    <Select value={selectedIntegration.type || ''} onValueChange={(val) => handleFieldChange('type', val)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WSO2">WSO2</SelectItem>
                        <SelectItem value="Flexcube">Flexcube</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </ConfigItem>
                  <ConfigItem label="Base URL">
                    <Input value={selectedIntegration.baseUrl || ''} onChange={(e) => handleFieldChange('baseUrl', e.target.value)} />
                  </ConfigItem>
                  {selectedIntegration.type !== 'Flexcube' && (
                    <>
                      <ConfigItem label="Username">
                          <Input value={selectedIntegration.username || ''} onChange={(e) => handleFieldChange('username', e.target.value)} />
                      </ConfigItem>
                      <ConfigItem label="Password">
                          <Input type="password" placeholder={dialogMode === 'edit' ? 'Enter new password to update' : ''} onChange={(e) => handleFieldChange('password', e.target.value)} />
                      </ConfigItem>
                    </>
                  )}
                   <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <Label>Production Mode</Label>
                      </div>
                      <Switch checked={selectedIntegration.isProduction || false} onCheckedChange={(checked) => handleFieldChange('isProduction', checked)} />
                  </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Save Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <AlertDialog open={!!integrationToDelete} onOpenChange={(open) => !open && setIntegrationToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently delete the "{integrationToDelete?.name}" integration configuration. This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
}

const ConfigItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-right">{label}</Label>
        <div className="col-span-2">{children}</div>
    </div>
);
